const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');

const createBooking = async (req, res) => {
  const { listingId, guestName, guestPhone, numberOfGuests, expectedCheckInTime, expectedCheckOutTime, checkIn, checkOut, totalPrice, paymentIntentId } = req.body;

  if (!listingId || !guestName || !guestPhone || !numberOfGuests || !expectedCheckInTime || !expectedCheckOutTime || !checkIn || !checkOut || !totalPrice) {
    return res.status(400).json({ error: 'Please provide all required booking fields' });
  }

  try {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.availableFrom && listing.availableTo) {
      const requestedStart = new Date(checkIn);
      requestedStart.setHours(0, 0, 0, 0);
      const requestedEnd = new Date(checkOut);
      requestedEnd.setHours(0, 0, 0, 0);
      
      const availFrom = new Date(listing.availableFrom);
      availFrom.setHours(0, 0, 0, 0);
      const availTo = new Date(listing.availableTo);
      availTo.setHours(0, 0, 0, 0);

      if (requestedStart < availFrom || requestedEnd > availTo) {
        return res.status(400).json({ error: `Selected dates are outside the listing availability window (${availFrom.toLocaleDateString()} to ${availTo.toLocaleDateString()}).` });
      }
    }

    const overlappingBookings = await Booking.find({
      listing: listingId,
      paymentStatus: { $ne: 'cancelled' },
      $or: [
        { checkIn: { $lte: checkOut }, checkOut: { $gte: checkIn } }
      ]
    });

    if (overlappingBookings.length > 0) {
      return res.status(400).json({ error: 'Dates are already booked for this property.' });
    }

    const booking = new Booking({
      user: req.user.id,
      listing: listingId,
      guestName,
      guestPhone,
      numberOfGuests,
      expectedCheckInTime,
      expectedCheckOutTime,
      checkIn,
      checkOut,
      totalPrice,
      paymentIntentId,
      paymentStatus: paymentIntentId ? 'paid' : 'pending'
    });

    const createdBooking = await booking.save();
    
    // Create Alert for Host
    const notification = new Notification({
      recipient: listing.host,
      booking: createdBooking._id,
      message: `NEW BOOKING: ${guestName} has booked your property "${listing.title}" from ${new Date(checkIn).toLocaleDateString()} to ${new Date(checkOut).toLocaleDateString()}. Guest Contact: ${guestPhone}`
    });
    await notification.save();

    // Populate for confirmation details
    const populatedBooking = await Booking.findById(createdBooking._id).populate({
      path: 'listing',
      populate: { path: 'host', select: 'name email contactPhone' }
    });

    res.status(201).json(populatedBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate({
      path: 'listing',
      populate: { path: 'host', select: 'name email contactPhone' }
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('user', 'id name email role').populate('listing');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getHostBookings = async (req, res) => {
  try {
    const listings = await Listing.find({ host: req.user.id }).select('_id');
    const listingIds = listings.map(listing => listing._id);
    const bookings = await Booking.find({ listing: { $in: listingIds } }).populate('user', 'name email').populate('listing');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getListingBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      listing: req.params.listingId,
      paymentStatus: { $ne: 'cancelled' } 
    }).select('checkIn checkOut');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateBooking = async (req, res) => {
  const { guestName, guestPhone, checkIn, checkOut } = req.body;

  try {
    const booking = await Booking.findById(req.params.id).populate('listing');
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (!booking.listing) {
      return res.status(404).json({ error: 'Associated listing not found' });
    }

    // Explicitly check for host ID from the listing
    let listingHostId = "";
    if (booking.listing.host) {
      listingHostId = booking.listing.host.toString();
    } else {
      // Fallback if listing was not fully populated or host field missing
      const fullListing = await Listing.findById(booking.listing);
      if (fullListing) listingHostId = fullListing.host.toString();
    }

    const currentUserId = req.user.id || req.user._id;
    const isGuest = booking.user.toString() === currentUserId;
    const isHost = listingHostId === currentUserId;
    const isAdmin = req.user.role === 'admin';

    if (!isGuest && !isHost && !isAdmin) {
      console.log('Auth Failure Details:', { currentUserId, bookingUser: booking.user.toString(), listingHostId, role: req.user.role });
      return res.status(401).json({ error: 'User not authorized to update this booking' });
    }

    if (booking.paymentStatus === 'cancelled') {
      return res.status(400).json({ error: 'Cancelled bookings cannot be updated' });
    }

    const requestedStart = checkIn ? new Date(checkIn) : booking.checkIn;
    const requestedEnd = checkOut ? new Date(checkOut) : booking.checkOut;

    if (booking.listing.availableFrom && booking.listing.availableTo) {
      if (requestedStart < new Date(booking.listing.availableFrom) || requestedEnd > new Date(booking.listing.availableTo)) {
        return res.status(400).json({ error: 'Updated dates are outside the listing availability window.' });
      }
    }

    const overlappingBookings = await Booking.find({
      listing: booking.listing._id,
      _id: { $ne: booking._id },
      paymentStatus: { $ne: 'cancelled' },
      $or: [
        { checkIn: { $lte: requestedEnd }, checkOut: { $gte: requestedStart } }
      ]
    });

    if (overlappingBookings.length > 0) {
      return res.status(400).json({ error: 'Updated dates conflict with another booking.' });
    }

    let datesChanged = false;
    if ((checkIn && new Date(checkIn).getTime() !== new Date(booking.checkIn).getTime()) || 
        (checkOut && new Date(checkOut).getTime() !== new Date(booking.checkOut).getTime())) {
      datesChanged = true;
    }

    if (datesChanged) {
      const oldDays = Math.ceil(Math.abs(new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24)) || 1;
      const newDays = Math.ceil(Math.abs(requestedEnd - requestedStart) / (1000 * 60 * 60 * 24)) || 1;
      
      const oldPrice = booking.totalPrice;
      const newPrice = booking.listing.price * newDays;

      if (!booking.originalPrice) booking.originalPrice = oldPrice;
      
      booking.totalPrice = newPrice;
      booking.isRescheduled = true;

      if (newPrice < oldPrice) {
        booking.refundAmount += (oldPrice - newPrice);
      } else if (newPrice > oldPrice) {
        booking.pendingAmount += (newPrice - oldPrice);
      }

      booking.checkIn = requestedStart;
      booking.checkOut = requestedEnd;
    }

    if (guestName) booking.guestName = guestName;
    if (guestPhone) booking.guestPhone = guestPhone;

    const updatedBooking = await booking.save();
    
    if (datesChanged) {
      const recipientId = isHost ? booking.user : booking.listing.host;
      let extraMessage = "";
      
      if (updatedBooking.refundAmount > 0) {
        extraMessage = `. A refund of ₹${updatedBooking.refundAmount} has been initiated to your account.`;
      } else if (updatedBooking.pendingAmount > 0) {
        extraMessage = `. Additional payment of ₹${updatedBooking.pendingAmount} is required. Please check your dashboard to pay.`;
      }

      const notification = new Notification({
        recipient: recipientId,
        booking: booking._id,
        message: `TRIP UPDATE: Booking for "${booking.listing.title}" has been updated to ${new Date(booking.checkIn).toLocaleDateString()} - ${new Date(booking.checkOut).toLocaleDateString()}${extraMessage}`
      });
      await notification.save();
    }

    res.json(updatedBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Request a reschedule (Host only)
// @route   PUT /api/bookings/:id/request-reschedule
const requestReschedule = async (req, res) => {
  console.log(`Incoming requestReschedule for booking: ${req.params.id}`);
  const { checkIn, checkOut } = req.body;
  try {
    const booking = await Booking.findById(req.params.id).populate('listing');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Auth: Host of the listing or Admin
    const isHost = booking.listing.host.toString() === (req.user.id || req.user._id);
    if (!isHost && req.user.role !== 'admin') {
      return res.status(401).json({ error: 'Only the property host can request a reschedule' });
    }

    booking.rescheduleRequest = {
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      status: 'pending'
    };

    await booking.save();

    const notification = new Notification({
      recipient: booking.user,
      booking: booking._id,
      message: `RESCHEDULE REQUEST: The host of "${booking.listing.title}" has proposed new dates: ${new Date(checkIn).toLocaleDateString()} - ${new Date(checkOut).toLocaleDateString()}. Please accept or decline in your dashboard.`
    });
    await notification.save();

    res.json({ message: 'Reschedule request sent to guest', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Respond to reschedule request (Guest only)
// @route   PUT /api/bookings/:id/respond-reschedule
const respondToReschedule = async (req, res) => {
  console.log(`Incoming respondToReschedule for booking: ${req.params.id}, Action: ${req.body.action}`);
  const { action } = req.body; // 'accepted' or 'declined'
  try {
    const booking = await Booking.findById(req.params.id).populate('listing');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.user.toString() !== (req.user.id || req.user._id)) {
      return res.status(401).json({ error: 'Only the guest can respond to this request' });
    }

    if (action === 'declined') {
      booking.rescheduleRequest.status = 'declined';
      await booking.save();
      
      await new Notification({
        recipient: booking.listing.host,
        booking: booking._id,
        message: `DECLINED: Guest has declined the reschedule request for "${booking.listing.title}".`
      }).save();

      return res.json({ message: 'Request declined', booking });
    }

    if (action === 'accepted') {
      const requestedStart = new Date(booking.rescheduleRequest.checkIn);
      const requestedEnd = new Date(booking.rescheduleRequest.checkOut);

      // Price Logic
      const newDays = Math.ceil(Math.abs(requestedEnd - requestedStart) / (1000 * 60 * 60 * 24)) || 1;
      const oldPrice = booking.totalPrice;
      const newPrice = booking.listing.price * newDays;

      if (!booking.originalPrice) booking.originalPrice = oldPrice;
      
      booking.totalPrice = newPrice;
      booking.isRescheduled = true;

      if (newPrice < oldPrice) {
        booking.refundAmount += (oldPrice - newPrice);
      } else if (newPrice > oldPrice) {
        booking.pendingAmount += (newPrice - oldPrice);
      }

      booking.checkIn = requestedStart;
      booking.checkOut = requestedEnd;
      booking.rescheduleRequest.status = 'accepted';

      const updatedBooking = await booking.save();

      await new Notification({
        recipient: booking.listing.host,
        booking: booking._id,
        message: `ACCEPTED: Guest has accepted the reschedule to ${requestedStart.toLocaleDateString()} - ${requestedEnd.toLocaleDateString()}.`
      }).save();

      return res.json({ message: 'Reschedule accepted and booking updated', booking: updatedBooking });
    }

    res.status(400).json({ error: 'Invalid action' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const currentUserId = req.user.id || req.user._id;
    if (booking.user.toString() !== currentUserId && req.user.role !== 'admin') {
      return res.status(401).json({ error: 'User not authorized to cancel this booking' });
    }

    booking.paymentStatus = 'cancelled';
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createBooking, getMyBookings, getAllBookings, getHostBookings, getListingBookings, updateBooking, cancelBooking, requestReschedule, respondToReschedule };

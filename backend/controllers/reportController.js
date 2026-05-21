const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const User = require('../models/User');

const getHostReport = async (req, res) => {
  const { month, year } = req.query; // month is 1-12
  if (!month || !year) return res.status(400).json({ error: 'Please provide month and year' });

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const listings = await Listing.find({ host: req.user.id }).select('_id');
    const listingIds = listings.map(l => l._id);

    const bookings = await Booking.find({
      listing: { $in: listingIds },
      createdAt: { $gte: startDate, $lt: endDate }
    });

    const totalBookings = bookings.length;
    const cancelledBookings = bookings.filter(b => b.paymentStatus === 'cancelled').length;
    const rescheduledBookings = bookings.filter(b => b.isRescheduled).length;
    const totalPayment = bookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    res.json({
      totalBookings,
      cancelledBookings,
      rescheduledBookings,
      totalPayment
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAdminReport = async (req, res) => {
  const { month, year, hostId } = req.query;
  if (!month || !year) return res.status(400).json({ error: 'Please provide month and year' });

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    let listingQuery = {};
    if (hostId && hostId !== 'all') {
      listingQuery.host = hostId;
    }

    const listings = await Listing.find(listingQuery).select('_id');
    const listingIds = listings.map(l => l._id);

    const bookings = await Booking.find({
      listing: { $in: listingIds },
      createdAt: { $gte: startDate, $lt: endDate }
    });

    const totalBookings = bookings.length;
    const cancelledBookings = bookings.filter(b => b.paymentStatus === 'cancelled').length;
    const rescheduledBookings = bookings.filter(b => b.isRescheduled).length;
    const totalPayment = bookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    res.json({
      totalBookings,
      cancelledBookings,
      rescheduledBookings,
      totalPayment
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getHostReport, getAdminReport };

const express = require('express');
const router = express.Router();
const { 
  createBooking, 
  getMyBookings, 
  getAllBookings, 
  getHostBookings, 
  getListingBookings, 
  updateBooking, 
  cancelBooking,
  requestReschedule,
  respondToReschedule
} = require('../controllers/bookingController');
const { protect, admin, isHost } = require('../middleware/auth');

router.route('/')
  .post(protect, createBooking)
  .get(protect, admin, getAllBookings);

router.route('/mybookings')
  .get(protect, getMyBookings);

router.route('/host')
  .get(protect, isHost, getHostBookings);

router.route('/listing/:listingId')
  .get(getListingBookings);

router.route('/:id/cancel')
  .put(protect, cancelBooking);

router.route('/:id/request-reschedule')
  .put(protect, isHost, requestReschedule);

router.route('/:id/respond-reschedule')
  .put(protect, respondToReschedule);

router.route('/:id')
  .put(protect, updateBooking);

module.exports = router;

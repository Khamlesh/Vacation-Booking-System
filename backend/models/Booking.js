const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  guestName: { type: String, required: true },
  guestPhone: { type: String, required: true },
  numberOfGuests: { type: Number, required: true, default: 1 },
  expectedCheckInTime: { type: String, required: true, default: '14:00' },
  expectedCheckOutTime: { type: String, required: true, default: '11:00' },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'cancelled'], default: 'pending' },
  paymentIntentId: { type: String },
  isRescheduled: { type: Boolean, default: false },
  refundAmount: { type: Number, default: 0 },
  pendingAmount: { type: Number, default: 0 },
  originalPrice: { type: Number },
  rescheduleRequest: {
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: { type: String, enum: ['none', 'pending', 'accepted', 'declined'], default: 'none' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);

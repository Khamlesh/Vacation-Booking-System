const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  propertyType: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ url: String, filename: String }],
  amenities: [String],
  maxGuests: { type: Number, default: 2 },
  checkInTime: { type: String, default: '14:00' },
  checkOutTime: { type: String, default: '11:00' },
  availableFrom: { type: Date },
  availableTo: { type: Date },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);

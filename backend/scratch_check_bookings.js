const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const dotenv = require('dotenv');

dotenv.config();

async function checkBookings() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/airbnb_clone');
    const bookings = await Booking.find({}, 'checkIn checkOut');
    console.log('Bookings:');
    bookings.forEach(b => {
      console.log(`Booking: From ${b.checkIn} To ${b.checkOut}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkBookings();

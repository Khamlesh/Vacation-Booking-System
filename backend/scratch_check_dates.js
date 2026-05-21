const mongoose = require('mongoose');
const Listing = require('./models/Listing');
const dotenv = require('dotenv');

dotenv.config();

async function checkDates() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/airbnb_clone');
    const listings = await Listing.find({}, 'title availableFrom availableTo');
    console.log('Listings and their availability dates:');
    listings.forEach(l => {
      console.log(`${l.title}: From ${l.availableFrom} To ${l.availableTo}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDates();

const mongoose = require('mongoose');
const Listing = require('./models/Listing');
const dotenv = require('dotenv');

dotenv.config();

async function find2046() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/airbnb_clone');
    const listings = await Listing.find({
      $or: [
        { availableFrom: { $gte: new Date(2040, 0, 1) } },
        { availableTo: { $gte: new Date(2040, 0, 1) } }
      ]
    });
    if (listings.length > 0) {
      console.log(`Found ${listings.length} listings with dates in 2040+:`);
      listings.forEach(l => {
        console.log(`${l.title}: From ${l.availableFrom} To ${l.availableTo}`);
      });
    } else {
      console.log('No listings found with dates in 2040+');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

find2046();

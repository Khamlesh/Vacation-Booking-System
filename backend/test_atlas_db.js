const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const User = require('./models/User');
    const Listing = require('./models/Listing');
    const users = await User.countDocuments();
    const listings = await Listing.countDocuments();
    console.log('Atlas DB Users count:', users);
    console.log('Atlas DB Listings count:', listings);
    process.exit(0);
  })
  .catch(err => {
    console.log('Failed to connect to Atlas DB:', err.message);
    process.exit(1);
  });

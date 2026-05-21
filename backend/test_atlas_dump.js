const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const User = require('./models/User');
    const Listing = require('./models/Listing');
    const users = await User.find().select('name email role');
    const listings = await Listing.find().select('title host price');
    console.log('Users:', users);
    console.log('Listings:', listings);
    process.exit(0);
  })
  .catch(err => {
    console.log('Failed to connect to Atlas DB:', err.message);
    process.exit(1);
  });

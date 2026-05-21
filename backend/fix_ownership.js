const mongoose = require('mongoose');
const User = require('./models/User');
const Listing = require('./models/Listing');
require('dotenv').config();

const fix = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const hosts = await User.find({ role: 'host' });
    
    if (hosts.length === 0) {
      console.log('No hosts found in database.');
      process.exit();
    }

    console.log(`Assigning listings across ${hosts.length} hosts for testing...`);
    
    const listings = await Listing.find({});
    for (let i = 0; i < listings.length; i++) {
      const host = hosts[i % hosts.length];
      listings[i].host = host._id;
      await listings[i].save();
    }
    
    console.log(`Reassigned ${listings.length} listings.`);
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fix();

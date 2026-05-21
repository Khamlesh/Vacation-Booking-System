const mongoose = require('mongoose');
const User = require('./models/User');
const Listing = require('./models/Listing');
require('dotenv').config();

const check = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const hosts = await User.find({ role: 'host' });
  const listings = await Listing.find({}).limit(5);
  
  console.log('--- HOSTS ---');
  hosts.forEach(h => console.log(`${h.name} (${h.role}): ${h._id}`));
  
  console.log('\n--- LISTINGS ---');
  listings.forEach(l => console.log(`${l.title}: Host ID ${l.host}`));
  
  process.exit();
};

check();

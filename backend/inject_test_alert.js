const mongoose = require('mongoose');
const User = require('./models/User');
const Notification = require('./models/Notification');
const Listing = require('./models/Listing');
const dotenv = require('dotenv');

dotenv.config();

const injectAlert = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/airbnb_clone');
    
    // Find a host
    const host = await User.findOne({ role: 'host', name: 'Suresh Kumar' });
    if (!host) {
      console.log('Host Suresh Kumar not found. Please run seed script first.');
      process.exit();
    }

    // Find a listing for this host
    const listing = await Listing.findOne({ host: host._id });

    // Create a dummy alert
    const notification = new Notification({
      recipient: host._id,
      message: `NEW BOOKING: John Doe has booked your property "${listing.title}" from 01/05/2026 to 05/05/2026. Guest Contact: +91 99999 88888`
    });

    await notification.save();
    console.log(`Test alert injected for host: ${host.name} (${host.email})`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

injectAlert();

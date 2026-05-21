const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/airbnb_clone')
  .then(async () => {
    const User = require('./models/User');
    const users = await User.countDocuments();
    console.log('Local DB Users count:', users);
    process.exit(0);
  })
  .catch(err => {
    console.log('Failed to connect to local DB:', err.message);
    process.exit(1);
  });

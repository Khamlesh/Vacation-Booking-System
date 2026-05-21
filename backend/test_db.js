const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/airbnb_clone')
  .then(() => {
    console.log('Connected to:', mongoose.connection.host);
    process.exit(0);
  });

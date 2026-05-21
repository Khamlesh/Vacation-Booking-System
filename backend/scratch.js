const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/airbnb_clone')
  .then(async () => {
    const User = require('./models/User');
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin found');
      process.exit(1);
    }
    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    
    try {
      const response = await fetch('http://localhost:5000/api/reports/admin?month=4&year=2026&hostId=all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.text();
      console.log('Status:', response.status);
      console.log('Data:', data);
    } catch (err) {
      console.log('Error:', err.message);
    }
    process.exit(0);
  });

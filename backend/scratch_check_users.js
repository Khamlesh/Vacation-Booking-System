const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const check = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({}).sort({ createdAt: -1 }).limit(5);
  
  console.log('--- RECENT USERS ---');
  users.forEach(u => console.log(`${u.name} (${u.role}): ${u._id}`));
  
  process.exit();
};

check();

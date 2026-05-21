const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://bkhamleshgupta2005_db_user:oXrNFGPjyHzdObdA@cluster0.6ygiy4v.mongodb.net/?appName=Cluster0';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  status: String,
  contactPhone: String,
  password: String,
  wishlist: Array
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const fixHosts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to Atlas!');

    const allUsers = await User.find({});
    console.log(`Total users: ${allUsers.length}`);
    allUsers.forEach(u => console.log(`  - ${u.name} | ${u.email} | role=${u.role} | status=${u.status}`));

    // Fix hosts that have active status but should be pending (those without listings knowledge)
    const hostsToFix = await User.find({ role: 'host', status: 'active', name: { $in: ['Tushar', 'Jaswanth', 'mrithun'] } });
    console.log(`\nTest hosts to fix: ${hostsToFix.length}`);
    
    for (const h of hostsToFix) {
      h.status = 'pending';
      await h.save();
      console.log(`  Fixed: ${h.name} -> pending`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

fixHosts();

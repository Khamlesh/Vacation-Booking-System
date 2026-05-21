const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://bkhamleshgupta2005_db_user:oXrNFGPjyHzdObdA@cluster0.6ygiy4v.mongodb.net/?appName=Cluster0';

const fixStatus = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to Atlas!');
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // 1. Set all existing users (no status field) to 'active'
    const result1 = await usersCollection.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'active' } }
    );
    console.log(`Set ${result1.modifiedCount} existing users to active status`);
    
    // 2. Set the test host accounts (created today during testing) to pending
    // These are hosts registered via the signup form that should be pending
    const testHostEmails = ['tushar@gmail.com', 'jaswanth@gmail.com', 'mrithun@gmail.com'];
    const result2 = await usersCollection.updateMany(
      { email: { $in: testHostEmails }, role: 'host' },
      { $set: { status: 'pending' } }
    );
    console.log(`Set ${result2.modifiedCount} test host accounts to pending`);
    
    // 3. Verify
    const allUsers = await usersCollection.find({}).toArray();
    console.log('\nAll users after fix:');
    allUsers.forEach(u => console.log(`  - ${u.name} | ${u.email} | role=${u.role} | status=${u.status}`));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

fixStatus();

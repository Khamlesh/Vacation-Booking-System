const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@test.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: '1234',
        role: 'admin',
        status: 'active'
      });
      console.log('Default admin account created: admin@test.com / 1234');
    } else {
      // Optionally update password if it exists but we want to ensure it's '1234'
      // For now, just log that it exists
      console.log('Admin account already exists.');
      
      // Update role and status just in case
      existingAdmin.role = 'admin';
      existingAdmin.status = 'active';
      // If we want to force the password to 1234:
      existingAdmin.password = '1234';
      await existingAdmin.save();
      console.log('Admin account updated to ensure correct role and password.');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

module.exports = seedAdmin;

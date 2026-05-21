const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

function generateRandomIndianPhone() {
  const firstDigit = Math.floor(Math.random() * 4) + 6; // 6, 7, 8, or 9
  const remainingDigits = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  return `+91 ${firstDigit}${remainingDigits.substring(0, 4)} ${remainingDigits.substring(4)}`;
}

async function updateContactInfo() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all hosts or admins (since users might not need public contact info)
    const hostsAndAdmins = await User.find({ role: { $in: ['host', 'admin'] } });
    console.log(`Found ${hostsAndAdmins.length} hosts and admins.`);

    let updatedCount = 0;
    for (const user of hostsAndAdmins) {
      if (!user.contactPhone) {
        user.contactPhone = generateRandomIndianPhone();
        await user.save();
        updatedCount++;
      }
    }

    console.log(`Successfully assigned phone numbers to ${updatedCount} hosts/admins.`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating contact info:', error);
    process.exit(1);
  }
}

updateContactInfo();

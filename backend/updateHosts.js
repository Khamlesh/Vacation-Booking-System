const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const indianNames = [
  "Aarav Sharma", "Vivaan Patel", "Aditya Singh", "Vihaan Kumar", "Arjun Gupta",
  "Sai Reddy", "Ayaan Desai", "Krishna Iyer", "Ishaan Joshi", "Shaurya Nair",
  "Diya Mehta", "Sanya Kapoor", "Ananya Menon", "Riya Bhat", "Aanya Das",
  "Aaradhya Pillai", "Kavya Bose", "Myra Ahuja", "Navya Rao", "Tara Varma"
];

async function updateHosts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all users that were generated in the seed script
    // They either have email starting with 'newhost_' or name 'Generated Host'
    const generatedHosts = await User.find({
      $or: [
        { email: { $regex: /^newhost_/i } },
        { name: { $regex: /^Generated Host/i } }
      ]
    });

    console.log(`Found ${generatedHosts.length} auto-generated hosts.`);

    for (let i = 0; i < generatedHosts.length; i++) {
      const host = generatedHosts[i];
      // Make sure we have enough Indian names
      const newName = indianNames[i % indianNames.length];
      const newEmail = newName.toLowerCase().replace(/ /g, '.') + '@example.com';
      
      host.name = newName;
      host.email = newEmail;
      await host.save();
      console.log(`Updated: ${newName} (${newEmail})`);
    }

    console.log('Successfully updated host names and emails in the database!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating hosts:', error);
    process.exit(1);
  }
}

updateHosts();

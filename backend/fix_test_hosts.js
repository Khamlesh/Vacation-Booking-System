const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const fixTestHosts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        // Show ALL active hosts to understand the data
        const allHosts = await User.find({ role: 'host', status: 'active' }).select('name email status createdAt');
        console.log(`All active hosts (${allHosts.length}):`);
        allHosts.forEach(h => console.log(`  - ${h.name} | ${h.email} | ${h.status} | ${h.createdAt}`));
        
        // Now update ALL hosts created today or with test names to pending
        const result = await User.updateMany(
            { role: 'host', status: 'active', name: { $in: ['Tushar', 'Jaswanth', 'mrithun'] } },
            { $set: { status: 'pending' } }
        );
        
        console.log(`\nUpdated ${result.modifiedCount} test host accounts to pending status`);
        
        // Verify
        const pendingHosts = await User.find({ role: 'host', status: 'pending' }).select('name email status');
        console.log('Current pending hosts:');
        pendingHosts.forEach(h => console.log(`  - ${h.name} (${h.email}): ${h.status}`));
        
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

fixTestHosts();

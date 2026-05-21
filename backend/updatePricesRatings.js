const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Listing = require('./models/Listing');

dotenv.config();

const basePrices = {
  apartment: 800,
  house: 1200,
  cabin: 1000,
  villa: 2500
};

async function updateListings() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const listings = await Listing.find({});
    console.log(`Found ${listings.length} listings to update.`);

    let updatedCount = 0;
    for (const listing of listings) {
      // 1. Randomize rating between 3.0 and 5.0
      const rating = (Math.random() * 2 + 3).toFixed(1);
      listing.ratings = parseFloat(rating);

      // 2. Calculate dynamic price
      const type = listing.propertyType ? listing.propertyType.toLowerCase() : 'house';
      const basePrice = basePrices[type] || 1000;
      const guests = listing.maxGuests || 2;
      
      // Random location factor (0.8 to 1.5 multiplier)
      const locationFactor = 0.8 + (Math.random() * 0.7);
      
      const newPrice = Math.round((basePrice * guests * locationFactor) / 100) * 100; // Round to nearest 100
      
      listing.price = Math.max(2000, newPrice); // Min 2000 INR
      
      await listing.save();
      updatedCount++;
    }

    console.log(`Successfully updated prices and ratings for ${updatedCount} listings!`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating listings:', error);
    process.exit(1);
  }
}

updateListings();

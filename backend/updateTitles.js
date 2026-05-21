const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Listing = require('./models/Listing');

dotenv.config();

const adjectives = ["Stunning", "Luxury", "Cozy", "Modern", "Spacious", "Elegant", "Charming", "Exquisite", "Tranquil", "Panoramic", "Serene", "Boutique", "Historic"];
const suffixes = ["with Stunning Views", "in the Heart of the City", "with Private Pool", "Steps from the Center", "with Garden Oasis", "with Rooftop Terrace", "by the Water", "with Contemporary Design", "Perfect for Families", "for a Romantic Getaway"];

const nouns = {
  apartment: ["Penthouse", "Loft", "Studio", "Suite", "Apartment"],
  house: ["Estate", "Residence", "Home", "Retreat", "Townhouse"],
  cabin: ["Lodge", "Chalet", "Hideaway", "Cabin", "Cottage"],
  villa: ["Mansion", "Oasis", "Villa", "Sanctuary", "Haven"]
};

function generateAttractiveTitle(type) {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const nounArr = nouns[type] || nouns.house;
  const noun = nounArr[Math.floor(Math.random() * nounArr.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `${adj} ${noun} ${suffix}`;
}

async function updateTitles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const listings = await Listing.find({});
    console.log(`Found ${listings.length} listings to process.`);

    let updatedCount = 0;
    for (const listing of listings) {
      // Check if it's one of the auto-generated ones from earlier
      if (listing.title.startsWith('Beautiful ') && listing.title.includes(' in ')) {
        const newTitle = generateAttractiveTitle(listing.propertyType);
        listing.title = newTitle;
        await listing.save();
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} listing titles!`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating titles:', error);
    process.exit(1);
  }
}

updateTitles();

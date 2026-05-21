const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Listing = require('./models/Listing');

dotenv.config();

const WORKING_IMAGES = [
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1502672260266-1c1e5240980c?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1613490900233-0fa2cb8d63a9?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800"
];

async function updateImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const listings = await Listing.find({});
    console.log(`Found ${listings.length} listings to update.`);

    let updatedCount = 0;
    for (const listing of listings) {
      const freshImage = WORKING_IMAGES[Math.floor(Math.random() * WORKING_IMAGES.length)];
      listing.images = [{ url: freshImage, filename: 'unsplash_img' }];
      await listing.save();
      updatedCount++;
    }

    console.log(`Successfully updated images for ${updatedCount} listings with guaranteed working URLs!`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating images:', error);
    process.exit(1);
  }
}

updateImages();

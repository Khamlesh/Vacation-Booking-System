const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Listing = require('./models/Listing');

dotenv.config();

const CITIES = [
  "Hyderabad", "Chennai", "Bangalore", "Munnar", "Wayanad", "Mumbai", 
  "Pune", "Noida", "Visakhapatnam", "Vijayawada", "Guntur", "Tambaram", 
  "Madurai", "Puri", "Chhattisgarh", "Delhi", "Gurugram", "Manali", 
  "Srinagar", "Sikkim", "Kolkata", "Gujarat", "Varanasi", "Jaipur"
];

const PROPERTY_TYPES = ['apartment', 'house', 'cabin', 'villa'];

// Reliable Unsplash image arrays
const IMAGES = {
  apartment: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1e5240980c?w=800&q=80",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80"
  ],
  house: [
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80"
  ],
  cabin: [
    "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80",
    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80",
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80"
  ],
  villa: [
    "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80",
    "https://images.unsplash.com/photo-1613490900233-0fa2cb8d63a9?w=800&q=80",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80"
  ]
};

const AMENITIES_POOL = ["Wi-Fi", "Kitchen", "Air conditioning", "Pool", "Free parking", "TV", "Washer", "Dryer", "Heating", "Dedicated workspace"];

function getRandomAmenities() {
  const shuffled = AMENITIES_POOL.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 5) + 4); // 4 to 8 amenities
}

function getRandomImage(type) {
  const arr = IMAGES[type];
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Create 20 new hosts
    const hosts = [];
    console.log('Creating 20 new hosts...');
    for (let i = 1; i <= 20; i++) {
      const email = `newhost_${Date.now()}_${i}@example.com`;
      const host = new User({
        name: `Generated Host ${i}`,
        email: email,
        password: 'password123',
        role: 'host'
      });
      await host.save();
      hosts.push(host);
    }
    console.log('Successfully created 20 hosts.');

    // 2. Generate properties
    const newListings = [];
    let hostIndex = 0;

    console.log('Generating properties...');
    for (const city of CITIES) {
      for (let i = 1; i <= 20; i++) {
        const typeIndex = i % 4;
        const propertyType = PROPERTY_TYPES[typeIndex];
        
        let maxGuests = 2;
        let price = 50;
        if (propertyType === 'apartment') { maxGuests = 4; price = 80 + Math.floor(Math.random() * 50); }
        if (propertyType === 'house') { maxGuests = 6; price = 120 + Math.floor(Math.random() * 80); }
        if (propertyType === 'cabin') { maxGuests = 3; price = 100 + Math.floor(Math.random() * 60); }
        if (propertyType === 'villa') { maxGuests = 10; price = 250 + Math.floor(Math.random() * 200); }

        const listing = new Listing({
          title: `Beautiful ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} in ${city}`,
          description: `Enjoy a wonderful stay at this perfectly located ${propertyType} in the heart of ${city}. Experience the best of the city with all the comforts of home.`,
          propertyType: propertyType,
          location: city,
          price: price,
          images: [{ url: getRandomImage(propertyType), filename: 'unsplash_img' }],
          amenities: getRandomAmenities(),
          maxGuests: maxGuests,
          checkInTime: '14:00',
          checkOutTime: '11:00',
          host: hosts[hostIndex]._id,
          ratings: 4 + Math.random(),
          numReviews: Math.floor(Math.random() * 50) + 1,
          availableFrom: new Date(),
          availableTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        });
        
        newListings.push(listing);
        
        // Cycle through hosts to distribute evenly
        hostIndex = (hostIndex + 1) % hosts.length;
      }
    }

    // Insert all listings at once
    console.log(`Saving ${newListings.length} properties to the database...`);
    await Listing.insertMany(newListings);
    
    console.log('Successfully seeded properties!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();

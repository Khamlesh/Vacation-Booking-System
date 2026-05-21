const mongoose = require('mongoose');
const User = require('./models/User');
const Listing = require('./models/Listing');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/airbnb_clone');
    
    await User.deleteMany();
    await Listing.deleteMany();

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });

    const hostUser = await User.create({
      name: 'Host User',
      email: 'host@test.com',
      password: 'password123',
      role: 'host'
    });

    const standardUser = await User.create({
      name: 'John Doe',
      email: 'john@test.com',
      password: 'password123',
      role: 'user'
    });

    const dineshUser = await User.create({
      name: 'Dinesh Kumar',
      email: 'dinesh@123',
      password: 'dinesh',
      role: 'user'
    });

    const listings = [
      {
        title: 'Tropical Beachfront Villa',
        description: 'Enjoy the vibrant nightlife and serene beaches. This premium villa comes with a private pool and a massive patio facing the sea.',
        propertyType: 'Villa',
        location: 'Goa',
        price: 250,
        host: hostUser._id,
        images: [{ url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80', filename: 'goa' }],
        amenities: ['Wifi', 'Pool', 'AC', 'Parking'],
        ratings: 4.8,
      },
      {
        title: 'Snowy Peaks Resort',
        description: 'A cozy resort offering breathtaking views of the Himalayas. Perfect for a snowy getaway with loved ones.',
        propertyType: 'Cabin',
        location: 'Manali',
        price: 120,
        host: hostUser._id,
        images: [{ url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80', filename: 'manali' }],
        amenities: ['Room Heater', 'Wifi', 'Breakfast', 'Parking'],
        ratings: 4.7,
      },
      {
        title: 'Heritage Tea Estate',
        description: 'Immerse yourself in nature surrounded by beautiful tea gardens. Taste authentic local tea and enjoy the cool breeze.',
        propertyType: 'House',
        location: 'Ooty',
        price: 90,
        host: hostUser._id,
        images: [{ url: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80', filename: 'ooty' }],
        amenities: ['Wifi', 'Garden', 'Parking', 'Kitchen'],
        ratings: 4.9,
      },
      {
        title: 'Royal Palace Suite',
        description: 'Experience the grandeur of Rajasthan in this heritage palace suite with royal architecture and modern luxury.',
        propertyType: 'Villa',
        location: 'Jaipur',
        price: 350,
        host: hostUser._id,
        images: [{ url: 'https://images.unsplash.com/photo-1599661559684-2454b5dfa9a3?auto=format&fit=crop&q=80', filename: 'jaipur' }],
        amenities: ['AC', 'Pool', 'Breakfast', 'Spa'],
        ratings: 5.0,
      },
      {
        title: 'Luxury Backwater Houseboat',
        description: 'Unwind on the tranquil backwaters of Alleppey. A premium moving houseboat with a dedicated chef.',
        propertyType: 'Houseboat',
        location: 'Kerala (Alleppey)',
        price: 200,
        host: hostUser._id,
        images: [{ url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80', filename: 'kerala' }],
        amenities: ['AC', 'Chef', 'Deck', 'Wifi'],
        ratings: 4.9,
      },
      {
        title: 'Sea View Apartment',
        description: 'A modern, high-rise apartment in the heart of Mumbai offering stunning sunset views over the Arabian Sea.',
        propertyType: 'Apartment',
        location: 'Mumbai',
        price: 180,
        host: hostUser._id,
        images: [{ url: 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&q=80', filename: 'mumbai' }],
        amenities: ['Wifi', 'AC', 'Elevator', 'Gym'],
        ratings: 4.6,
      },
      {
        title: 'Central Boutique Stay',
        description: 'Located in South Delhi, this artistic space offers easy access to the historical landmarks and local cafes.',
        propertyType: 'Apartment',
        location: 'Delhi',
        price: 110,
        host: hostUser._id,
        images: [{ url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80', filename: 'delhi' }],
        amenities: ['Wifi', 'Kitchen', 'AC', 'Parking'],
        ratings: 4.5,
      },
      {
        title: 'Tech Hub Premium Suite',
        description: 'Perfect for business travelers. Close to major IT hubs with superfast internet and a quiet workspace.',
        propertyType: 'Apartment',
        location: 'Hyderabad',
        price: 130,
        host: hostUser._id,
        images: [{ url: 'https://images.unsplash.com/photo-1601569485754-04f7fe2aa6de?auto=format&fit=crop&q=80', filename: 'hyderabad' }],
        amenities: ['Fast Wifi', 'AC', 'Workspace', 'Gym'],
        ratings: 4.7,
      },
      {
        title: 'Garden City Loft',
        description: 'A chic industrial loft in the heart of the tech capital. Enjoy the pleasant weather from your private balcony.',
        propertyType: 'Apartment',
        location: 'Bangalore',
        price: 140,
        host: hostUser._id,
        images: [{ url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80', filename: 'bangalore' }],
        amenities: ['Wifi', 'Balcony', 'AC', 'Kitchen'],
        ratings: 4.8,
      },
      {
        title: 'Riverside Yoga Retreat',
        description: 'Find inner peace at this serene property located by the Ganges. Daily meditation and yoga sessions included.',
        propertyType: 'Cabin',
        location: 'Rishikesh',
        price: 80,
        host: hostUser._id,
        images: [{ url: 'https://images.unsplash.com/photo-1593693397690-362cb97359b1?auto=format&fit=crop&q=80', filename: 'rishikesh' }],
        amenities: ['Yoga Mat', 'Organic Food', 'River View', 'Wifi'],
        ratings: 4.9,
      }
    ];

    await Listing.insertMany(listings);

    console.log('Database Seeded Successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();

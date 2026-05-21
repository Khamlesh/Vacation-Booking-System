const mongoose = require('mongoose');
const User = require('./models/User');
const Listing = require('./models/Listing');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const cities = [
  'Hyderabad', 'Chennai', 'Bangalore', 'Munnar', 'Wayanad', 'Mumbai', 'Pune', 'Noida', 
  'Visakhapatnam', 'Vijayawada', 'Guntur', 'Tambaram', 'Madurai', 'Puri', 'Chhattisgarh', 
  'Delhi', 'Gurugram', 'Manali', 'Srinagar', 'Sikkim', 'Kolkata', 'Gujarat', 'Jaipur'
];

const categories = ['Apartment', 'House', 'Cabin', 'Villa'];

const amenitiesList = [
  'Wifi', 'AC', 'Kitchen', 'Free Parking', 'Pool', 'Gym', 'TV', 'Washer', 
  'Iron', 'Workspace', 'Hair Dryer', 'Elevator', 'Security', 'Balcony'
];

const propertyNames = {
  'Apartment': ['Urban Skyline', 'Metro Oasis', 'City Breeze', 'Azure Loft', 'Zen Retreat', 'Cloud Nine', 'Pulse Residence', 'Nexus Flat', 'Vantage Point', 'Summit Suite'],
  'House': ['Rosewood Estate', 'Maple Manor', 'Willow Creek Home', 'The Heritage', 'Sunset Cottage', 'Ivy Hall', 'Pine Valley', 'Orchard House', 'Riverside Stay', 'Serenity Lodge'],
  'Cabin': ['Cedar Peak', 'Forest Whispers', 'Mountain Hideaway', 'Wildwood Cabin', 'Alpine Den', 'Evergreen Retreat', 'Starlight Shack', 'Rustic Ridge', 'Mist Valley', 'Summit Lodge'],
  'Villa': ['Royal Palms', 'Grand Vista', 'Saffron Estate', 'Infinity Villa', 'Regency Manor', 'Emerald Isle', 'Sapphire Coast', 'Majestic Retreat', 'Palace View', 'Crystal Cove']
};

const images = {
  'Apartment': [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'
  ],
  'House': [
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233',
    'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09',
    'https://images.unsplash.com/photo-1449844908441-8829872d2607',
    'https://images.unsplash.com/photo-1513584684374-8bdb74838a0f',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef'
  ],
  'Cabin': [
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739',
    'https://images.unsplash.com/photo-1449156001533-cb39415058f8',
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3'
  ],
  'Villa': [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811',
    'https://images.unsplash.com/photo-1575517111478-7f6afd0973db',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9'
  ]
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/airbnb_clone');
    console.log('Connected to MongoDB');

    // Keep existing admin, but clear listings and other hosts if desired.
    // User wants it to be done automatically.
    // I will clear all listings and all users with role 'host'.
    await Listing.deleteMany({});
    await User.deleteMany({ role: 'host' });

    // Create 10 hosts with Indian names
    const indianNames = [
      'Suresh Kumar', 'Ramesh Rao', 'Anish Pandey', 'Rajesh Sharma', 'Priya Singh', 
      'Vikram Malhotra', 'Amit Verma', 'Sneha Reddy', 'Rahul Gupta', 'Deepak Iyer'
    ];

    const hosts = [];
    for (let i = 0; i < indianNames.length; i++) {
      const name = indianNames[i];
      const emailPrefix = name.toLowerCase().replace(/\s/g, '');
      const host = await User.create({
        name: name,
        email: `${emailPrefix}@test.com`,
        password: 'password123',
        role: 'host',
        contactPhone: `+91 ${9876500000 + i}`,
        address: `Host Address ${i}, India`,
        status: 'active'
      });
      hosts.push(host);
    }
    console.log('10 Indian Hosts created');

    // Create 5 Standard Users to be reviewers
    const reviewers = [];
    const reviewerNames = ['Amit Patel', 'Sneha Gupta', 'John Smith', 'Anjali Rao', 'Michael Chen'];
    for (const name of reviewerNames) {
      const email = `${name.toLowerCase().replace(/\s/g, '')}@example.com`;
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name,
          email,
          password: 'password123',
          role: 'user'
        });
      }
      reviewers.push(user);
    }
    console.log('5 Reviewer Users ready');

    const Review = require('./models/Review');
    await Review.deleteMany({});

    const listings = [];
    const reviewData = [];

    const reviewComments = [
      'Amazing stay! The place was clean and the host was very helpful.',
      'Beautiful property with a great view. Highly recommended!',
      'Comfortable and cozy. Exactly as described in the photos.',
      'Great location and value for money. Will definitely come back.',
      'The amenities were top-notch. Had a wonderful time with family.',
      'Decent stay, but could have been cleaner in the kitchen area.',
      'Superb hospitality! Everything was perfect.',
      'Wonderful experience. The check-in process was very smooth.',
      'Lovely neighborhood and very peaceful environment.',
      'A bit expensive but worth it for the luxury experience.'
    ];

    for (const city of cities) {
      console.log(`Generating properties and reviews for ${city}...`);
      for (let i = 0; i < 20; i++) {
        const category = categories[i % categories.length];
        const host = hosts[i % hosts.length];
        
        // Attractive names without city name
        const namePrefix = propertyNames[category][Math.floor(Math.random() * propertyNames[category].length)];
        const title = namePrefix;
        
        const maxGuests = category === 'Apartment' ? 4 : (category === 'Cabin' ? 2 : (category === 'House' ? 6 : 10));
        const price = category === 'Apartment' ? 1500 + Math.random() * 1000 : (category === 'Cabin' ? 1200 + Math.random() * 800 : (category === 'House' ? 3000 + Math.random() * 2000 : 8000 + Math.random() * 5000));
        
        const selectedAmenities = [];
        const numAmenities = 5 + Math.floor(Math.random() * 5);
        while (selectedAmenities.length < numAmenities) {
          const am = amenitiesList[Math.floor(Math.random() * amenitiesList.length)];
          if (!selectedAmenities.includes(am)) selectedAmenities.push(am);
        }

        // Refined Image Selection
        const categoryImages = images[category];
        const imageUrl = categoryImages[Math.floor(Math.random() * categoryImages.length)] + '?auto=format&fit=crop&w=1200&q=80';

        // Broad Random Dates between Jan 2026 and Dec 2027
        const availableFrom = new Date(2026, 0, 1); // Jan 1 2026
        const availableTo = new Date(2027, 11, 31); // Dec 31 2027

        const listing = new Listing({
          title,
          description: `A beautiful and attractive ${category.toLowerCase()} located in the heart of ${city}. This property offers a premium stay experience with modern amenities and stunning views. Perfect for families and travelers looking for comfort and style.`,
          propertyType: category,
          location: city,
          price: Math.round(price),
          host: host._id,
          images: [{ url: imageUrl, filename: `${city.toLowerCase()}_${category.toLowerCase()}_${i}` }],
          amenities: selectedAmenities,
          maxGuests: maxGuests,
          checkInTime: '14:00',
          checkOutTime: '11:00',
          availableFrom,
          availableTo,
          ratings: 0,
          numReviews: 0
        });

        const createdListing = await listing.save();

        // Generate 3-5 random reviews for this listing
        const numReviews = 3 + Math.floor(Math.random() * 3);
        let totalRating = 0;
        
        for (let j = 0; j < numReviews; j++) {
          const reviewer = reviewers[j % reviewers.length];
          const rating = 4 + Math.floor(Math.random() * 2); // Mostly 4s and 5s
          totalRating += rating;
          
          // Random date in the past 4 months
          const reviewDate = new Date(2026, Math.floor(Math.random() * 4), 1 + Math.floor(Math.random() * 28));

          const review = new Review({
            listing: createdListing._id,
            user: reviewer._id,
            rating,
            comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
            createdAt: reviewDate
          });
          await review.save();
        }

        // Update listing with average rating
        createdListing.ratings = Number((totalRating / numReviews).toFixed(1));
        createdListing.numReviews = numReviews;
        await createdListing.save();
      }
    }

    console.log(`Successfully added properties and reviews across ${cities.length} cities.`);

    console.log('Database Seeded Successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();

const Listing = require('../models/Listing');

const getListings = async (req, res) => {
  try {
    const query = {};

    if (req.query.keyword) {
      query.location = { $regex: req.query.keyword, $options: 'i' };
    }
    
    if (req.query.hostId) {
      query.host = req.query.hostId;
    }

    if (req.query.propertyType && req.query.propertyType !== 'All') {
      query.propertyType = new RegExp(`^${req.query.propertyType}$`, 'i');
    }

    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    if (req.query.minRating) {
      query.ratings = { $gte: Number(req.query.minRating) };
    }

    const listings = await Listing.find(query).populate('host', 'name');
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getHostListings = async (req, res) => {
  try {
    const listings = await Listing.find({ host: req.user.id }).populate('host', 'name');
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('host', 'name');
    if (listing) {
      res.json(listing);
    } else {
      res.status(404).json({ error: 'Listing not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createListing = async (req, res) => {
  try {
    const listing = new Listing({
      title: req.body.title || 'Sample title',
      description: req.body.description || 'Sample description',
      propertyType: req.body.propertyType || 'Apartment',
      location: req.body.location || 'Sample location',
      price: req.body.price || 0,
      maxGuests: req.body.maxGuests || 2,
      checkInTime: req.body.checkInTime || '14:00',
      checkOutTime: req.body.checkOutTime || '11:00',
      availableFrom: req.body.availableFrom,
      availableTo: req.body.availableTo,
      host: req.user.id,
      images: req.body.images || [],
      amenities: req.body.amenities || []
    });

    const createdListing = await listing.save();
    res.status(201).json(createdListing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateListing = async (req, res) => {
  try {
    const { title, description, propertyType, location, price, maxGuests, checkInTime, checkOutTime, images, amenities, availableFrom, availableTo } = req.body;
    const listing = await Listing.findById(req.params.id);

    if (listing) {
      if (listing.host.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ error: 'User not authorized to update this listing' });
      }

      listing.title = title || listing.title;
      listing.description = description || listing.description;
      listing.propertyType = propertyType || listing.propertyType;
      listing.location = location || listing.location;
      listing.price = price || listing.price;
      listing.maxGuests = maxGuests || listing.maxGuests;
      listing.checkInTime = checkInTime || listing.checkInTime;
      listing.checkOutTime = checkOutTime || listing.checkOutTime;
      listing.availableFrom = availableFrom || listing.availableFrom;
      listing.availableTo = availableTo || listing.availableTo;
      listing.images = images || listing.images;
      listing.amenities = amenities || listing.amenities;

      const updatedListing = await listing.save();
      res.json(updatedListing);
    } else {
      res.status(404).json({ error: 'Listing not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (listing) {
      if (listing.host.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ error: 'User not authorized to delete this listing' });
      }
      await listing.deleteOne();
      res.json({ message: 'Listing removed' });
    } else {
      res.status(404).json({ error: 'Listing not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getListings, getHostListings, getListingById, createListing, updateListing, deleteListing };

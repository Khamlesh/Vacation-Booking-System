const Review = require('../models/Review');
const Listing = require('../models/Listing');

const createReview = async (req, res) => {
  const { rating, comment, listingId } = req.body;

  try {
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({
      listing: listingId,
      user: req.user.id
    });

    if (alreadyReviewed) {
      return res.status(400).json({ error: 'You have already reviewed this property' });
    }

    const review = await Review.create({
      listing: listingId,
      user: req.user.id,
      rating: Number(rating),
      comment
    });

    // Compute aggregate rating inline
    const reviews = await Review.find({ listing: listingId });
    listing.numReviews = reviews.length;
    listing.ratings = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    await listing.save();

    res.status(201).json({ message: 'Review added', review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getListingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId }).populate('user', 'name');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createReview, getListingReviews };

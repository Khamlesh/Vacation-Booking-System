const express = require('express');
const router = express.Router();
const { createReview, getListingReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/:listingId', getListingReviews);

module.exports = router;

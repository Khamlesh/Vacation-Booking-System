const express = require('express');
const router = express.Router();
const { getListings, getHostListings, getListingById, createListing, updateListing, deleteListing } = require('../controllers/listingController');
const { protect, admin, isHost } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', protect, isHost, upload.array('images', 5), (req, res) => {
  const images = req.files.map(file => ({
    url: `http://localhost:5000/uploads/${file.filename}`,
    filename: file.filename
  }));
  res.json(images);
});

router.route('/')
  .get(getListings)
  .post(protect, isHost, createListing);

router.get('/host', protect, isHost, getHostListings);

router.route('/:id')
  .get(getListingById)
  .put(protect, updateListing)
  .delete(protect, deleteListing);

module.exports = router;

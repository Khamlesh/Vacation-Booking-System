const express = require('express');
const router = express.Router();
const { getHostReport, getAdminReport } = require('../controllers/reportController');
const { protect, admin, isHost } = require('../middleware/auth');

router.get('/host', protect, isHost, getHostReport);
router.get('/admin', protect, admin, getAdminReport);

module.exports = router;

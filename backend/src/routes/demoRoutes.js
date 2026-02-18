const express = require('express');
const router = express.Router();
const demoController = require('../controllers/demoController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all demo routes
// Only authenticated users can access, specific endpoints might need Admin
router.post('/reset', protect, authorize('ADMIN'), demoController.resetDemoData);

module.exports = router;

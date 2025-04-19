// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Only admins should access these endpoints (add middleware as needed)
router.get('/volunteers', reportController.generateVolunteerReport);
router.get('/events', reportController.generateEventReport);

module.exports = router;

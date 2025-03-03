const express = require("express");
const router = express.Router();
const volunteerMatchingController = require("../controllers/volunteerMatchingController");

// Get all volunteers with optional filters
router.get("/volunteers", volunteerMatchingController.getVolunteers);

// Get a specific volunteer
router.get("/volunteers/:id", volunteerMatchingController.getVolunteer);

// Get all events with optional filters
router.get("/events", volunteerMatchingController.getEvents);

// Get a specific event
router.get("/events/:id", volunteerMatchingController.getEvent);

// Create a new match
router.post("/matches", volunteerMatchingController.createMatch);

// Get all matches
router.get("/matches", volunteerMatchingController.getMatches);

// Get recommendations
router.get("/recommendations", volunteerMatchingController.getRecommendations);

module.exports = router;

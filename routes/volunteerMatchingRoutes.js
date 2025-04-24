const express = require("express");
const router = express.Router();
const volunteerMatchingController = require("../controllers/volunteerMatchingController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Get all volunteers with optional filters - Requires authentication
router.get(
  "/volunteers",
  isAuthenticated,
  volunteerMatchingController.getVolunteers
);

// Get a specific volunteer - Requires authentication
router.get(
  "/volunteers/:id",
  isAuthenticated,
  volunteerMatchingController.getVolunteer
);

// Get all events with optional filters - Requires authentication
router.get("/events", isAuthenticated, volunteerMatchingController.getEvents);

// Get a specific event - Requires authentication
router.get(
  "/events/:id",
  isAuthenticated,
  volunteerMatchingController.getEvent
);

// Create a new match - Requires authentication
router.post(
  "/matches",
  isAuthenticated,
  volunteerMatchingController.createMatch
);

// Create multiple matches for a single event - Requires authentication
router.post(
  "/batch-matches",
  isAuthenticated,
  volunteerMatchingController.createBatchMatches
);

// Get all matches - Requires authentication
router.get("/matches", isAuthenticated, volunteerMatchingController.getMatches);

// Update match status - Requires authentication and admin role
router.patch(
  "/matches/:id/status",
  isAuthenticated,
  isAdmin,
  volunteerMatchingController.updateMatchStatus
);

// Get recommendations - Requires authentication
router.get(
  "/recommendations",
  isAuthenticated,
  volunteerMatchingController.getRecommendations
);

module.exports = router;

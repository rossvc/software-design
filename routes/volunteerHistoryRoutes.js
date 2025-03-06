const express = require("express");
const router = express.Router();
const volunteerHistoryController = require("../controllers/volunteerHistoryController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Get all history records - Admin only
router.get("/", isAuthenticated, isAdmin, volunteerHistoryController.getAllHistory);

// Get current user's history - Requires authentication
router.get("/current", isAuthenticated, volunteerHistoryController.getCurrentUserHistory);

// Get history records for a specific volunteer - Requires authentication
router.get(
  "/volunteer/:volunteerId",
  isAuthenticated,
  volunteerHistoryController.getVolunteerHistory
);

// Get volunteer statistics - Requires authentication
router.get(
  "/volunteer/:volunteerId/stats",
  isAuthenticated,
  volunteerHistoryController.getVolunteerStats
);

// Get history records for a specific event - Requires authentication
router.get("/event/:eventId", isAuthenticated, volunteerHistoryController.getEventHistory);

// Add a new history record - Admin only
router.post("/", isAuthenticated, isAdmin, volunteerHistoryController.addHistory);

// Update status of a history record - Admin only
router.patch("/:id/status", isAuthenticated, isAdmin, volunteerHistoryController.updateStatus);

// Update hours served for a history record - Admin only
router.patch("/:id/hours", isAuthenticated, isAdmin, volunteerHistoryController.updateHours);

// Export history as CSV - Requires authentication
router.get("/export", isAuthenticated, volunteerHistoryController.exportHistory);

module.exports = router;

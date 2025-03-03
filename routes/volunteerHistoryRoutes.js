const express = require("express");
const router = express.Router();
const volunteerHistoryController = require("../controllers/volunteerHistoryController");

// Get all history records
router.get("/", volunteerHistoryController.getAllHistory);

// Get history records for a specific volunteer
router.get(
  "/volunteer/:volunteerId",
  volunteerHistoryController.getVolunteerHistory
);

// Get volunteer statistics
router.get(
  "/volunteer/:volunteerId/stats",
  volunteerHistoryController.getVolunteerStats
);

// Get history records for a specific event
router.get("/event/:eventId", volunteerHistoryController.getEventHistory);

// Add a new history record
router.post("/", volunteerHistoryController.addHistory);

// Update status of a history record
router.patch("/:id/status", volunteerHistoryController.updateStatus);

// Update hours served for a history record
router.patch("/:id/hours", volunteerHistoryController.updateHours);

// Export history as CSV
router.get("/export", volunteerHistoryController.exportHistory);

module.exports = router;

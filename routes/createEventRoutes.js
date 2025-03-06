const express = require("express");
const router = express.Router();
const eventController = require("../controllers/CreateEventController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Get all events
router.get("/", eventController.getAllEvents);

// Get a specific event
router.get("/:id", eventController.getEvent);

// Create a new event - Admin only
router.post("/", isAuthenticated, isAdmin, eventController.addEvent);

// Update an event - Admin only
router.patch("/:id", isAuthenticated, isAdmin, eventController.updateEvent);

// Delete an event - Admin only
router.delete("/:id", isAuthenticated, isAdmin, eventController.deleteEvent);

module.exports = router;

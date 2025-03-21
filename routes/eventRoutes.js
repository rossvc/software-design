const express = require("express");
const router = express.Router();
const createEventController = require("../controllers/createEventController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Get all events with optional filters
router.get("/", createEventController.getAllEvents);

// Get a specific event by ID
router.get("/:id", createEventController.getEvent);

// Create a new event - Admin only
router.post("/", isAuthenticated, isAdmin, createEventController.addEvent);

// Update an existing event - Admin only
router.put("/:id", isAuthenticated, isAdmin, createEventController.updateEvent);

// Delete an event - Admin only
router.delete("/:id", isAuthenticated, isAdmin, createEventController.deleteEvent);

module.exports = router;

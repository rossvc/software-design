const express = require("express");
const router = express.Router();
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Mock events data
const events = [
  {
    id: 1,
    name: "Beach Cleanup",
    description: "Community beach cleanup event",
    location: "Galveston Beach",
    requiredSkills: ["First Aid"],
    urgency: "High",
    date: "2025-02-20",
    time: "09:00-12:00",
    volunteersNeeded: 5,
    volunteers: [],
  },
  {
    id: 2,
    name: "Senior Care Workshop",
    description: "Workshop on elderly care basics",
    location: "Community Center",
    requiredSkills: ["Elderly Care", "First Aid"],
    urgency: "Medium",
    date: "2025-03-01",
    time: "10:00-14:00",
    volunteersNeeded: 3,
    volunteers: [],
  },
  {
    id: 3,
    name: "Teaching Workshop",
    description: "Basic teaching skills workshop",
    location: "Public Library",
    requiredSkills: ["Teaching"],
    urgency: "Low",
    date: "2025-04-15",
    time: "13:00-16:00",
    volunteersNeeded: 2,
    volunteers: [],
  },
];

// Get all events with optional filters
router.get("/", (req, res) => {
  const { status, skill, urgency } = req.query;
  let filteredEvents = [...events];

  // Apply filters if provided
  if (status) {
    // Filtering logic for status would go here
  }

  if (skill) {
    filteredEvents = filteredEvents.filter((event) =>
      event.requiredSkills.some((s) =>
        s.toLowerCase().includes(skill.toLowerCase())
      )
    );
  }

  if (urgency) {
    filteredEvents = filteredEvents.filter(
      (event) => event.urgency.toLowerCase() === urgency.toLowerCase()
    );
  }

  res.status(200).json(filteredEvents);
});

// Get a specific event by ID
router.get("/:id", (req, res) => {
  const eventId = parseInt(req.params.id);
  const event = events.find((e) => e.id === eventId);

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  res.status(200).json(event);
});

// Create a new event - Admin only
router.post("/", isAuthenticated, isAdmin, (req, res) => {
  const {
    name,
    description,
    location,
    requiredSkills,
    urgency,
    date,
    time,
    volunteersNeeded,
  } = req.body;

  // Validate required fields
  if (!name || !location || !date || !time) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Create new event (in a real app, this would be saved to a database)
  const newEvent = {
    id: events.length + 1,
    name,
    description: description || "",
    location,
    requiredSkills: requiredSkills || [],
    urgency: urgency || "Medium",
    date,
    time,
    volunteersNeeded: volunteersNeeded || 1,
    volunteers: [],
  };

  events.push(newEvent);

  res.status(201).json({
    message: "Event created successfully",
    event: newEvent,
  });
});

// Update an existing event - Admin only
router.put("/:id", isAuthenticated, isAdmin, (req, res) => {
  const eventId = parseInt(req.params.id);
  const eventIndex = events.findIndex((e) => e.id === eventId);

  if (eventIndex === -1) {
    return res.status(404).json({ message: "Event not found" });
  }

  const {
    name,
    description,
    location,
    requiredSkills,
    urgency,
    date,
    time,
    volunteersNeeded,
  } = req.body;

  // Validate required fields
  if (!name || !location || !date || !time) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Update the event
  events[eventIndex] = {
    ...events[eventIndex],
    name,
    description: description || events[eventIndex].description,
    location,
    requiredSkills: requiredSkills || events[eventIndex].requiredSkills,
    urgency: urgency || events[eventIndex].urgency,
    date,
    time,
    volunteersNeeded: volunteersNeeded || events[eventIndex].volunteersNeeded,
  };

  res.status(200).json({
    message: "Event updated successfully",
    event: events[eventIndex],
  });
});

// Delete an event - Admin only
router.delete("/:id", isAuthenticated, isAdmin, (req, res) => {
  const eventId = parseInt(req.params.id);
  const eventIndex = events.findIndex((e) => e.id === eventId);

  if (eventIndex === -1) {
    return res.status(404).json({ message: "Event not found" });
  }

  // Remove the event (in a real app, this would update a database)
  const deletedEvent = events.splice(eventIndex, 1)[0];

  res.status(200).json({
    message: "Event deleted successfully",
    event: deletedEvent,
  });
});

module.exports = router;

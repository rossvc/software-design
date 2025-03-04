const eventsModel = require("../models/CreateEventModel");

const validateEventId = (id) => {
  if (!id || isNaN(id)) {
    throw new Error("Invalid event ID");
  }
  const event = eventsModel.getEventById(Number(id));
  if (!event) {
    throw new Error("Event not found");
  }
  return event;
};

const getAllEvents = (req, res) => {
  try {
    const events = eventsModel.getAllEvents();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEvent = (req, res) => {
  try {
    const eventId = Number(req.params.id);
    if (!eventId || isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    const event = eventsModel.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addEvent = (req, res) => {
  try {
    const {
      eventName,
      description,
      location,
      urgency,
      skills,
      startTime,
      endTime,
      date,
    } = req.body;

    if (!eventName || !description || !location || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newEvent = eventsModel.addEvent({
      eventName,
      description,
      location,
      urgency: urgency || "Medium",
      skills: skills || [],
      startTime,
      endTime,
      date,
    });

    res.status(201).json({
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEvent = (req, res) => {
  try {
    const eventId = Number(req.params.id);
    validateEventId(eventId);

    const { eventName, description, location, urgency, skills, startTime, endTime, date } = req.body;

    if (!eventName || !description || !location || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const updatedEvent = eventsModel.updateEvent(eventId, {
      eventName,
      description,
      location,
      urgency: urgency || "Medium",
      skills: skills || [],
      startTime,
      endTime,
      date,
    });

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEvent = (req, res) => {
  try {
    const eventId = Number(req.params.id);
    validateEventId(eventId);

    const deleted = eventsModel.deleteEvent(eventId);
    if (!deleted) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllEvents,
  getEvent,
  addEvent,
  updateEvent,
  deleteEvent,
};

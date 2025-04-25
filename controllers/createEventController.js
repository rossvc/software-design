const eventsModel = require("../models/createEventModel");

const validateEventId = async (id) => {
  if (!id || isNaN(id)) {
    throw new Error("Invalid event ID");
  }
  const event = await eventsModel.getEventById(Number(id));
  if (!event) {
    throw new Error("Event not found");
  }
  return event;
};

const getAllEvents = async (req, res) => {
  try {
    const events = await eventsModel.getAllEvents();
    res.status(200).json(events);
  } catch (error) {
    console.error('Error getting all events:', error);
    res.status(500).json({ message: error.message });
  }
};

const getEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    if (!eventId || isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    const event = await eventsModel.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error('Error getting event:', error);
    res.status(500).json({ message: error.message });
  }
};

const addEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      urgency,
      required_skills,
      event_date,
      image_url
    } = req.body;

    if (!name || !description || !location || !event_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newEvent = await eventsModel.addEvent({
      name,
      description,
      location,
      urgency: urgency || "medium",
      required_skills: required_skills || "",
      event_date,
      image_url
    });

    res.status(201).json({
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    await validateEventId(eventId);

    const { name, description, location, urgency, required_skills, event_date, image_url } = req.body;

    if (!name || !description || !location || !event_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const updatedEvent = await eventsModel.updateEvent(eventId, {
      name,
      description,
      location,
      urgency: urgency || "medium",
      required_skills: required_skills || "",
      event_date,
      image_url
    });

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    await validateEventId(eventId);

    const deleted = await eventsModel.deleteEvent(eventId);
    if (!deleted) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error('Error deleting event:', error);
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

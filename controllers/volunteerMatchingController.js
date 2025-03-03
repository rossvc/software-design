const volunteerMatchingModel = require("../models/volunteerMatchingModel");

// Validate volunteer ID
const validateVolunteerId = (id) => {
  if (!id || isNaN(id)) {
    throw new Error("Invalid volunteer ID");
  }

  const volunteer = volunteerMatchingModel.getVolunteerById(Number(id));
  if (!volunteer) {
    throw new Error("Volunteer not found");
  }

  return volunteer;
};

// Validate event ID
const validateEventId = (id) => {
  if (!id || isNaN(id)) {
    throw new Error("Invalid event ID");
  }

  const event = volunteerMatchingModel.getEventById(Number(id));
  if (!event) {
    throw new Error("Event not found");
  }

  return event;
};

// Get all volunteers with filter options
const getVolunteers = (req, res) => {
  try {
    const { skill, availability } = req.query;
    let volunteers = volunteerMatchingModel.getAllVolunteers();

    // Apply filters if provided
    if (skill) {
      volunteers = volunteers.filter((v) => v.skills.includes(skill));
    }

    if (availability) {
      volunteers = volunteers.filter((v) =>
        v.availability.includes(availability)
      );
    }

    res.status(200).json(volunteers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all events with filter options
const getEvents = (req, res) => {
  try {
    const { urgency, date } = req.query;
    let events = volunteerMatchingModel.getAllEvents();

    // Apply filters if provided
    if (urgency) {
      events = events.filter(
        (e) => e.urgency.toLowerCase() === urgency.toLowerCase()
      );
    }

    if (date) {
      events = events.filter((e) => e.date === date);
    }

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific volunteer
const getVolunteer = (req, res) => {
  try {
    const volunteerId = Number(req.params.id);
    const volunteer = validateVolunteerId(volunteerId);

    res.status(200).json(volunteer);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Get a specific event
const getEvent = (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const event = validateEventId(eventId);

    res.status(200).json(event);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Create a new match
const createMatch = (req, res) => {
  try {
    const { volunteerId, eventId } = req.body;

    // Validate input
    if (!volunteerId || !eventId) {
      return res
        .status(400)
        .json({ message: "Volunteer ID and Event ID are required" });
    }

    // Validate if volunteer and event exist
    const volunteer = validateVolunteerId(Number(volunteerId));
    const event = validateEventId(Number(eventId));

    // Create the match
    const match = volunteerMatchingModel.createMatch(
      Number(volunteerId),
      Number(eventId)
    );

    if (!match) {
      return res.status(500).json({ message: "Failed to create match" });
    }

    // Return the created match
    res.status(201).json({
      message: "Match created successfully",
      match,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all matches
const getMatches = (req, res) => {
  try {
    const matches = volunteerMatchingModel.getAllMatches();
    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recommendations based on volunteer or event
const getRecommendations = (req, res) => {
  try {
    const { volunteerId, eventId } = req.query;

    if (volunteerId) {
      // Get recommendations for a volunteer
      const volunteer = validateVolunteerId(Number(volunteerId));
      const events = volunteerMatchingModel.getAllEvents();

      const recommendations = events
        .map((event) => ({
          ...event,
          matchScore: volunteerMatchingModel.calculateMatchScore(
            volunteer,
            event
          ),
        }))
        .sort((a, b) => b.matchScore - a.matchScore);

      res.status(200).json(recommendations);
    } else if (eventId) {
      // Get recommendations for an event
      const event = validateEventId(Number(eventId));
      const volunteers = volunteerMatchingModel.getAllVolunteers();

      const recommendations = volunteers
        .map((volunteer) => ({
          ...volunteer,
          matchScore: volunteerMatchingModel.calculateMatchScore(
            volunteer,
            event
          ),
        }))
        .sort((a, b) => b.matchScore - a.matchScore);

      res.status(200).json(recommendations);
    } else {
      res
        .status(400)
        .json({ message: "Either volunteerId or eventId is required" });
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getVolunteers,
  getEvents,
  getVolunteer,
  getEvent,
  createMatch,
  getMatches,
  getRecommendations,
};

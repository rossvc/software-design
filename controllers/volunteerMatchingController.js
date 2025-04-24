const volunteerMatchingModel = require("../models/volunteerMatchingModel");

// Validate volunteer ID
const validateVolunteerId = async (id) => {
  if (!id || isNaN(id)) {
    throw new Error("Invalid volunteer ID");
  }

  const volunteer = await volunteerMatchingModel.getVolunteerById(Number(id));
  if (!volunteer) {
    throw new Error("Volunteer not found");
  }

  return volunteer;
};

// Validate event ID
const validateEventId = async (id) => {
  if (!id || isNaN(id)) {
    throw new Error("Invalid event ID");
  }

  const event = await volunteerMatchingModel.getEventById(Number(id));
  if (!event) {
    throw new Error("Event not found");
  }

  return event;
};

// Get all volunteers with filter options
const getVolunteers = async (req, res) => {
  try {
    const { skill, availability, status } = req.query;
    let volunteers = await volunteerMatchingModel.getAllVolunteers(status);

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
    console.error("Error getting volunteers:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all events with filter options
const getEvents = async (req, res) => {
  try {
    const { urgency, date } = req.query;
    let events = await volunteerMatchingModel.getAllEvents();

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
    console.error("Error getting events:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get a specific volunteer
const getVolunteer = async (req, res) => {
  try {
    const volunteerId = Number(req.params.id);
    const volunteer = await validateVolunteerId(volunteerId);

    res.status(200).json(volunteer);
  } catch (error) {
    console.error("Error getting volunteer:", error);
    res.status(404).json({ message: error.message });
  }
};

// Get a specific event
const getEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const event = await validateEventId(eventId);

    res.status(200).json(event);
  } catch (error) {
    console.error("Error getting event:", error);
    res.status(404).json({ message: error.message });
  }
};

// Create a new match
const createMatch = async (req, res) => {
  try {
    const { volunteerId, eventId } = req.body;

    // Validate input
    if (!volunteerId || !eventId) {
      return res
        .status(400)
        .json({ message: "Volunteer ID and Event ID are required" });
    }

    // Validate if volunteer and event exist
    try {
      const volunteer = await validateVolunteerId(Number(volunteerId));
      const event = await validateEventId(Number(eventId));

      // Calculate match score between volunteer and event
      const matchScore = volunteerMatchingModel.calculateMatchScore(
        volunteer,
        event
      );

      // Create the match with all required fields
      const match = await volunteerMatchingModel.createMatch(
        Number(volunteerId),
        Number(eventId),
        matchScore
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
      return res.status(404).json({ message: error.message });
    }
  } catch (error) {
    console.error("Error creating match:", error);
    res.status(400).json({ message: error.message });
  }
};

// Create multiple matches for a single event
const createBatchMatches = async (req, res) => {
  try {
    const { volunteerIds, eventId } = req.body;

    // Validate input
    if (
      !volunteerIds ||
      !Array.isArray(volunteerIds) ||
      volunteerIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Valid volunteer IDs array is required" });
    }

    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required" });
    }

    // Validate event first
    try {
      const event = await validateEventId(Number(eventId));

      // Process all volunteers and create matches
      const results = [];
      const errors = [];

      for (const volunteerId of volunteerIds) {
        try {
          const volunteer = await validateVolunteerId(Number(volunteerId));

          // Calculate match score
          const matchScore = volunteerMatchingModel.calculateMatchScore(
            volunteer,
            event
          );

          // Create the match
          const match = await volunteerMatchingModel.createMatch(
            Number(volunteerId),
            Number(eventId),
            matchScore
          );

          if (match) {
            results.push({
              volunteerId: Number(volunteerId),
              success: true,
              match,
            });
          } else {
            errors.push({
              volunteerId: Number(volunteerId),
              success: false,
              error: "Failed to create match",
            });
          }
        } catch (error) {
          errors.push({
            volunteerId: Number(volunteerId),
            success: false,
            error: error.message,
          });
        }
      }

      // Return results
      return res.status(201).json({
        message: `Created ${results.length} matches, failed ${errors.length} matches`,
        successes: results,
        failures: errors,
      });
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  } catch (error) {
    console.error("Error creating batch matches:", error);
    res.status(400).json({ message: error.message });
  }
};

// Get all matches
const getMatches = async (req, res) => {
  try {
    const matches = await volunteerMatchingModel.getAllMatches();
    res.status(200).json(matches);
  } catch (error) {
    console.error("Error getting matches:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get recommendations based on volunteer or event
const getRecommendations = async (req, res) => {
  try {
    const { volunteerId, eventId } = req.query;

    if (volunteerId) {
      // Get recommendations for a volunteer
      const volunteer = await validateVolunteerId(Number(volunteerId));
      const events = await volunteerMatchingModel.getAllEvents();

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
      const event = await validateEventId(Number(eventId));

      // Get all matches for this event with status "Waiting"
      const matches = await volunteerMatchingModel.getEventMatches(
        Number(eventId),
        "Waiting"
      );

      if (matches && matches.length > 0) {
        // Return the volunteers who are already matched with this event and have "Waiting" status
        res.status(200).json(matches);
      } else {
        // No waiting matches found for this event
        res.status(200).json([]);
      }
    } else {
      res
        .status(400)
        .json({ message: "Either volunteerId or eventId is required" });
    }
  } catch (error) {
    console.error("Error getting recommendations:", error);
    res.status(404).json({ message: error.message });
  }
};

// Update match status
const updateMatchStatus = async (req, res) => {
  try {
    const matchId = Number(req.params.id);
    const { status } = req.body;

    // Validate input
    if (!matchId || isNaN(matchId)) {
      return res.status(400).json({ message: "Valid match ID is required" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // Update the match status
    try {
      const updatedMatch = await volunteerMatchingModel.updateMatchStatus(
        matchId,
        status
      );

      if (!updatedMatch) {
        return res.status(404).json({ message: "Match not found" });
      }

      // Return the updated match
      res.status(200).json({
        message: "Match status updated successfully",
        match: updatedMatch,
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } catch (error) {
    console.error("Error updating match status:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVolunteers,
  getVolunteer,
  getEvents,
  getEvent,
  createMatch,
  createBatchMatches,
  getMatches,
  getRecommendations,
  updateMatchStatus,
};

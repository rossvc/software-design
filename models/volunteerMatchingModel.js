const db = require("../utils/db");

// Validation functions
const validateVolunteer = (volunteer) => {
  const errors = [];

  // Required fields
  if (!volunteer.name) errors.push("Name is required");
  if (!volunteer.email) errors.push("Email is required");
  if (!volunteer.skills || !Array.isArray(volunteer.skills))
    errors.push("Skills must be an array");
  if (!volunteer.availability || !Array.isArray(volunteer.availability))
    errors.push("Availability must be an array");
  if (!volunteer.location) errors.push("Location is required");

  // Field types
  if (typeof volunteer.name !== "string") errors.push("Name must be a string");
  if (typeof volunteer.email !== "string")
    errors.push("Email must be a string");
  if (typeof volunteer.location !== "string")
    errors.push("Location must be a string");

  // Field lengths
  if (
    volunteer.name &&
    (volunteer.name.length < 2 || volunteer.name.length > 50)
  )
    errors.push("Name must be between 2 and 50 characters");
  if (
    volunteer.location &&
    (volunteer.location.length < 2 || volunteer.location.length > 100)
  )
    errors.push("Location must be between 2 and 100 characters");

  // Email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(volunteer.email)) errors.push("Invalid email format");

  return errors;
};

const validateEvent = (event) => {
  const errors = [];

  // Required fields
  if (!event.name) errors.push("Event name is required");
  if (!event.location) errors.push("Event location is required");
  if (!event.date) errors.push("Event date is required");
  if (!event.requiredSkills || !Array.isArray(event.requiredSkills))
    errors.push("Required skills must be an array");
  if (typeof event.volunteersNeeded !== "number")
    errors.push("Volunteers needed must be a number");
  if (!event.urgency) errors.push("Urgency is required");

  // Field types
  if (typeof event.name !== "string")
    errors.push("Event name must be a string");
  if (typeof event.location !== "string")
    errors.push("Location must be a string");
  if (typeof event.date !== "string") errors.push("Date must be a string");

  // Field lengths
  if (event.name && (event.name.length < 3 || event.name.length > 100))
    errors.push("Event name must be between 3 and 100 characters");
  if (
    event.location &&
    (event.location.length < 2 || event.location.length > 100)
  )
    errors.push("Location must be between 2 and 100 characters");

  // Date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(event.date))
    errors.push("Invalid date format (should be YYYY-MM-DD)");

  // Urgency enum
  const validUrgencies = ["Low", "Medium", "High"];
  if (!validUrgencies.includes(event.urgency))
    errors.push("Urgency must be Low, Medium, or High");

  // Volunteers needed range
  if (event.volunteersNeeded < 1 || event.volunteersNeeded > 100)
    errors.push("Volunteers needed must be between 1 and 100");

  return errors;
};

// Helper function to map database volunteer to model format
const mapDbVolunteerToModelVolunteer = (dbVolunteer) => {
  return {
    id: dbVolunteer.id,
    name: dbVolunteer.full_name,
    email: dbVolunteer.username,
    skills: dbVolunteer.skills || "[]",
    availability: dbVolunteer.availability
      ? ["Weekdays", "Weekends"]
      : ["Weekends"],
    location: dbVolunteer.city,
    matchScore: dbVolunteer.match_score || 0,
    status: dbVolunteer.status || "Waiting",
  };
};

// Helper function to map database event to model format
const mapDbEventToModelEvent = (dbEvent) => {
  return {
    id: dbEvent.id,
    name: dbEvent.name,
    location: dbEvent.location,
    date: new Date(dbEvent.event_date).toISOString().split("T")[0],
    requiredSkills: JSON.parse(dbEvent.required_skills || "[]"),
    volunteersNeeded: 5, // Default value since it's not stored in the database
    urgency: dbEvent.urgency.charAt(0).toUpperCase() + dbEvent.urgency.slice(1), // Capitalize first letter
    volunteers: [],
  };
};

module.exports = {
  getAllVolunteers: async (status) => {
    try {
      let query = `
        SELECT uc.id, uc.username, up.full_name, up.skills, up.city, up.availability, 
               vm.status
        FROM UserCredentials uc
        JOIN UserProfile up ON uc.id = up.user_id
        LEFT JOIN VolunteerMatching vm ON uc.id = vm.volunteer_id
        WHERE uc.role = 'volunteer'
      `;

      // Filter volunteers by status if provided
      if (status) {
        if (status === "Waiting") {
          query += ` AND (vm.status IS NULL OR vm.id IS NULL)`;
        } else {
          query += ` AND vm.status = ?`;
          const volunteers = await db.query(query, [status]);
          return volunteers.map(mapDbVolunteerToModelVolunteer);
        }
      }

      const volunteers = await db.query(query);
      return volunteers.map(mapDbVolunteerToModelVolunteer);
    } catch (error) {
      console.error("Error getting all volunteers:", error);
      throw error;
    }
  },

  getVolunteerById: async (id) => {
    try {
      const volunteers = await db.query(
        `
        SELECT uc.id, uc.username, up.full_name, up.skills, up.city, up.availability
        FROM UserCredentials uc
        JOIN UserProfile up ON uc.id = up.user_id
        WHERE uc.id = ? AND uc.role = 'volunteer'
      `,
        [id]
      );

      if (volunteers.length === 0) {
        return null;
      }

      return mapDbVolunteerToModelVolunteer(volunteers[0]);
    } catch (error) {
      console.error("Error getting volunteer by ID:", error);
      throw error;
    }
  },

  getAllEvents: async () => {
    try {
      const events = await db.query("SELECT * FROM EventDetails");
      const mappedEvents = events.map(mapDbEventToModelEvent);

      // For each event, get the volunteers
      for (const event of mappedEvents) {
        const volunteers = await db.query(
          `
          SELECT vm.volunteer_id as id, up.full_name as name, vm.status
          FROM VolunteerMatching vm
          JOIN UserProfile up ON vm.volunteer_id = up.user_id
          WHERE vm.event_id = ?
        `,
          [event.id]
        );

        event.volunteers = volunteers.map((v) => ({
          id: v.id,
          name: v.name,
          status: v.status,
        }));
      }

      return mappedEvents;
    } catch (error) {
      console.error("Error getting all events:", error);
      throw error;
    }
  },

  getEventById: async (id) => {
    try {
      const events = await db.query("SELECT * FROM EventDetails WHERE id = ?", [
        id,
      ]);

      if (events.length === 0) {
        return null;
      }

      const event = mapDbEventToModelEvent(events[0]);

      // Get volunteers for this event
      const volunteers = await db.query(
        `
        SELECT vm.volunteer_id as id, up.full_name as name, vm.status
        FROM VolunteerMatching vm
        JOIN UserProfile up ON vm.volunteer_id = up.user_id
        WHERE vm.event_id = ?
      `,
        [id]
      );

      event.volunteers = volunteers.map((v) => ({
        id: v.id,
        name: v.name,
        status: v.status,
      }));

      return event;
    } catch (error) {
      console.error("Error getting event by ID:", error);
      throw error;
    }
  },

  getAllMatches: async (eventId) => {
    try {
      let query = `
        SELECT vm.id, vm.volunteer_id, vm.event_id, vm.status, vm.match_score, vm.created_at,
               up.full_name as volunteer_name, ed.name as event_name
        FROM VolunteerMatching vm
        JOIN UserProfile up ON vm.volunteer_id = up.user_id
        JOIN EventDetails ed ON vm.event_id = ed.id
      `;
      const params = [];

      if (eventId) {
        query += ` WHERE vm.event_id = ?`;
        params.push(eventId);
      }

      const matches = await db.query(query, params);

      return matches.map((m) => ({
        id: m.id,
        volunteerId: m.volunteer_id,
        eventId: m.event_id,
        volunteer: m.volunteer_name,
        event: m.event_name,
        status: m.status,
        matchScore: parseFloat(m.match_score),
        createdAt: m.created_at.toISOString(),
      }));
    } catch (error) {
      console.error("Error getting matches:", error);
      throw error;
    }
  },

  getEventMatches: async (eventId, status) => {
    try {
      // Get all volunteers who registered for this specific event with the given status
      const query = `
        SELECT vm.id, vm.volunteer_id, vm.event_id, vm.status, vm.match_score, 
               uc.username as email, up.full_name as name, up.skills, up.city as location, up.availability
        FROM VolunteerMatching vm
        JOIN UserCredentials uc ON vm.volunteer_id = uc.id 
        JOIN UserProfile up ON vm.volunteer_id = up.user_id
        WHERE vm.event_id = ? AND vm.status = ?
      `;

      const volunteers = await db.query(query, [eventId, status]);

      // Map the database results to the expected volunteer format
      return volunteers.map((v) => ({
        id: v.volunteer_id,
        name: v.name,
        email: v.email,
        skills: v.skills,
        location: v.location,
        availability: v.availability ? ["Weekdays", "Weekends"] : ["Weekends"],
        status: v.status,
        matchScore: Math.round(parseFloat(v.match_score) * 100), // Convert from 0-1 to percentage
        matchId: v.id,
      }));
    } catch (error) {
      console.error(
        `Error getting volunteers for event ${eventId} with status ${status}:`,
        error
      );
      throw error;
    }
  },

  createMatch: async (volunteerId, eventId, matchScore) => {
    try {
      // Check if a match already exists
      const existingMatches = await db.query(
        "SELECT * FROM VolunteerMatching WHERE volunteer_id = ? AND event_id = ?",
        [volunteerId, eventId]
      );

      if (existingMatches.length > 0) {
        throw new Error("A match already exists for this volunteer and event");
      }

      // Insert the new match
      const result = await db.query(
        `INSERT INTO VolunteerMatching 
        (volunteer_id, event_id, status, match_score, created_at, updated_at) 
        VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [volunteerId, eventId, "Waiting", matchScore || 0]
      );

      if (result.affectedRows === 0) {
        throw new Error("Failed to create match");
      }

      // Get the created match
      const createdMatch = await db.query(
        `SELECT vm.*, up.full_name as volunteer_name, ed.name as event_name
        FROM VolunteerMatching vm
        JOIN UserProfile up ON vm.volunteer_id = up.user_id
        JOIN EventDetails ed ON vm.event_id = ed.id
        WHERE vm.id = ?`,
        [result.insertId]
      );

      return {
        id: createdMatch[0].id,
        volunteerId: createdMatch[0].volunteer_id,
        eventId: createdMatch[0].event_id,
        status: createdMatch[0].status,
        matchScore: createdMatch[0].match_score,
        volunteerName: createdMatch[0].volunteer_name,
        eventName: createdMatch[0].event_name,
        createdAt: createdMatch[0].created_at,
      };
    } catch (error) {
      console.error("Error creating match:", error);
      throw error;
    }
  },

  calculateMatchScore: (volunteer, event) => {
    try {
      let score = 0;
      const maxScore = 100;

      // Parse skills if they're in string format
      let volunteerSkills = [];
      if (typeof volunteer.skills === "string") {
        try {
          volunteerSkills = JSON.parse(volunteer.skills);
        } catch (error) {
          volunteerSkills = [];
        }
      } else if (Array.isArray(volunteer.skills)) {
        volunteerSkills = volunteer.skills;
      }

      // Parse required skills if they're in string format
      let eventRequiredSkills = [];
      if (typeof event.requiredSkills === "string") {
        try {
          eventRequiredSkills = JSON.parse(event.requiredSkills);
        } catch (error) {
          eventRequiredSkills = [];
        }
      } else if (Array.isArray(event.requiredSkills)) {
        eventRequiredSkills = event.requiredSkills;
      } else if (typeof event.required_skills === "string") {
        try {
          eventRequiredSkills = JSON.parse(event.required_skills);
        } catch (error) {
          eventRequiredSkills = [];
        }
      }

      // Skills match (up to 60 points)
      if (eventRequiredSkills.length > 0 && volunteerSkills.length > 0) {
        const matchingSkills = volunteerSkills.filter((skill) =>
          eventRequiredSkills.includes(skill)
        );

        const skillMatchPercentage =
          matchingSkills.length / eventRequiredSkills.length;
        score += Math.min(60, Math.round(skillMatchPercentage * 60));
      } else {
        // If no skills required, give 30 points by default
        score += 30;
      }

      // Location match (up to 20 points)
      if (volunteer.location && event.location) {
        // Simple string match - in a real app, use distance calculation
        if (volunteer.location.toLowerCase() === event.location.toLowerCase()) {
          score += 20;
        } else {
          // Partial match - first word matches (e.g., "New York" vs "New Jersey")
          const volunteerCity = volunteer.location.split(" ")[0].toLowerCase();
          const eventCity = event.location.split(" ")[0].toLowerCase();

          if (volunteerCity === eventCity) {
            score += 10;
          }
        }
      }

      // Urgency factor (up to 20 points)
      if (event.urgency) {
        switch (event.urgency.toLowerCase()) {
          case "high":
            score += 20;
            break;
          case "medium":
            score += 10;
            break;
          case "low":
            score += 5;
            break;
          default:
            score += 10; // Default medium urgency
        }
      }

      // Normalize score to be between 0 and 1 for database storage
      return Math.min(score / 100, 1).toFixed(2);
    } catch (error) {
      console.error("Error calculating match score:", error);
      return 0;
    }
  },

  updateMatchStatus: async (id, status) => {
    try {
      // Validate status
      const validStatuses = ["Waiting", "Pending", "Active", "Completed"];
      if (!validStatuses.includes(status)) {
        throw new Error(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        );
      }

      // Update the match
      const result = await db.query(
        "UPDATE VolunteerMatching SET status = ?, updated_at = NOW() WHERE id = ?",
        [status, id]
      );

      if (result.affectedRows === 0) {
        throw new Error("Match not found or status not updated");
      }

      // Get the updated match
      const updatedMatch = await db.query(
        `SELECT vm.*, up.full_name as volunteer_name, ed.name as event_name
        FROM VolunteerMatching vm
        JOIN UserProfile up ON vm.volunteer_id = up.user_id
        JOIN EventDetails ed ON vm.event_id = ed.id
        WHERE vm.id = ?`,
        [id]
      );

      if (updatedMatch.length === 0) {
        return null;
      }

      return {
        id: updatedMatch[0].id,
        volunteerId: updatedMatch[0].volunteer_id,
        eventId: updatedMatch[0].event_id,
        status: updatedMatch[0].status,
        matchScore: updatedMatch[0].match_score,
        volunteerName: updatedMatch[0].volunteer_name,
        eventName: updatedMatch[0].event_name,
        updatedAt: updatedMatch[0].updated_at,
      };
    } catch (error) {
      console.error("Error updating match status:", error);
      throw error;
    }
  },

  // Expose validation functions for testing
  validateVolunteer,
  validateEvent,
};

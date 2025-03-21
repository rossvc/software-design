const db = require('../utils/db');

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
    skills: JSON.parse(dbVolunteer.skills || '[]'),
    availability: dbVolunteer.availability ? ["Weekdays", "Weekends"] : ["Weekends"],
    location: dbVolunteer.city,
    matchScore: dbVolunteer.match_score || 0
  };
};

// Helper function to map database event to model format
const mapDbEventToModelEvent = (dbEvent) => {
  return {
    id: dbEvent.id,
    name: dbEvent.name,
    location: dbEvent.location,
    date: new Date(dbEvent.event_date).toISOString().split('T')[0],
    requiredSkills: JSON.parse(dbEvent.required_skills || '[]'),
    volunteersNeeded: 5, // Default value since it's not stored in the database
    urgency: dbEvent.urgency.charAt(0).toUpperCase() + dbEvent.urgency.slice(1), // Capitalize first letter
    volunteers: []
  };
};

module.exports = {
  getAllVolunteers: async () => {
    try {
      const volunteers = await db.query(`
        SELECT uc.id, uc.username, up.full_name, up.skills, up.city, up.availability
        FROM UserCredentials uc
        JOIN UserProfile up ON uc.id = up.user_id
        WHERE uc.role = 'volunteer'
      `);
      
      return volunteers.map(mapDbVolunteerToModelVolunteer);
    } catch (error) {
      console.error('Error getting all volunteers:', error);
      throw error;
    }
  },

  getVolunteerById: async (id) => {
    try {
      const volunteers = await db.query(`
        SELECT uc.id, uc.username, up.full_name, up.skills, up.city, up.availability
        FROM UserCredentials uc
        JOIN UserProfile up ON uc.id = up.user_id
        WHERE uc.id = ? AND uc.role = 'volunteer'
      `, [id]);
      
      if (volunteers.length === 0) {
        return null;
      }
      
      return mapDbVolunteerToModelVolunteer(volunteers[0]);
    } catch (error) {
      console.error('Error getting volunteer by ID:', error);
      throw error;
    }
  },

  getAllEvents: async () => {
    try {
      const events = await db.query('SELECT * FROM EventDetails');
      const mappedEvents = events.map(mapDbEventToModelEvent);
      
      // For each event, get the volunteers
      for (const event of mappedEvents) {
        const volunteers = await db.query(`
          SELECT vm.volunteer_id as id, up.full_name as name, vm.status
          FROM VolunteerMatching vm
          JOIN UserProfile up ON vm.volunteer_id = up.user_id
          WHERE vm.event_id = ?
        `, [event.id]);
        
        event.volunteers = volunteers.map(v => ({
          id: v.id,
          name: v.name,
          status: v.status
        }));
      }
      
      return mappedEvents;
    } catch (error) {
      console.error('Error getting all events:', error);
      throw error;
    }
  },

  getEventById: async (id) => {
    try {
      const events = await db.query('SELECT * FROM EventDetails WHERE id = ?', [id]);
      
      if (events.length === 0) {
        return null;
      }
      
      const event = mapDbEventToModelEvent(events[0]);
      
      // Get volunteers for this event
      const volunteers = await db.query(`
        SELECT vm.volunteer_id as id, up.full_name as name, vm.status
        FROM VolunteerMatching vm
        JOIN UserProfile up ON vm.volunteer_id = up.user_id
        WHERE vm.event_id = ?
      `, [id]);
      
      event.volunteers = volunteers.map(v => ({
        id: v.id,
        name: v.name,
        status: v.status
      }));
      
      return event;
    } catch (error) {
      console.error('Error getting event by ID:', error);
      throw error;
    }
  },

  getAllMatches: async () => {
    try {
      const matches = await db.query(`
        SELECT vm.id, vm.volunteer_id, vm.event_id, vm.status, vm.match_score, vm.created_at,
               up.full_name as volunteer_name, ed.name as event_name
        FROM VolunteerMatching vm
        JOIN UserProfile up ON vm.volunteer_id = up.user_id
        JOIN EventDetails ed ON vm.event_id = ed.id
      `);
      
      return matches.map(m => ({
        id: m.id,
        volunteerId: m.volunteer_id,
        eventId: m.event_id,
        volunteer: m.volunteer_name,
        event: m.event_name,
        status: m.status,
        matchScore: parseFloat(m.match_score),
        createdAt: m.created_at.toISOString()
      }));
    } catch (error) {
      console.error('Error getting all matches:', error);
      throw error;
    }
  },

  createMatch: async (volunteerId, eventId) => {
    try {
      // Get volunteer and event to validate
      const volunteer = await module.exports.getVolunteerById(volunteerId);
      const event = await module.exports.getEventById(eventId);

      if (!volunteer || !event) {
        throw new Error("Volunteer or event not found");
      }

      // Validate volunteer and event before creating match
      const volunteerErrors = validateVolunteer(volunteer);
      const eventErrors = validateEvent(event);

      if (volunteerErrors.length > 0 || eventErrors.length > 0) {
        throw new Error(
          JSON.stringify({
            volunteerErrors,
            eventErrors,
          })
        );
      }

      // Calculate match score
      const matchScore = module.exports.calculateMatchScore(volunteer, event);

      // Check if match already exists
      const existingMatches = await db.query(
        'SELECT * FROM VolunteerMatching WHERE volunteer_id = ? AND event_id = ?',
        [volunteerId, eventId]
      );
      
      if (existingMatches.length > 0) {
        throw new Error("Match already exists");
      }

      // Create the match
      const result = await db.query(
        `INSERT INTO VolunteerMatching (volunteer_id, event_id, status, match_score) 
         VALUES (?, ?, ?, ?)`,
        [volunteerId, eventId, 'Pending', matchScore]
      );

      // Get the newly created match
      const newMatches = await db.query(
        `SELECT vm.id, vm.volunteer_id, vm.event_id, vm.status, vm.match_score, vm.created_at,
                up.full_name as volunteer_name, ed.name as event_name
         FROM VolunteerMatching vm
         JOIN UserProfile up ON vm.volunteer_id = up.user_id
         JOIN EventDetails ed ON vm.event_id = ed.id
         WHERE vm.id = ?`,
        [result.insertId]
      );

      if (newMatches.length === 0) {
        throw new Error("Failed to retrieve created match");
      }

      const m = newMatches[0];
      return {
        id: m.id,
        volunteerId: m.volunteer_id,
        eventId: m.event_id,
        volunteer: m.volunteer_name,
        event: m.event_name,
        status: m.status,
        matchScore: parseFloat(m.match_score),
        createdAt: m.created_at.toISOString()
      };
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  },

  calculateMatchScore: (volunteer, event) => {
    // Validate inputs before calculating score
    const volunteerErrors = validateVolunteer(volunteer);
    const eventErrors = validateEvent(event);

    if (volunteerErrors.length > 0 || eventErrors.length > 0) {
      throw new Error(
        JSON.stringify({
          volunteerErrors,
          eventErrors,
        })
      );
    }

    let score = 0;

    // Check if volunteer has required skills
    const hasRequiredSkills = event.requiredSkills.every((skill) =>
      volunteer.skills.includes(skill)
    );

    if (hasRequiredSkills) {
      score += 50;
    }

    // Add points for each matching skill
    event.requiredSkills.forEach((skill) => {
      if (volunteer.skills.includes(skill)) {
        score += 10;
      }
    });

    // Check location proximity (simplified)
    if (volunteer.location === event.location.split(" ")[0]) {
      score += 20;
    }

    return Math.min(score, 100);
  },

  // Expose validation functions for testing
  validateVolunteer,
  validateEvent,
};

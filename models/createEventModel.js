const db = require("../utils/db");

// Validate event data
const validateEvent = (event) => {
  // Required fields validation
  const requiredFields = [
    "eventName",
    "description",
    "location",
    "urgency",
    "startTime",
    "endTime",
    "date",
  ];
  for (const field of requiredFields) {
    if (!event[field]) {
      throw new Error(`${field} is required`);
    }
  }

  // Field type validation
  if (typeof event.eventName !== "string")
    throw new Error("Event name must be a string");
  if (typeof event.description !== "string")
    throw new Error("Description must be a string");
  if (typeof event.location !== "string")
    throw new Error("Location must be a string");
  if (typeof event.urgency !== "string")
    throw new Error("Urgency must be a string");
  if (typeof event.startTime !== "string")
    throw new Error("Start time must be a string");
  if (typeof event.endTime !== "string")
    throw new Error("End time must be a string");
  if (typeof event.date !== "string") throw new Error("Date must be a string");
  if (!Array.isArray(event.skills)) throw new Error("Skills must be an array");

  // Field length validation
  if (event.eventName.length < 3)
    throw new Error("Event name must be at least 3 characters");
  if (event.description.length < 10)
    throw new Error("Description must be at least 10 characters");
  if (event.location.length < 3)
    throw new Error("Location must be at least 3 characters");

  // Urgency enum validation
  const validUrgencies = ["High", "Medium", "Low"];
  if (!validUrgencies.includes(event.urgency)) {
    throw new Error("Urgency must be High, Medium, or Low");
  }

  // Time format validation
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(event.startTime))
    throw new Error("Start time must be in HH:MM format");
  if (!timeRegex.test(event.endTime))
    throw new Error("End time must be in HH:MM format");

  // Date format validation
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(event.date))
    throw new Error("Date must be in YYYY-MM-DD format");
};

// Helper function to convert database event to model event
const mapDbEventToModelEvent = (dbEvent) => {
  return {
    id: dbEvent.id,
    eventName: dbEvent.name,
    description: dbEvent.description,
    location: dbEvent.location,
    urgency: dbEvent.urgency.charAt(0).toUpperCase() + dbEvent.urgency.slice(1), // Capitalize first letter
    skills: JSON.parse(dbEvent.required_skills),
    image: dbEvent.image_url,
    startTime: new Date(dbEvent.event_date).toTimeString().substring(0, 5),
    endTime: new Date(dbEvent.event_date).toTimeString().substring(0, 5), // Assuming end time is not stored separately
    date: new Date(dbEvent.event_date).toISOString().split("T")[0],
    createdAt: dbEvent.created_at
      ? new Date(dbEvent.created_at).toISOString()
      : new Date().toISOString(),
  };
};

module.exports = {
  getAllEvents: async () => {
    try {
      const events = await db.query("SELECT * FROM EventDetails");
      return events.map(mapDbEventToModelEvent);
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
      return events.length ? mapDbEventToModelEvent(events[0]) : null;
    } catch (error) {
      console.error("Error getting event by ID:", error);
      throw error;
    }
  },

  addEvent: async (event) => {
    try {
      validateEvent(event);

      // Combine date and start time for event_date
      const eventDate = `${event.date} ${event.startTime}:00`;

      // Convert urgency to lowercase for database
      const urgency = event.urgency.toLowerCase();

      const result = await db.query(
        `INSERT INTO EventDetails 
         (name, description, location, required_skills, urgency, event_date) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          event.eventName,
          event.description,
          event.location,
          JSON.stringify(event.skills || []),
          urgency,
          eventDate,
        ]
      );

      return {
        id: result.insertId,
        ...event,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error adding event:", error);
      throw error;
    }
  },

  updateEvent: async (id, updatedFields) => {
    try {
      // First get the current event
      const currentEvent = await module.exports.getEventById(id);
      if (!currentEvent) {
        return null;
      }

      // Merge current event with updated fields
      const updatedEvent = {
        ...currentEvent,
        ...updatedFields,
      };

      // Validate the updated event
      validateEvent(updatedEvent);

      // Combine date and start time for event_date
      const eventDate = `${updatedEvent.date} ${updatedEvent.startTime}:00`;

      // Convert urgency to lowercase for database
      const urgency = updatedEvent.urgency.toLowerCase();

      // Update in database
      await db.query(
        `UPDATE EventDetails 
         SET name = ?, description = ?, location = ?, required_skills = ?, 
             urgency = ?, event_date = ? 
         WHERE id = ?`,
        [
          updatedEvent.eventName,
          updatedEvent.description,
          updatedEvent.location,
          JSON.stringify(updatedEvent.skills),
          urgency,
          eventDate,
          id,
        ]
      );

      return {
        ...updatedEvent,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  },

  deleteEvent: async (id) => {
    try {
      const result = await db.query("DELETE FROM EventDetails WHERE id = ?", [
        id,
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },

  validateEvent, // Export for testing
};

const db = require("../utils/db");

// Validate event data
const validateEvent = (event) => {
  // Required fields validation
  const requiredFields = [
    "name",
    "description",
    "location",
    "urgency",
    "event_date"
  ];
  for (const field of requiredFields) {
    if (!event[field]) {
      throw new Error(`${field} is required`);
    }
  }

  // Field type validation
  if (typeof event.name !== "string")
    throw new Error("Event name must be a string");
  if (typeof event.description !== "string")
    throw new Error("Description must be a string");
  if (typeof event.location !== "string")
    throw new Error("Location must be a string");
  if (typeof event.urgency !== "string")
    throw new Error("Urgency must be a string");
  if (typeof event.event_date !== "string")
    throw new Error("Event date must be a string");
  
  // Field length validation
  if (event.name.length < 3)
    throw new Error("Event name must be at least 3 characters");
  if (event.description.length < 10)
    throw new Error("Description must be at least 10 characters");
  if (event.location.length < 3)
    throw new Error("Location must be at least 3 characters");

  // Urgency enum validation
  const validUrgencies = ["high", "medium", "low"];
  if (!validUrgencies.includes(event.urgency.toLowerCase())) {
    throw new Error("Urgency must be high, medium, or low");
  }

  // Date format validation
  const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
  if (!dateTimeRegex.test(event.event_date))
    throw new Error("Event date must be in YYYY-MM-DDThh:mm:ss format");
};

// Helper function to convert database event to model event
const mapDbEventToModelEvent = (dbEvent) => {
  return {
    id: dbEvent.id,
    name: dbEvent.name,
    description: dbEvent.description,
    location: dbEvent.location,
    urgency: dbEvent.urgency,
    required_skills: dbEvent.required_skills || "",
    image_url: dbEvent.image_url,
    event_date: dbEvent.event_date,
    created_at: dbEvent.created_at
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

      // Convert urgency to lowercase for database
      const urgency = event.urgency.toLowerCase();

      const result = await db.query(
        `INSERT INTO EventDetails 
         (name, description, location, required_skills, urgency, event_date, image_url) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          event.name,
          event.description,
          event.location,
          event.required_skills,
          urgency,
          event.event_date,
          event.image_url || null
        ]
      );

      return {
        id: result.insertId,
        ...event,
        created_at: new Date().toISOString(),
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

      // Convert urgency to lowercase for database
      const urgency = updatedEvent.urgency.toLowerCase();

      // Update in database
      await db.query(
        `UPDATE EventDetails 
         SET name = ?, description = ?, location = ?, required_skills = ?, 
             urgency = ?, event_date = ?, image_url = ? 
         WHERE id = ?`,
        [
          updatedEvent.name,
          updatedEvent.description,
          updatedEvent.location,
          updatedEvent.required_skills,
          urgency,
          updatedEvent.event_date,
          updatedEvent.image_url || null,
          id,
        ]
      );

      return {
        ...updatedEvent,
        updated_at: new Date().toISOString(),
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

const db = require("../utils/db");

// Valid statuses
const validStatuses = ["Upcoming", "Completed", "Cancelled", "In Progress"];

const validateHistory = (history) => {
  const errors = [];

  // Required fields
  if (!history.volunteerId) errors.push("Volunteer ID is required");
  if (!history.eventId) errors.push("Event ID is required");
  if (!history.eventDate) errors.push("Event date is required");

  // Field types
  if (typeof history.volunteerId !== "number")
    errors.push("Volunteer ID must be a number");
  if (typeof history.eventId !== "number")
    errors.push("Event ID must be a number");
  if (history.eventDate && typeof history.eventDate !== "string")
    errors.push("Event date must be a string");
  if (history.status && typeof history.status !== "string")
    errors.push("Status must be a string");
  if (
    history.hoursServed !== undefined &&
    typeof history.hoursServed !== "number"
  )
    errors.push("Hours served must be a number");

  // Date format
  if (history.eventDate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(history.eventDate))
      errors.push("Invalid date format (should be YYYY-MM-DD)");
  }

  // Status enum
  if (history.status && !validStatuses.includes(history.status))
    errors.push(`Status must be one of: ${validStatuses.join(", ")}`);

  // Hours served validation
  if (history.hoursServed !== undefined && history.hoursServed < 0)
    errors.push("Hours served cannot be negative");

  return errors;
};

// Helper function to map database record to model format
const mapDbHistoryToModelHistory = async (dbHistory) => {
  try {
    // Get event details
    const events = await db.query("SELECT * FROM EventDetails WHERE id = ?", [
      dbHistory.event_id,
    ]);
    if (events.length === 0) {
      throw new Error(`Event with ID ${dbHistory.event_id} not found`);
    }

    const event = events[0];

    return {
      id: dbHistory.id,
      volunteerId: dbHistory.user_id,
      eventId: dbHistory.event_id,
      eventName: event.name,
      eventDescription: event.description,
      eventLocation: event.location,
      requiredSkills: JSON.parse(event.required_skills),
      urgency: event.urgency.charAt(0).toUpperCase() + event.urgency.slice(1), // Capitalize first letter
      eventDate: new Date(dbHistory.participation_date)
        .toISOString()
        .split("T")[0],
      status: dbHistory.status || "Upcoming",
      hoursServed: parseFloat(dbHistory.hours_served) || 0,
    };
  } catch (error) {
    console.error("Error mapping history record:", error);
    throw error;
  }
};

module.exports = {
  getAllHistory: async () => {
    try {
      const history = await db.query("SELECT * FROM VolunteerHistory");

      // Map each history record to include event details
      const mappedHistory = [];
      for (const record of history) {
        mappedHistory.push(await mapDbHistoryToModelHistory(record));
      }

      return mappedHistory;
    } catch (error) {
      console.error("Error getting all history:", error);
      throw error;
    }
  },

  getHistoryByVolunteerId: async (volunteerId) => {
    try {
      const history = await db.query(
        "SELECT * FROM VolunteerHistory WHERE user_id = ?",
        [volunteerId]
      );

      // Map each history record to include event details
      const mappedHistory = [];
      for (const record of history) {
        mappedHistory.push(await mapDbHistoryToModelHistory(record));
      }
      return mappedHistory;
    } catch (error) {
      console.error("Error getting history by volunteer ID:", error);
      throw error;
    }
  },

  getHistoryByEventId: async (eventId) => {
    try {
      const history = await db.query(
        "SELECT * FROM VolunteerHistory WHERE event_id = ?",
        [eventId]
      );

      // Map each history record to include event details
      const mappedHistory = [];
      for (const record of history) {
        mappedHistory.push(await mapDbHistoryToModelHistory(record));
      }

      return mappedHistory;
    } catch (error) {
      console.error("Error getting history by event ID:", error);
      throw error;
    }
  },

  getHistoryById: async (id) => {
    try {
      const history = await db.query(
        "SELECT * FROM VolunteerHistory WHERE id = ?",
        [id]
      );

      if (history.length === 0) {
        return null;
      }

      return await mapDbHistoryToModelHistory(history[0]);
    } catch (error) {
      console.error("Error getting history by ID:", error);
      throw error;
    }
  },

  addHistory: async (history) => {
    try {
      const errors = validateHistory(history);
      if (errors.length > 0) {
        throw new Error(JSON.stringify(errors));
      }

      // Format the participation date
      const participationDate = `${history.eventDate} 00:00:00`;

      const result = await db.query(
        `INSERT INTO VolunteerHistory (user_id, event_id, participation_date, hours_served) 
         VALUES (?, ?, ?, ?)`,
        [
          history.volunteerId,
          history.eventId,
          participationDate,
          history.hoursServed || 0,
        ]
      );

      // Get the newly created history record
      return await module.exports.getHistoryById(result.insertId);
    } catch (error) {
      console.error("Error adding history:", error);
      throw error;
    }
  },

  updateHistoryStatus: async (id, status) => {
    try {
      if (!validStatuses.includes(status)) {
        throw new Error(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        );
      }

      const historyRecord = await module.exports.getHistoryById(id);
      if (!historyRecord) {
        return null;
      }

      await db.query("UPDATE VolunteerHistory SET status = ? WHERE id = ?", [
        status,
        id,
      ]);

      // Get the updated history record
      return await module.exports.getHistoryById(id);
    } catch (error) {
      console.error("Error updating history status:", error);
      throw error;
    }
  },

  updateHoursServed: async (id, hours) => {
    try {
      if (typeof hours !== "number" || hours < 0) {
        throw new Error("Hours served must be a non-negative number");
      }

      const historyRecord = await module.exports.getHistoryById(id);
      if (!historyRecord) {
        return null;
      }

      await db.query(
        "UPDATE VolunteerHistory SET hours_served = ? WHERE id = ?",
        [hours, id]
      );

      // Get the updated history record
      return await module.exports.getHistoryById(id);
    } catch (error) {
      console.error("Error updating hours served:", error);
      throw error;
    }
  },

  getVolunteerStats: async (volunteerId) => {
    try {
      const volunteerRecords = await module.exports.getHistoryByVolunteerId(
        volunteerId
      );

      const completedEvents = volunteerRecords.filter(
        (h) => h.status === "Completed"
      );
      const totalHours = completedEvents.reduce(
        (sum, record) => sum + record.hoursServed,
        0
      );

      return {
        totalEvents: volunteerRecords.length,
        completedEvents: completedEvents.length,
        upcomingEvents: volunteerRecords.filter((h) => h.status === "Upcoming")
          .length,
        cancelledEvents: volunteerRecords.filter(
          (h) => h.status === "Cancelled"
        ).length,
        totalHoursServed: totalHours,
      };
    } catch (error) {
      console.error("Error getting volunteer stats:", error);
      throw error;
    }
  },

  // Expose validation function for testing
  validateHistory,
};

// Mock volunteer history data
const validStatuses = ["Upcoming", "Completed", "Cancelled", "In Progress"];

const validateHistory = (history) => {
  const errors = [];

  // Required fields
  if (!history.volunteerId) errors.push("Volunteer ID is required");
  if (!history.eventId) errors.push("Event ID is required");
  if (!history.eventName) errors.push("Event name is required");
  if (!history.eventDescription) errors.push("Event description is required");
  if (!history.eventLocation) errors.push("Event location is required");
  if (!history.requiredSkills || !Array.isArray(history.requiredSkills))
    errors.push("Required skills must be an array");
  if (!history.urgency) errors.push("Urgency is required");
  if (!history.eventDate) errors.push("Event date is required");
  if (!history.status) errors.push("Status is required");
  if (typeof history.hoursServed !== "number")
    errors.push("Hours served must be a number");

  // Field types
  if (typeof history.volunteerId !== "number")
    errors.push("Volunteer ID must be a number");
  if (typeof history.eventId !== "number")
    errors.push("Event ID must be a number");
  if (typeof history.eventName !== "string")
    errors.push("Event name must be a string");
  if (typeof history.eventDescription !== "string")
    errors.push("Event description must be a string");
  if (typeof history.eventLocation !== "string")
    errors.push("Event location must be a string");
  if (typeof history.urgency !== "string")
    errors.push("Urgency must be a string");
  if (typeof history.eventDate !== "string")
    errors.push("Event date must be a string");
  if (typeof history.status !== "string")
    errors.push("Status must be a string");

  // Field lengths
  if (
    history.eventName &&
    (history.eventName.length < 3 || history.eventName.length > 100)
  )
    errors.push("Event name must be between 3 and 100 characters");
  if (
    history.eventDescription &&
    (history.eventDescription.length < 10 ||
      history.eventDescription.length > 500)
  )
    errors.push("Event description must be between 10 and 500 characters");
  if (
    history.eventLocation &&
    (history.eventLocation.length < 2 || history.eventLocation.length > 100)
  )
    errors.push("Event location must be between 2 and 100 characters");

  // Date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(history.eventDate))
    errors.push("Invalid date format (should be YYYY-MM-DD)");

  // Status enum
  if (!validStatuses.includes(history.status))
    errors.push(`Status must be one of: ${validStatuses.join(", ")}`);

  // Hours served validation
  if (history.hoursServed < 0) errors.push("Hours served cannot be negative");

  // Urgency enum
  const validUrgencies = ["Low", "Medium", "High"];
  if (!validUrgencies.includes(history.urgency))
    errors.push("Urgency must be Low, Medium, or High");

  return errors;
};

const volunteerHistory = [
  {
    id: 1,
    volunteerId: 1,
    eventId: 3,
    eventName: "Teaching Workshop",
    eventDescription: "Basic teaching skills workshop",
    eventLocation: "Public Library",
    requiredSkills: ["Teaching"],
    urgency: "Low",
    eventDate: "2025-01-10",
    status: "Completed",
    hoursServed: 3,
  },
  {
    id: 2,
    volunteerId: 1,
    eventId: 2,
    eventName: "Senior Care Workshop",
    eventDescription: "Workshop on elderly care basics",
    eventLocation: "Community Center",
    requiredSkills: ["Elderly Care", "First Aid"],
    urgency: "Medium",
    eventDate: "2025-01-15",
    status: "Completed",
    hoursServed: 4,
  },
  {
    id: 3,
    volunteerId: 1,
    eventId: 1,
    eventName: "Beach Cleanup",
    eventDescription: "Community beach cleanup event",
    eventLocation: "Galveston Beach",
    requiredSkills: ["First Aid"],
    urgency: "High",
    eventDate: "2025-02-20",
    status: "Upcoming",
    hoursServed: 0,
  },
  {
    id: 4,
    volunteerId: 2,
    eventId: 2,
    eventName: "Senior Care Workshop",
    eventDescription: "Workshop on elderly care basics",
    eventLocation: "Community Center",
    requiredSkills: ["Elderly Care", "First Aid"],
    urgency: "Medium",
    eventDate: "2025-01-15",
    status: "Completed",
    hoursServed: 4,
  },
];

module.exports = {
  getAllHistory: () => volunteerHistory,
  getHistoryByVolunteerId: (volunteerId) =>
    volunteerHistory.filter((h) => h.volunteerId === volunteerId),
  getHistoryByEventId: (eventId) =>
    volunteerHistory.filter((h) => h.eventId === eventId),
  getHistoryById: (id) => volunteerHistory.find((h) => h.id === id),
  addHistory: (history) => {
    const errors = validateHistory(history);
    if (errors.length > 0) {
      throw new Error(JSON.stringify(errors));
    }

    const newHistory = {
      id: volunteerHistory.length + 1,
      ...history,
      createdAt: new Date().toISOString(),
    };
    volunteerHistory.push(newHistory);
    return newHistory;
  },
  updateHistoryStatus: (id, status) => {
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    const historyIndex = volunteerHistory.findIndex((h) => h.id === id);
    if (historyIndex === -1) {
      return null;
    }

    volunteerHistory[historyIndex].status = status;
    return volunteerHistory[historyIndex];
  },
  updateHoursServed: (id, hours) => {
    if (typeof hours !== "number" || hours < 0) {
      throw new Error("Hours served must be a non-negative number");
    }

    const historyIndex = volunteerHistory.findIndex((h) => h.id === id);
    if (historyIndex === -1) {
      return null;
    }

    volunteerHistory[historyIndex].hoursServed = hours;
    return volunteerHistory[historyIndex];
  },
  getVolunteerStats: (volunteerId) => {
    const volunteerRecords = volunteerHistory.filter(
      (h) => h.volunteerId === volunteerId
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
      cancelledEvents: volunteerRecords.filter((h) => h.status === "Cancelled")
        .length,
      totalHoursServed: totalHours,
    };
  },
  // Expose validation function for testing
  validateHistory,
};

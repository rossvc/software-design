const {
  getAllHistory,
  getHistoryByVolunteerId,
  getHistoryByEventId,
  getHistoryById,
  addHistory,
  updateHistoryStatus,
  updateHoursServed,
  getVolunteerStats,
  validateHistory,
} = require("../volunteerHistoryModel");

describe("Volunteer History Model", () => {
  describe("History Validation", () => {
    test("validates a valid history entry", () => {
      const history = {
        volunteerId: 1,
        eventId: 1,
        eventName: "Test Event",
        eventDescription: "This is a test event description",
        eventLocation: "Test Location",
        requiredSkills: ["Teaching"],
        urgency: "High",
        eventDate: "2025-03-15",
        status: "Upcoming",
        hoursServed: 0,
      };
      const errors = validateHistory(history);
      expect(errors).toHaveLength(0);
    });

    test("validates required fields", () => {
      const history = {};
      const errors = validateHistory(history);
      expect(errors).toContain("Volunteer ID is required");
      expect(errors).toContain("Event ID is required");
      expect(errors).toContain("Event name is required");
      expect(errors).toContain("Event description is required");
      expect(errors).toContain("Event location is required");
      expect(errors).toContain("Required skills must be an array");
      expect(errors).toContain("Urgency is required");
      expect(errors).toContain("Event date is required");
      expect(errors).toContain("Status is required");
      expect(errors).toContain("Hours served must be a number");
    });

    test("validates field types", () => {
      const history = {
        volunteerId: "not a number",
        eventId: "not a number",
        eventName: 123,
        eventDescription: 456,
        eventLocation: 789,
        requiredSkills: "not an array",
        urgency: 123,
        eventDate: 456,
        status: 789,
        hoursServed: "not a number",
      };
      const errors = validateHistory(history);
      expect(errors).toContain("Volunteer ID must be a number");
      expect(errors).toContain("Event ID must be a number");
      expect(errors).toContain("Event name must be a string");
      expect(errors).toContain("Event description must be a string");
      expect(errors).toContain("Event location must be a string");
      expect(errors).toContain("Required skills must be an array");
      expect(errors).toContain("Urgency must be a string");
      expect(errors).toContain("Event date must be a string");
      expect(errors).toContain("Status must be a string");
    });

    test("validates field lengths", () => {
      const history = {
        volunteerId: 1,
        eventId: 1,
        eventName: "ab",
        eventDescription: "too short",
        eventLocation: "a",
        requiredSkills: [],
        urgency: "High",
        eventDate: "2025-03-15",
        status: "Upcoming",
        hoursServed: 0,
      };
      const errors = validateHistory(history);
      expect(errors).toContain(
        "Event name must be between 3 and 100 characters"
      );
      expect(errors).toContain(
        "Event description must be between 10 and 500 characters"
      );
      expect(errors).toContain(
        "Event location must be between 2 and 100 characters"
      );
    });

    test("validates date format", () => {
      const history = {
        volunteerId: 1,
        eventId: 1,
        eventName: "Test Event",
        eventDescription: "This is a test event description",
        eventLocation: "Test Location",
        requiredSkills: [],
        urgency: "High",
        eventDate: "invalid-date",
        status: "Upcoming",
        hoursServed: 0,
      };
      const errors = validateHistory(history);
      expect(errors).toContain("Invalid date format (should be YYYY-MM-DD)");
    });

    test("validates status enum", () => {
      const history = {
        volunteerId: 1,
        eventId: 1,
        eventName: "Test Event",
        eventDescription: "This is a test event description",
        eventLocation: "Test Location",
        requiredSkills: [],
        urgency: "High",
        eventDate: "2025-03-15",
        status: "Invalid",
        hoursServed: 0,
      };
      const errors = validateHistory(history);
      expect(errors).toContain(
        "Status must be one of: Upcoming, Completed, Cancelled, In Progress"
      );
    });

    test("validates hours served", () => {
      const history = {
        volunteerId: 1,
        eventId: 1,
        eventName: "Test Event",
        eventDescription: "This is a test event description",
        eventLocation: "Test Location",
        requiredSkills: [],
        urgency: "High",
        eventDate: "2025-03-15",
        status: "Completed",
        hoursServed: -1,
      };
      const errors = validateHistory(history);
      expect(errors).toContain("Hours served cannot be negative");
    });

    test("validates urgency enum", () => {
      const history = {
        volunteerId: 1,
        eventId: 1,
        eventName: "Test Event",
        eventDescription: "This is a test event description",
        eventLocation: "Test Location",
        requiredSkills: [],
        urgency: "Invalid",
        eventDate: "2025-03-15",
        status: "Upcoming",
        hoursServed: 0,
      };
      const errors = validateHistory(history);
      expect(errors).toContain("Urgency must be Low, Medium, or High");
    });
  });

  describe("History Management", () => {
    test("adds valid history entry", () => {
      const history = {
        volunteerId: 1,
        eventId: 1,
        eventName: "Test Event",
        eventDescription: "This is a test event description",
        eventLocation: "Test Location",
        requiredSkills: ["Teaching"],
        urgency: "High",
        eventDate: "2025-03-15",
        status: "Upcoming",
        hoursServed: 0,
      };
      const newHistory = addHistory(history);
      expect(newHistory).toHaveProperty("id");
      expect(newHistory).toHaveProperty("createdAt");
      expect(newHistory.eventName).toBe("Test Event");
    });

    test("throws error when adding invalid history", () => {
      const history = {
        volunteerId: "invalid",
        eventId: "invalid",
      };
      expect(() => addHistory(history)).toThrow();
    });

    test("updates history status", () => {
      const updated = updateHistoryStatus(1, "Completed");
      expect(updated.status).toBe("Completed");
    });

    test("throws error when updating to invalid status", () => {
      expect(() => updateHistoryStatus(1, "Invalid")).toThrow();
    });

    test("returns null when updating non-existent history status", () => {
      const result = updateHistoryStatus(999, "Completed");
      expect(result).toBeNull();
    });

    test("updates hours served", () => {
      const updated = updateHoursServed(1, 5);
      expect(updated.hoursServed).toBe(5);
    });

    test("throws error when updating to invalid hours", () => {
      expect(() => updateHoursServed(1, -1)).toThrow();
      expect(() => updateHoursServed(1, "invalid")).toThrow();
    });

    test("returns null when updating non-existent history hours", () => {
      const result = updateHoursServed(999, 5);
      expect(result).toBeNull();
    });
  });

  describe("History Queries", () => {
    test("gets all history", () => {
      const allHistory = getAllHistory();
      expect(Array.isArray(allHistory)).toBe(true);
      expect(allHistory.length).toBeGreaterThan(0);
    });

    test("gets history by volunteer id", () => {
      const history = getHistoryByVolunteerId(1);
      expect(Array.isArray(history)).toBe(true);
      history.forEach((h) => expect(h.volunteerId).toBe(1));
    });

    test("gets history by event id", () => {
      const history = getHistoryByEventId(2);
      expect(Array.isArray(history)).toBe(true);
      history.forEach((h) => expect(h.eventId).toBe(2));
    });

    test("gets history by id", () => {
      const history = getHistoryById(1);
      expect(history).toHaveProperty("id", 1);
    });

    test("returns undefined for non-existent history id", () => {
      const history = getHistoryById(999);
      expect(history).toBeUndefined();
    });
  });

  describe("Volunteer Statistics", () => {
    test("gets volunteer stats", () => {
      const stats = getVolunteerStats(1);
      expect(stats).toHaveProperty("totalEvents");
      expect(stats).toHaveProperty("completedEvents");
      expect(stats).toHaveProperty("upcomingEvents");
      expect(stats).toHaveProperty("cancelledEvents");
      expect(stats).toHaveProperty("totalHoursServed");
    });

    test("returns zero stats for non-existent volunteer", () => {
      const stats = getVolunteerStats(999);
      expect(stats.totalEvents).toBe(0);
      expect(stats.completedEvents).toBe(0);
      expect(stats.upcomingEvents).toBe(0);
      expect(stats.cancelledEvents).toBe(0);
      expect(stats.totalHoursServed).toBe(0);
    });
  });
});

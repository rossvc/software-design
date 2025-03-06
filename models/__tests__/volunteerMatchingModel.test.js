const {
  volunteers,
  events,
  matches,
  getAllVolunteers,
  getVolunteerById,
  getAllEvents,
  getEventById,
  getAllMatches,
  createMatch,
  calculateMatchScore,
  validateVolunteer,
  validateEvent,
} = require("../volunteerMatchingModel");

describe("Volunteer Matching Model", () => {
  describe("Volunteer Validation", () => {
    test("validates a valid volunteer", () => {
      const volunteer = {
        name: "Test User",
        email: "test@example.com",
        skills: ["Teaching"],
        availability: ["Weekdays"],
        location: "Houston",
      };
      const errors = validateVolunteer(volunteer);
      expect(errors).toHaveLength(0);
    });

    test("validates required fields", () => {
      const volunteer = {};
      const errors = validateVolunteer(volunteer);
      expect(errors).toContain("Name is required");
      expect(errors).toContain("Email is required");
      expect(errors).toContain("Skills must be an array");
      expect(errors).toContain("Availability must be an array");
      expect(errors).toContain("Location is required");
    });

    test("validates field types", () => {
      const volunteer = {
        name: 123,
        email: 456,
        skills: "not an array",
        availability: "not an array",
        location: 789,
      };
      const errors = validateVolunteer(volunteer);
      expect(errors).toContain("Name must be a string");
      expect(errors).toContain("Email must be a string");
      expect(errors).toContain("Skills must be an array");
      expect(errors).toContain("Availability must be an array");
      expect(errors).toContain("Location must be a string");
    });

    test("validates field lengths", () => {
      const volunteer = {
        name: "a",
        email: "test@example.com",
        skills: [],
        availability: [],
        location: "a",
      };
      const errors = validateVolunteer(volunteer);
      expect(errors).toContain("Name must be between 2 and 50 characters");
      expect(errors).toContain("Location must be between 2 and 100 characters");
    });

    test("validates email format", () => {
      const volunteer = {
        name: "Test User",
        email: "invalid-email",
        skills: [],
        availability: [],
        location: "Houston",
      };
      const errors = validateVolunteer(volunteer);
      expect(errors).toContain("Invalid email format");
    });
  });

  describe("Event Validation", () => {
    test("validates a valid event", () => {
      const event = {
        name: "Test Event",
        location: "Test Location",
        date: "2025-03-15",
        requiredSkills: ["Teaching"],
        volunteersNeeded: 5,
        urgency: "High",
      };
      const errors = validateEvent(event);
      expect(errors).toHaveLength(0);
    });

    test("validates required fields", () => {
      const event = {};
      const errors = validateEvent(event);
      expect(errors).toContain("Event name is required");
      expect(errors).toContain("Event location is required");
      expect(errors).toContain("Event date is required");
      expect(errors).toContain("Required skills must be an array");
      expect(errors).toContain("Volunteers needed must be a number");
      expect(errors).toContain("Urgency is required");
    });

    test("validates field types", () => {
      const event = {
        name: 123,
        location: 456,
        date: 789,
        requiredSkills: "not an array",
        volunteersNeeded: "not a number",
        urgency: 123,
      };
      const errors = validateEvent(event);
      expect(errors).toContain("Event name must be a string");
      expect(errors).toContain("Location must be a string");
      expect(errors).toContain("Date must be a string");
      expect(errors).toContain("Required skills must be an array");
      expect(errors).toContain("Volunteers needed must be a number");
    });

    test("validates field lengths", () => {
      const event = {
        name: "ab",
        location: "a",
        date: "2025-03-15",
        requiredSkills: [],
        volunteersNeeded: 5,
        urgency: "High",
      };
      const errors = validateEvent(event);
      expect(errors).toContain(
        "Event name must be between 3 and 100 characters"
      );
      expect(errors).toContain("Location must be between 2 and 100 characters");
    });

    test("validates date format", () => {
      const event = {
        name: "Test Event",
        location: "Test Location",
        date: "invalid-date",
        requiredSkills: [],
        volunteersNeeded: 5,
        urgency: "High",
      };
      const errors = validateEvent(event);
      expect(errors).toContain("Invalid date format (should be YYYY-MM-DD)");
    });

    test("validates urgency enum", () => {
      const event = {
        name: "Test Event",
        location: "Test Location",
        date: "2025-03-15",
        requiredSkills: [],
        volunteersNeeded: 5,
        urgency: "Invalid",
      };
      const errors = validateEvent(event);
      expect(errors).toContain("Urgency must be Low, Medium, or High");
    });

    test("validates volunteers needed range", () => {
      const event = {
        name: "Test Event",
        location: "Test Location",
        date: "2025-03-15",
        requiredSkills: [],
        volunteersNeeded: 0,
        urgency: "High",
      };
      const errors = validateEvent(event);
      expect(errors).toContain("Volunteers needed must be between 1 and 100");
    });
  });

  describe("Match Creation", () => {
    test("creates a valid match", () => {
      const match = createMatch(1, 1);
      expect(match).toHaveProperty("id");
      expect(match).toHaveProperty("volunteerId", 1);
      expect(match).toHaveProperty("eventId", 1);
      expect(match).toHaveProperty("volunteer", "John Doe");
      expect(match).toHaveProperty("event", "Beach Cleanup");
      expect(match).toHaveProperty("createdAt");
    });

    test("throws error for non-existent volunteer or event", () => {
      expect(() => createMatch(999, 1)).toThrow("Volunteer or event not found");
      expect(() => createMatch(1, 999)).toThrow("Volunteer or event not found");
    });
  });

  describe("Match Score Calculation", () => {
    test("calculates perfect match score", () => {
      const volunteer = {
        name: "Test User",
        email: "test@example.com",
        skills: ["First Aid", "Teaching"],
        availability: ["Weekdays"],
        location: "Galveston",
      };
      const event = {
        name: "Test Event",
        location: "Galveston Beach",
        date: "2025-03-15",
        requiredSkills: ["First Aid"],
        volunteersNeeded: 5,
        urgency: "High",
      };
      const score = calculateMatchScore(volunteer, event);
      expect(score).toBe(80); // 50 for all required skills + 10 for matching skill + 20 for location
    });

    test("calculates partial match score", () => {
      const volunteer = {
        name: "Test User",
        email: "test@example.com",
        skills: ["Teaching"],
        availability: ["Weekdays"],
        location: "Houston",
      };
      const event = {
        name: "Test Event",
        location: "Galveston Beach",
        date: "2025-03-15",
        requiredSkills: ["First Aid"],
        volunteersNeeded: 5,
        urgency: "High",
      };
      const score = calculateMatchScore(volunteer, event);
      expect(score).toBe(0); // No matching skills or location
    });

    test("throws error for invalid volunteer or event", () => {
      const volunteer = {
        name: "Test User",
        email: "invalid-email",
        skills: ["Teaching"],
        availability: ["Weekdays"],
        location: "Houston",
      };
      const event = {
        name: "Test Event",
        location: "Galveston Beach",
        date: "invalid-date",
        requiredSkills: ["First Aid"],
        volunteersNeeded: 5,
        urgency: "High",
      };
      expect(() => calculateMatchScore(volunteer, event)).toThrow();
    });
  });

  describe("Data Access Functions", () => {
    test("gets all volunteers", () => {
      const allVolunteers = getAllVolunteers();
      expect(Array.isArray(allVolunteers)).toBe(true);
      expect(allVolunteers).toHaveLength(3);
    });

    test("gets volunteer by id", () => {
      const volunteer = getVolunteerById(1);
      expect(volunteer).toHaveProperty("name", "John Doe");
    });

    test("gets all events", () => {
      const allEvents = getAllEvents();
      expect(Array.isArray(allEvents)).toBe(true);
      expect(allEvents).toHaveLength(3);
    });

    test("gets event by id", () => {
      const event = getEventById(1);
      expect(event).toHaveProperty("name", "Beach Cleanup");
    });

    test("gets all matches", () => {
      const allMatches = getAllMatches();
      expect(Array.isArray(allMatches)).toBe(true);
    });
  });
});

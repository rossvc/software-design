const {
  validateEvent,
  addEvent,
  updateEvent,
  deleteEvent,
  getEventById,
} = require("../createEventModel");

describe("Event Model", () => {
  const validEvent = {
    eventName: "Community Workshop",
    description: "Educational workshop for the community",
    location: "Community Center",
    urgency: "Medium",
    skills: ["Teaching", "Organization"],
    startTime: "14:00",
    endTime: "16:00",
    date: "2025-04-15",
  };

  describe("Event Validation", () => {
    test("validates required fields", () => {
      const invalidEvent = { ...validEvent };
      delete invalidEvent.eventName;
      expect(() => validateEvent(invalidEvent)).toThrow(
        "eventName is required"
      );
    });

    test("validates field types", () => {
      const invalidEvent = {
        ...validEvent,
        eventName: 123,
      };
      expect(() => validateEvent(invalidEvent)).toThrow(
        "Event name must be a string"
      );
    });

    test("validates field lengths", () => {
      const invalidEvent = {
        ...validEvent,
        eventName: "Ab",
        description: "Short",
      };
      expect(() => validateEvent(invalidEvent)).toThrow(
        "Event name must be at least 3 characters"
      );

      const invalidDesc = { ...validEvent, description: "Too short" };
      expect(() => validateEvent(invalidDesc)).toThrow(
        "Description must be at least 10 characters"
      );
    });

    test("validates urgency enum", () => {
      const invalidEvent = { ...validEvent, urgency: "Invalid" };
      expect(() => validateEvent(invalidEvent)).toThrow(
        "Urgency must be High, Medium, or Low"
      );
    });

    test("validates time format", () => {
      const invalidStartTime = { ...validEvent, startTime: "25:00" };
      expect(() => validateEvent(invalidStartTime)).toThrow(
        "Start time must be in HH:MM format"
      );

      const invalidEndTime = { ...validEvent, endTime: "9:00" };
      expect(() => validateEvent(invalidEndTime)).toThrow(
        "End time must be in HH:MM format"
      );
    });

    test("validates date format", () => {
      const invalidDate = { ...validEvent, date: "2025/04/15" };
      expect(() => validateEvent(invalidDate)).toThrow(
        "Date must be in YYYY-MM-DD format"
      );
    });

    test("validates skills array", () => {
      const invalidSkills = { ...validEvent, skills: "Teaching" };
      expect(() => validateEvent(invalidSkills)).toThrow(
        "Skills must be an array"
      );
    });

    test("accepts valid event", () => {
      expect(() => validateEvent(validEvent)).not.toThrow();
    });
  });

  describe("Event Management", () => {
    test("adds new event", () => {
      const event = addEvent(validEvent);
      expect(event).toEqual({
        id: expect.any(Number),
        ...validEvent,
        createdAt: expect.any(String),
      });
    });

    test("updates existing event", () => {
      const event = addEvent(validEvent);
      const updatedFields = {
        eventName: "Updated Workshop",
        urgency: "High",
      };

      const updated = updateEvent(event.id, updatedFields);
      expect(updated).toEqual({
        ...event,
        ...updatedFields,
        updatedAt: expect.any(String),
      });
    });

    test("fails to update non-existent event", () => {
      const result = updateEvent(999, { eventName: "Test" });
      expect(result).toBeNull();
    });

    test("deletes event", () => {
      const event = addEvent(validEvent);
      const result = deleteEvent(event.id);
      expect(result).toBe(true);

      const deleted = getEventById(event.id);
      expect(deleted).toBeUndefined();
    });

    test("fails to delete non-existent event", () => {
      const result = deleteEvent(999);
      expect(result).toBe(false);
    });
  });
});

// Since we're not using a database yet, using hardcoded mock data arrays
const volunteers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@email.com",
    skills: ["Teaching", "First Aid", "CPR"],
    availability: ["Weekdays", "Evenings"],
    location: "Houston",
    matchScore: 95,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@email.com",
    skills: ["Childcare", "Elderly Care"],
    availability: ["Weekends"],
    location: "Galveston",
    matchScore: 88,
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob.johnson@email.com",
    skills: ["First Aid", "CPR", "Disability Support"],
    availability: ["Weekends", "Evenings"],
    location: "Houston",
    matchScore: 82,
  },
];

const events = [
  {
    id: 1,
    name: "Beach Cleanup",
    location: "Galveston Beach",
    date: "2025-02-20",
    requiredSkills: ["First Aid"],
    volunteersNeeded: 5,
    urgency: "High",
    volunteers: [],
  },
  {
    id: 2,
    name: "Senior Care Workshop",
    location: "Community Center",
    date: "2025-03-01",
    requiredSkills: ["Elderly Care", "First Aid"],
    volunteersNeeded: 3,
    urgency: "Medium",
    volunteers: [],
  },
  {
    id: 3,
    name: "Teaching Workshop",
    location: "Public Library",
    date: "2025-04-15",
    requiredSkills: ["Teaching"],
    volunteersNeeded: 2,
    urgency: "Low",
    volunteers: [],
  },
];

// Mock matches
const matches = [];

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

module.exports = {
  volunteers,
  events,
  matches,
  getAllVolunteers: () => volunteers,
  getVolunteerById: (id) => volunteers.find((v) => v.id === id),
  getAllEvents: () => events,
  getEventById: (id) => events.find((e) => e.id === id),
  getAllMatches: () => matches,
  createMatch: (volunteerId, eventId) => {
    const volunteer = volunteers.find((v) => v.id === volunteerId);
    const event = events.find((e) => e.id === eventId);

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

    const newMatch = {
      id: matches.length + 1,
      volunteerId,
      eventId,
      volunteer: volunteer.name,
      event: event.name,
      createdAt: new Date().toISOString(),
    };

    matches.push(newMatch);

    // Also add volunteer to event's volunteer list
    const eventIndex = events.findIndex((e) => e.id === eventId);
    if (eventIndex !== -1) {
      events[eventIndex].volunteers.push({
        id: volunteer.id,
        name: volunteer.name,
        status: "Pending",
      });
    }

    return newMatch;
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

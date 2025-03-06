const events = [
  {
    id: 1,
    eventName: "Beach Cleanup",
    description: "Community beach cleanup event",
    location: "Galveston Beach",
    urgency: "High",
    skills: ["First Aid"],
    startTime: "09:00",
    endTime: "12:00",
    date: "2025-02-20",
    createdAt: "2025-01-01T00:00:00.000Z"
  },
  {
    id: 2,
    eventName: "Library Volunteer",
    description: "Assist with organizing and shelving books",
    location: "Central Library",
    urgency: "Low",
    skills: [],
    startTime: "13:00",
    endTime: "16:00",
    date: "2025-03-05",
    createdAt: "2025-01-05T00:00:00.000Z"
  }
];

// Validate event data
const validateEvent = (event) => {
  // Required fields validation
  const requiredFields = ['eventName', 'description', 'location', 'urgency', 'startTime', 'endTime', 'date'];
  for (const field of requiredFields) {
    if (!event[field]) {
      throw new Error(`${field} is required`);
    }
  }

  // Field type validation
  if (typeof event.eventName !== 'string') throw new Error('Event name must be a string');
  if (typeof event.description !== 'string') throw new Error('Description must be a string');
  if (typeof event.location !== 'string') throw new Error('Location must be a string');
  if (typeof event.urgency !== 'string') throw new Error('Urgency must be a string');
  if (typeof event.startTime !== 'string') throw new Error('Start time must be a string');
  if (typeof event.endTime !== 'string') throw new Error('End time must be a string');
  if (typeof event.date !== 'string') throw new Error('Date must be a string');
  if (!Array.isArray(event.skills)) throw new Error('Skills must be an array');

  // Field length validation
  if (event.eventName.length < 3) throw new Error('Event name must be at least 3 characters');
  if (event.description.length < 10) throw new Error('Description must be at least 10 characters');
  if (event.location.length < 3) throw new Error('Location must be at least 3 characters');
  
  // Urgency enum validation
  const validUrgencies = ['High', 'Medium', 'Low'];
  if (!validUrgencies.includes(event.urgency)) {
    throw new Error('Urgency must be High, Medium, or Low');
  }

  // Time format validation
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(event.startTime)) throw new Error('Start time must be in HH:MM format');
  if (!timeRegex.test(event.endTime)) throw new Error('End time must be in HH:MM format');

  // Date format validation
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(event.date)) throw new Error('Date must be in YYYY-MM-DD format');
};

module.exports = {
  getAllEvents: () => events,

  getEventById: (id) => events.find((e) => e.id === id),
  
  addEvent: (event) => {
    validateEvent(event);
    const newEvent = {
      id: events.length + 1,
      ...event,
      createdAt: new Date().toISOString()
    };
    events.push(newEvent);
    return newEvent;
  },

  updateEvent: (id, updatedFields) => {
    const index = events.findIndex((e) => e.id === id);
    if (index === -1) {
      return null;
    }
    const updatedEvent = {
      ...events[index],
      ...updatedFields
    };
    validateEvent(updatedEvent);
    events[index] = {
      ...updatedEvent,
      updatedAt: new Date().toISOString()
    };
    return events[index];
  },

  deleteEvent: (id) => {
    const index = events.findIndex((e) => e.id === id);
    if (index === -1) {
      return false;
    }
    events.splice(index, 1);
    return true;
  },

  validateEvent // Export for testing
};

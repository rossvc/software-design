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

module.exports = {
  getAllEvents: () => events,


  getEventById: (id) => events.find((e) => e.id === id),

  
  addEvent: (event) => {
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
    events[index] = {
      ...events[index],
      ...updatedFields,
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
};

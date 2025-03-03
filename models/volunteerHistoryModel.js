// Mock volunteer history data
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
    const newHistory = {
      id: volunteerHistory.length + 1,
      ...history,
      createdAt: new Date().toISOString(),
    };
    volunteerHistory.push(newHistory);
    return newHistory;
  },
  updateHistoryStatus: (id, status) => {
    const historyIndex = volunteerHistory.findIndex((h) => h.id === id);
    if (historyIndex === -1) {
      return null;
    }

    volunteerHistory[historyIndex].status = status;
    return volunteerHistory[historyIndex];
  },
  updateHoursServed: (id, hours) => {
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
};

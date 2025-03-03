// Since we're not using a database yet, using hardcoded mock data arrays
const volunteers = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@email.com",
      skills: ["Teaching", "First Aid", "CPR"],
      availability: ["Weekdays", "Evenings"],
      location: "Houston",
      matchScore: 95
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@email.com",
      skills: ["Childcare", "Elderly Care"],
      availability: ["Weekends"],
      location: "Galveston",
      matchScore: 88
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob.johnson@email.com",
      skills: ["First Aid", "CPR", "Disability Support"],
      availability: ["Weekends", "Evenings"],
      location: "Houston",
      matchScore: 82
    }
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
      volunteers: []
    },
    {
      id: 2,
      name: "Senior Care Workshop",
      location: "Community Center",
      date: "2025-03-01",
      requiredSkills: ["Elderly Care", "First Aid"],
      volunteersNeeded: 3,
      urgency: "Medium",
      volunteers: []
    },
    {
      id: 3,
      name: "Teaching Workshop",
      location: "Public Library",
      date: "2025-04-15",
      requiredSkills: ["Teaching"],
      volunteersNeeded: 2,
      urgency: "Low",
      volunteers: []
    }
  ];
  
  // Mock matches
  const matches = [];
  
  module.exports = {
    volunteers,
    events,
    matches,
    getAllVolunteers: () => volunteers,
    getVolunteerById: (id) => volunteers.find(v => v.id === id),
    getAllEvents: () => events,
    getEventById: (id) => events.find(e => e.id === id),
    getAllMatches: () => matches,
    createMatch: (volunteerId, eventId) => {
      const volunteer = volunteers.find(v => v.id === volunteerId);
      const event = events.find(e => e.id === eventId);
      
      if (!volunteer || !event) {
        return null;
      }
      
      const newMatch = {
        id: matches.length + 1,
        volunteerId,
        eventId,
        volunteer: volunteer.name,
        event: event.name,
        createdAt: new Date().toISOString()
      };
      
      matches.push(newMatch);
      
      // Also add volunteer to event's volunteer list
      const eventIndex = events.findIndex(e => e.id === eventId);
      if (eventIndex !== -1) {
        events[eventIndex].volunteers.push({
          id: volunteer.id,
          name: volunteer.name,
          status: "Pending"
        });
      }
      
      return newMatch;
    },
    calculateMatchScore: (volunteer, event) => {
      let score = 0;
      
      // Check if volunteer has required skills
      const hasRequiredSkills = event.requiredSkills.every(skill => 
        volunteer.skills.includes(skill)
      );
      
      if (hasRequiredSkills) {
        score += 50;
      }
      
      // Add points for each matching skill
      event.requiredSkills.forEach(skill => {
        if (volunteer.skills.includes(skill)) {
          score += 10;
        }
      });
      
      // Check location proximity (simplified)
      if (volunteer.location === event.location.split(' ')[0]) {
        score += 20;
      }
      
      return Math.min(score, 100);
    }
  };
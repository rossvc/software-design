document.addEventListener("DOMContentLoaded", function () {
  let selectedVolunteer = null;
  let selectedEvent = null;
  let volunteers = [];
  let events = [];

  // Check if user is logged in
  const userJson = sessionStorage.getItem('user');
  if (!userJson) {
    // Redirect to login if not logged in
    alert('Please log in to access volunteer matching');
    window.location.href = 'Signin.html';
    return;
  }

  // Function to toggle dropdown menu
  window.toggleDropdown = function() {
    const dropdownMenu = document.getElementById("dropdownMenu");
    if (dropdownMenu) {
      dropdownMenu.classList.toggle("show");
    }
  };

  // Close dropdown when clicking outside
  window.onclick = function(event) {
    if (!event.target.matches('.menu-icon, .menu-icon *')) {
      const dropdownMenu = document.getElementById("dropdownMenu");
      if (dropdownMenu && dropdownMenu.classList.contains("show")) {
        dropdownMenu.classList.remove("show");
      }
    }
  };

  // Function to select a volunteer
  window.selectVolunteer = function(card, volunteerId) {
    document
      .querySelectorAll(".volunteer-card")
      .forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
    selectedVolunteer = volunteers.find(v => v.id === volunteerId);
    updateMatchButton();
    
    // If an event is already selected, get recommendations for this volunteer
    if (selectedEvent) {
      getRecommendationsForVolunteer(volunteerId);
    }
  };

  // Function to select an event
  window.selectEvent = function(card, eventId) {
    document
      .querySelectorAll(".event-card")
      .forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
    selectedEvent = events.find(e => e.id === eventId);
    updateMatchButton();
    
    // If a volunteer is already selected, get recommendations for this event
    if (selectedVolunteer) {
      getRecommendationsForEvent(eventId);
    }
  };

  // Function to update match button state
  function updateMatchButton() {
    const matchButton = document.getElementById("match-button");
    matchButton.disabled = !(selectedVolunteer && selectedEvent);
  }

  // Function to get recommendations for a volunteer
  function getRecommendationsForVolunteer(volunteerId) {
    fetch(`/api/matching/recommendations?volunteerId=${volunteerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || 'Failed to get recommendations');
        });
      }
      return response.json();
    })
    .then(recommendedEvents => {
      // Update event cards with match scores
      updateEventCards(recommendedEvents);
    })
    .catch(error => {
      console.error('Error getting recommendations:', error);
    });
  }

  // Function to get recommendations for an event
  function getRecommendationsForEvent(eventId) {
    fetch(`/api/matching/recommendations?eventId=${eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || 'Failed to get recommendations');
        });
      }
      return response.json();
    })
    .then(recommendedVolunteers => {
      // Update volunteer cards with match scores
      updateVolunteerCards(recommendedVolunteers);
    })
    .catch(error => {
      console.error('Error getting recommendations:', error);
    });
  }

  // Function to update event cards with match scores
  function updateEventCards(recommendedEvents) {
    const eventContainer = document.querySelector('.event-section .scroll-container');
    eventContainer.innerHTML = '';
    
    recommendedEvents.forEach(event => {
      const matchScoreText = event.matchScore ? `${event.matchScore}% Match` : getUrgencyText(event.urgency);
      const matchScoreClass = event.matchScore ? 'match-score' : `match-score ${event.urgency.toLowerCase()}-priority`;
      
      const cardHtml = `
        <div class="event-card" onclick="selectEvent(this, ${event.id})">
          <h3>
            ${event.name} <span class="${matchScoreClass}">${matchScoreText}</span>
          </h3>
          <p>Location: ${event.location}</p>
          <p>Date: ${event.date}</p>
          <div class="skills-list">
            ${event.requiredSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
          <p>Volunteers Needed: ${event.volunteersNeeded}</p>
        </div>
      `;
      
      eventContainer.innerHTML += cardHtml;
    });
  }

  // Function to update volunteer cards with match scores
  function updateVolunteerCards(recommendedVolunteers) {
    const volunteerContainer = document.querySelector('.volunteer-section .scroll-container');
    volunteerContainer.innerHTML = '';
    
    recommendedVolunteers.forEach(volunteer => {
      const cardHtml = `
        <div class="volunteer-card" onclick="selectVolunteer(this, ${volunteer.id})">
          <h3>${volunteer.name} <span class="match-score">${volunteer.matchScore}% Match</span></h3>
          <p>${volunteer.email}</p>
          <div class="skills-list">
            ${volunteer.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
          <p class="availability">Available: ${volunteer.availability.join(', ')}</p>
        </div>
      `;
      
      volunteerContainer.innerHTML += cardHtml;
    });
  }

  // Helper function to get urgency text
  function getUrgencyText(urgency) {
    return `${urgency} Priority`;
  }

  // Set up search functionality
  document.querySelectorAll(".search-box").forEach((searchBox) => {
    searchBox.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      const isVolunteerSearch = this.closest(".volunteer-section");
      const cards = isVolunteerSearch
        ? document.querySelectorAll(".volunteer-card")
        : document.querySelectorAll(".event-card");

      cards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? "" : "none";
      });
    });
  });

  // Set up filter functionality
  document.getElementById("skill-filter").addEventListener("change", function() {
    const skill = this.value.toLowerCase();
    filterVolunteers('skill', skill);
  });

  document.getElementById("availability-filter").addEventListener("change", function() {
    const availability = this.value.toLowerCase();
    filterVolunteers('availability', availability);
  });

  document.getElementById("urgency-filter").addEventListener("change", function() {
    const urgency = this.value.toLowerCase();
    filterEvents('urgency', urgency);
  });

  document.getElementById("date-filter").addEventListener("change", function() {
    const dateFilter = this.value.toLowerCase();
    filterEvents('date', dateFilter);
  });

  // Function to filter volunteers
  function filterVolunteers(filterType, filterValue) {
    if (!filterValue) {
      // If no filter value, fetch all volunteers again
      fetchVolunteers();
      return;
    }
    
    let filteredVolunteers = [...volunteers];
    
    if (filterType === 'skill') {
      filteredVolunteers = filteredVolunteers.filter(volunteer => 
        volunteer.skills.some(skill => skill.toLowerCase().includes(filterValue))
      );
    } else if (filterType === 'availability') {
      filteredVolunteers = filteredVolunteers.filter(volunteer => 
        volunteer.availability.some(avail => avail.toLowerCase().includes(filterValue))
      );
    }
    
    updateVolunteerCards(filteredVolunteers);
  }

  // Function to filter events
  function filterEvents(filterType, filterValue) {
    if (!filterValue) {
      // If no filter value, fetch all events again
      fetchEvents();
      return;
    }
    
    let filteredEvents = [...events];
    
    if (filterType === 'urgency') {
      filteredEvents = filteredEvents.filter(event => 
        event.urgency.toLowerCase() === filterValue
      );
    } else if (filterType === 'date') {
      // This would need more complex date filtering logic
      // For now, just a simple filter based on the date string
      const today = new Date();
      const oneWeek = new Date(today);
      oneWeek.setDate(today.getDate() + 7);
      const oneMonth = new Date(today);
      oneMonth.setDate(today.getDate() + 30);
      
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.date);
        if (filterValue === 'this-week') {
          return eventDate >= today && eventDate <= oneWeek;
        } else if (filterValue === 'next-week') {
          return eventDate > oneWeek && eventDate <= new Date(oneWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
        } else if (filterValue === 'this-month') {
          return eventDate >= today && eventDate <= oneMonth;
        }
        return true;
      });
    }
    
    updateEventCards(filteredEvents);
  }

  // Set up match button functionality
  document.getElementById("match-button").addEventListener("click", function () {
    if (selectedVolunteer && selectedEvent) {
      // Show loading state
      this.textContent = "Creating Match...";
      this.disabled = true;
      
      // Call the API to create a match
      fetch('/api/matching/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          volunteerId: selectedVolunteer.id,
          eventId: selectedEvent.id
        }),
        credentials: 'include'
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.message || 'Failed to create match');
          });
        }
        return response.json();
      })
      .then(data => {
        alert(`Successfully matched ${selectedVolunteer.name} with ${selectedEvent.name}!`);
        
        // Reset selection
        document.querySelectorAll(".volunteer-card").forEach((c) => c.classList.remove("selected"));
        document.querySelectorAll(".event-card").forEach((c) => c.classList.remove("selected"));
        selectedVolunteer = null;
        selectedEvent = null;
        updateMatchButton();
        
        // Refresh data
        fetchVolunteers();
        fetchEvents();
      })
      .catch(error => {
        alert(error.message || "Failed to create match. Please try again.");
      })
      .finally(() => {
        // Reset button state
        this.textContent = "Create Match";
        this.disabled = !(selectedVolunteer && selectedEvent);
      });
    }
  });

  // Function to fetch volunteers
  function fetchVolunteers() {
    fetch('/api/matching/volunteers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || 'Failed to fetch volunteers');
        });
      }
      return response.json();
    })
    .then(data => {
      volunteers = data;
      updateVolunteerCards(data);
    })
    .catch(error => {
      console.error('Error fetching volunteers:', error);
      const volunteerContainer = document.querySelector('.volunteer-section .scroll-container');
      volunteerContainer.innerHTML = `<p class="error">Error loading volunteers: ${error.message}</p>`;
    });
  }

  // Function to fetch events
  function fetchEvents() {
    fetch('/api/matching/events', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || 'Failed to fetch events');
        });
      }
      return response.json();
    })
    .then(data => {
      events = data;
      updateEventCards(data);
    })
    .catch(error => {
      console.error('Error fetching events:', error);
      const eventContainer = document.querySelector('.event-section .scroll-container');
      eventContainer.innerHTML = `<p class="error">Error loading events: ${error.message}</p>`;
    });
  }

  // Initialize by fetching volunteers and events
  fetchVolunteers();
  fetchEvents();
});

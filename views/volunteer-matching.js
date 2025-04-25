document.addEventListener("DOMContentLoaded", function () {
  let selectedVolunteers = new Set();
  let eventId = null;
  let eventDetails = null;
  let volunteers = [];

  // Check if user is logged in
  const userJson = sessionStorage.getItem("user");
  if (!userJson) {
    alert("Please log in to access volunteer matching");
    window.location.href = "Signin.html";
    return;
  }

  // Function to toggle dropdown menu
  window.toggleDropdown = function () {
    const dropdownMenu = document.getElementById("dropdownMenu");
    if (dropdownMenu) {
      dropdownMenu.classList.toggle("show");
    }
  };

  // Close dropdown when clicking outside
  window.onclick = function (event) {
    if (!event.target.matches(".menu-icon, .menu-icon *")) {
      const dropdownMenu = document.getElementById("dropdownMenu");
      if (dropdownMenu && dropdownMenu.classList.contains("show")) {
        dropdownMenu.classList.remove("show");
      }
    }
  };

  // Get the event ID from URL parameters
  function getEventIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventIdParam = urlParams.get("eventId");

    if (!eventIdParam) {
      alert("No event ID provided in URL. Redirecting to events page.");
      window.location.href = "events.html";
      return null;
    }

    return parseInt(eventIdParam);
  }

  // Function to toggle volunteer selection
  window.toggleVolunteerSelection = function (checkbox, volunteerId) {
    const card = checkbox.closest(".volunteer-card");

    if (checkbox.checked) {
      selectedVolunteers.add(volunteerId);
      card.classList.add("selected");
    } else {
      selectedVolunteers.delete(volunteerId);
      card.classList.remove("selected");
    }

    updateSelectionCount();
    updateMatchButton();
  };

  // Function to update selection count display
  function updateSelectionCount() {
    const countElement = document.getElementById("selection-count");
    if (countElement) {
      countElement.textContent = `${selectedVolunteers.size} Selected`;
    }
  }

  // Function to update match button state
  function updateMatchButton() {
    const matchButton = document.getElementById("match-button");
    if (matchButton) {
      matchButton.disabled = selectedVolunteers.size === 0;
    }
  }

  // Function to get event details
  function getEventDetails(eventId) {
    fetch(`/api/matching/events/${eventId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.message || "Failed to get event details");
          });
        }
        return response.json();
      })
      .then((event) => {
        eventDetails = event;
        renderEventDetails(event);
        getRegisteredVolunteers(eventId);
      })
      .catch((error) => {
        console.error("Error getting event details:", error);
        document.getElementById(
          "event-info"
        ).innerHTML = `<p class="event-info-item">Error loading event: ${error.message}</p>`;
      });
  }

  // Function to get registered volunteers for an event with "Waiting" status
  function getRegisteredVolunteers(eventId) {
    fetch(`/api/matching/recommendations?eventId=${eventId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(
              data.message || "Failed to get registered volunteers"
            );
          });
        }
        return response.json();
      })
      .then((registeredVolunteers) => {
        volunteers = registeredVolunteers;
        renderVolunteerCards(registeredVolunteers);
      })
      .catch((error) => {
        console.error("Error getting registered volunteers:", error);
        document.getElementById(
          "volunteers-container"
        ).innerHTML = `<p>Error loading registered volunteers: ${error.message}</p>`;
      });
  }

  // Function to render event details
  function renderEventDetails(event) {
    const eventInfoElement = document.getElementById("event-info");
    const eventUrgencyElement = document.getElementById("event-urgency");

    if (eventInfoElement && eventUrgencyElement) {
      const requiredSkills = Array.isArray(event.requiredSkills)
        ? event.requiredSkills
        : JSON.parse(event.requiredSkills || "[]");

      eventUrgencyElement.textContent = getUrgencyText(event.urgency);
      eventUrgencyElement.className = `match-score ${event.urgency.toLowerCase()}-priority`;

      eventInfoElement.innerHTML = `
        <h3 class="event-info-item">${event.name}</h3>
        <p class="event-info-item"><strong>Location:</strong> ${
          event.location
        }</p>
        <p class="event-info-item"><strong>Date:</strong> ${event.date}</p>
        <p class="event-info-item"><strong>Volunteers Needed:</strong> ${
          event.volunteersNeeded || "Flexible"
        }</p>
        <div class="event-info-item">
          <strong>Required Skills:</strong>
          <div class="skills-list">
            ${requiredSkills
              .map((skill) => `<span class="skill-tag">${skill}</span>`)
              .join("")}
          </div>
        </div>
        <p class="event-info-item"><strong>Description:</strong> ${
          event.description || "No description provided"
        }</p>
      `;
    }
  }

  // Helper function to get urgency text
  function getUrgencyText(urgency) {
    return `${urgency} Priority`;
  }

  // Set up search functionality
  const volunteerSearch = document.getElementById("volunteer-search");
  if (volunteerSearch) {
    volunteerSearch.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      const volunteerCards = document.querySelectorAll(".volunteer-card");

      volunteerCards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? "" : "none";
      });
    });
  }

  // Function to render volunteer cards
  function renderVolunteerCards(volunteers) {
    const volunteerContainer = document.getElementById("volunteers-container");
    if (!volunteerContainer) return;

    volunteerContainer.innerHTML = "";

    if (volunteers.length === 0) {
      volunteerContainer.innerHTML =
        "<p>No registered volunteers found with Waiting status.</p>";
      return;
    }

    // Sort volunteers by match score (highest first)
    volunteers.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    volunteers.forEach((volunteer) => {
      const skills = Array.isArray(volunteer.skills)
        ? volunteer.skills
        : JSON.parse(volunteer.skills || "[]");

      const cardHtml = `
        <div class="volunteer-card" data-id="${volunteer.id}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div class="checkbox-container">
              <input 
                type="checkbox" 
                id="volunteer-${volunteer.id}" 
                ${selectedVolunteers.has(volunteer.id) ? "checked" : ""}
                onchange="toggleVolunteerSelection(this, ${volunteer.id})"
              />
            </div>
            <div style="flex-grow: 1;">
              <h3>${volunteer.name} <span class="match-score">${
        volunteer.matchScore || 0
      }% Match</span></h3>
              <p>${volunteer.email}</p>
              <div class="skills-list">
                ${skills
                  .map((skill) => `<span class="skill-tag">${skill}</span>`)
                  .join("")}
              </div>
              <p class="availability">Available: ${
                Array.isArray(volunteer.availability)
                  ? volunteer.availability.join(", ")
                  : "Flexible"
              }</p>
            </div>
          </div>
        </div>
      `;

      volunteerContainer.innerHTML += cardHtml;
    });
  }

  // Set up match button functionality
  const matchButton = document.getElementById("match-button");
  if (matchButton) {
    matchButton.addEventListener("click", function () {
      if (selectedVolunteers.size > 0 && eventId) {
        // Show loading state
        this.textContent = "Creating Matches...";
        this.disabled = true;

        const volunteerIds = Array.from(selectedVolunteers);

        // Call the API to create matches
        fetch("/api/matching/batch-matches", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            volunteerIds: volunteerIds,
            eventId: eventId,
          }),
          credentials: "include",
        })
          .then((response) => {
            if (!response.ok) {
              return response.json().then((data) => {
                throw new Error(data.message || "Failed to create matches");
              });
            }
            return response.json();
          })
          .then((data) => {
            const count = volunteerIds.length;
            alert(
              `Successfully matched ${count} volunteer${
                count !== 1 ? "s" : ""
              } with the event!`
            );

            // Reset selection
            selectedVolunteers.clear();
            document.querySelectorAll(".volunteer-card").forEach((card) => {
              card.classList.remove("selected");
              const checkbox = card.querySelector("input[type='checkbox']");
              if (checkbox) checkbox.checked = false;
            });

            updateSelectionCount();
            updateMatchButton();

            // After batch match creation, update status from 'Waiting' to 'Pending'
            Promise.all(
              volunteerIds.map(volunteerId => {
                // Find the matchId for this volunteer/event (fetch latest matches)
                return fetch(`/api/matching/matches?eventId=${eventId}`, {
                  credentials: "include"
                })
                  .then(res => res.json())
                  .then(matches => {
                    // Find the match for this volunteer with status 'Waiting'
                    const match = matches.find(m => m.volunteerId === volunteerId && m.status === "Waiting");
                    if (match) {
                      // Update the match status to 'Pending'
                      return fetch(`/api/matching/matches/${match.id}/status`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ status: "Pending" })
                      });
                    }
                  });
              })
            ).then(() => {
              // Refresh volunteer data after all status updates
              getRegisteredVolunteers(eventId);
            });
          })
          .catch((error) => {
            alert(
              error.message || "Failed to create matches. Please try again."
            );
          })
          .finally(() => {
            // Reset button state
            this.textContent = "Approve Selected Volunteers";
            this.disabled = selectedVolunteers.size === 0;
          });
      }
    });
  }

  // Initialize the page
  function init() {
    // Get event ID from URL
    eventId = getEventIdFromUrl();
    if (eventId) {
      // Get event details and registered volunteers with "Waiting" status
      getEventDetails(eventId);
    } else {
      alert("No event ID provided. Please select an event first.");
      window.location.href = "AdminEventsDashboard.html";
    }
  }

  // Start the page initialization
  init();
});

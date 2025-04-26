document.addEventListener("DOMContentLoaded", function () {
  // Check if user is logged in
  const userJson = sessionStorage.getItem("user");
  if (!userJson) {
    alert("Please log in to view events");
    window.location.href = "Signin.html";
    return;
  }

  const user = JSON.parse(userJson);

  // Inject navbar with dropdown
  const navbarContainer = document.getElementById("navbar-container");
  navbarContainer.innerHTML = `
    <nav style="display: flex; justify-content: space-between; align-items: center; background-color: #0951bd; padding: 10px 20px; color: white;">
      <h2 style="margin: 0;">Volunteer Center</h2>
      <div style="position: relative;">
        <i class='bx bx-menu menu-icon' onclick="toggleDropdown()" style="font-size: 24px; cursor: pointer;"></i>
        <div id="dropdownMenu" class="dropdown">
          <div class="dropdown-content">
            <a href="Homepage.html">Home</a>
            <a href="UserProfile.html">Your Profile</a>
            <a href="VolunteerEvents.html">Volunteer Events</a>
            <a href="volunteer-history.html">Volunteer History</a>
            <a href="notifications.html">Notifications</a>
            <a href="Signin.html">Log Out</a>
          </div>
        </div>
      </div>
    </nav>
  `;

  // Function to toggle dropdown menu
  window.toggleDropdown = function () {
    const dropdownMenu = document.getElementById("dropdownMenu");
    if (dropdownMenu) {
      dropdownMenu.style.display =
        dropdownMenu.style.display === "block" ? "none" : "block";
    }
  };

  // Close dropdown when clicking outside
  window.onclick = function (event) {
    if (!event.target.matches(".menu-icon, .menu-icon *")) {
      const dropdownMenu = document.getElementById("dropdownMenu");
      if (dropdownMenu && dropdownMenu.style.display === "block") {
        dropdownMenu.style.display = "none";
      }
    }
  };

  // Modal functions
  window.showModal = function (id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.style.display = "block";
    }
  };

  window.closeModal = function (id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.style.display = "none";
    }
  };

  window.register = function (modalId, eventId) {
    const cardButton = document.querySelector(
      `.card button[onclick*="${modalId}"]`
    );
    const originalButtonText = cardButton.textContent;
    cardButton.textContent = "Registering...";
    cardButton.disabled = true;

    fetch("/api/matching/matches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        volunteerId: user.id || 1,
        eventId: eventId,
      }),
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.message || "Failed to register for event");
          });
        }
        return response.json();
      })
      .then(() => {
        const message = document.getElementById(`message-${modalId}`);
        if (message) {
          message.style.display = "block";
        }

        cardButton.textContent = "Registered";
        cardButton.disabled = true;
        cardButton.classList.add("registered");
      })
      .catch((error) => {
        alert(
          error.message || "Failed to register for event. Please try again."
        );
      })
      .finally(() => {
        if (!cardButton.classList.contains("registered")) {
          cardButton.textContent = originalButtonText;
          cardButton.disabled = false;
        }
      });
  };

  // Fetch events from API
  fetch("/api/createevents", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          throw new Error(data.message || "Failed to fetch events");
        });
      }
      return response.json();
    })
    .then((events) => {
      const container = document.querySelector(".container");
      container.innerHTML = "";

      events.forEach((event, index) => {
        const modalId = `modal${index + 1}`;
        
        // Parse required skills if it's a JSON string
        let skills = [];
        if (event.required_skills) {
          try {
            skills = JSON.parse(event.required_skills);
          } catch (e) {
            // If it's not valid JSON, treat it as comma-separated string
            skills = event.required_skills.split(',');
          }
        }
        
        // Format the event date
        const eventDate = new Date(event.event_date);
        const formattedDate = eventDate.toLocaleDateString();
        
        const cardHtml = `
        <div class="card">
          <h3>${event.name}</h3>
          <img src=${event.image_url} alt="${event.name}" />
          <p>${event.description || "No description available"}</p>
          <div class="event-details">
            <p>
              Location: ${event.location}<br />
              Urgency: ${event.urgency} <br />
              Skills required: ${skills.length > 0 ? skills.join(", ") : "None"} <br />
              Date: ${formattedDate} <br />
            </p>
          </div>
          <button onclick="register('${modalId}', ${event.id})">Register</button>
          <div id="message-${modalId}" class="registered-message">
            Congratulations! Registered
          </div>
        </div>
        `;
        container.innerHTML += cardHtml;
      });

      if (events.length === 0) {
        container.innerHTML =
          '<p class="no-events">No events available at this time.</p>';
      }
    })
    .catch((error) => {
      console.error("Error fetching events:", error);
      const container = document.querySelector(".container");
      container.innerHTML = `<p class="error">Error loading events: ${error.message}</p>`;
    });
});

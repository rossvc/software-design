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
    const registerButton = document.querySelector(
      `#${modalId} button:last-of-type`
    );
    const originalButtonText = registerButton.textContent;
    registerButton.textContent = "Registering...";
    registerButton.disabled = true;

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

        const cardButton = document
          .querySelector(`#${modalId}`)
          .parentNode.querySelector("button");
        if (cardButton) {
          cardButton.textContent = "Registered";
          cardButton.disabled = true;
          cardButton.classList.add("registered");
        }
      })
      .catch((error) => {
        alert(
          error.message || "Failed to register for event. Please try again."
        );
      })
      .finally(() => {
        registerButton.textContent = originalButtonText;
        registerButton.disabled = false;
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
        const cardHtml = `
        <div class="card">
          <h3>${event.eventName}</h3>
          <img src=${event.image} alt="${event.eventName}" />
          <p>${event.description || "No description available"}</p>
          <button onclick="showModal('${modalId}')">Register</button>
          <div id="${modalId}" class="modal">
            <h3>${event.eventName}</h3>
            <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2070&auto=format&fit=crop" alt="${
              event.eventName
            }" />
            <p>${event.description || "No description available"}</p>
            <button onclick="showModal('${modalId}')">Register</button>
            <div id="${modalId}" class="modal">
              <h3>${event.eventName}</h3>
              <p>
                Location: ${event.location}<br />
                Urgency: ${event.urgency} <br />
                Skills required: ${
                  event.skills ? event.skills.join(", ") : "None"
                } <br />
                Date: ${event.date} <br />
                Time: ${event.startTime} - ${event.endTime}
              </p>
              <button onclick="closeModal('${modalId}')">Close</button>
              <button onclick="register('${modalId}', ${
          event.id
        })">Register</button>
              <div id="message-${modalId}" class="registered-message">
                Congratulations! Registered
              </div>
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

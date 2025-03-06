document.addEventListener("DOMContentLoaded", function () {
  // Check if user is logged in
  const userJson = sessionStorage.getItem('user');
  if (!userJson) {
    // Redirect to login if not logged in
    alert('Please log in to view events');
    window.location.href = 'Signin.html';
    return;
  }

  const user = JSON.parse(userJson);
  
  // Function to toggle dropdown menu
  window.toggleDropdown = function() {
    const dropdownMenu = document.getElementById("dropdownMenu");
    if (dropdownMenu) {
      dropdownMenu.style.display = 
        dropdownMenu.style.display === "block" ? "none" : "block";
    }
  };

  // Close dropdown when clicking outside
  window.onclick = function(event) {
    if (!event.target.matches('.menu-icon, .menu-icon *')) {
      const dropdownMenu = document.getElementById("dropdownMenu");
      if (dropdownMenu && dropdownMenu.style.display === "block") {
        dropdownMenu.style.display = "none";
      }
    }
  };

  // Modal functions
  window.showModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.style.display = "block";
    }
  };

  window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.style.display = "none";
    }
  };

  window.register = function(modalId, eventId) {
    // Show loading state
    const registerButton = document.querySelector(`#${modalId} button:last-of-type`);
    const originalButtonText = registerButton.textContent;
    registerButton.textContent = "Registering...";
    registerButton.disabled = true;
    
    // Call the API to register for the event
    fetch('/api/matching/matches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        volunteerId: user.id || 1, // Fallback to 1 if no ID
        eventId: eventId
      }),
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || 'Failed to register for event');
        });
      }
      return response.json();
    })
    .then(data => {
      // Show success message
      const message = document.getElementById(`message-${modalId}`);
      if (message) {
        message.style.display = "block";
      }
      
      // Update UI to show registered status
      const cardButton = document.querySelector(`#${modalId}`).parentNode.querySelector('button');
      if (cardButton) {
        cardButton.textContent = "Registered";
        cardButton.disabled = true;
        cardButton.classList.add('registered');
      }
    })
    .catch(error => {
      alert(error.message || "Failed to register for event. Please try again.");
    })
    .finally(() => {
      // Reset button state
      registerButton.textContent = originalButtonText;
      registerButton.disabled = false;
    });
  };

  // Fetch events from the API
  fetch('/api/events', {
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
  .then(events => {
    // Clear existing event cards
    const container = document.querySelector('.container');
    container.innerHTML = '';
    
    // Create event cards dynamically
    events.forEach((event, index) => {
      const modalId = `modal${index + 1}`;
      
      // Create card HTML
      const cardHtml = `
        <div class="card">
          <h3>${event.name}</h3>
          <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2070&auto=format&fit=crop" alt="${event.name}" />
          <p>${event.description || 'No description available'}</p>
          <button onclick="showModal('${modalId}')">Register</button>
          <div id="${modalId}" class="modal">
            <h3>${event.name}</h3>
            <p>
              Location: ${event.location}<br />
              Urgency: ${event.urgency} <br />
              Skills required: ${event.requiredSkills.join(', ') || 'None'} <br />
              Date: ${event.date} <br />
              Time: ${event.time || 'TBD'}
            </p>
            <button onclick="closeModal('${modalId}')">Close</button>
            <button onclick="register('${modalId}', ${event.id})">Register</button>
            <div id="message-${modalId}" class="registered-message">
              Congratulations! Registered
            </div>
          </div>
        </div>
      `;
      
      // Add card to container
      container.innerHTML += cardHtml;
    });
    
    // If no events, show a message
    if (events.length === 0) {
      container.innerHTML = '<p class="no-events">No events available at this time.</p>';
    }
  })
  .catch(error => {
    console.error('Error fetching events:', error);
    const container = document.querySelector('.container');
    container.innerHTML = `<p class="error">Error loading events: ${error.message}</p>`;
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // Check if user is logged in
  const userJson = sessionStorage.getItem('user');
  if (!userJson) {
    // Redirect to login if not logged in
    alert('Please log in to view your profile');
    window.location.href = 'Signin.html';
    return;
  }

  const user = JSON.parse(userJson);
  
  // Fetch user profile data
  fetch(`/api/userinfo`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(data => {
        throw new Error(data.message || 'Failed to fetch profile data');
      });
    }
    return response.json();
  })
  .then(data => {
    // Update UI with user data
    document.getElementById("userName").innerText = data.name || 'Not provided';
    document.getElementById("userLastName").innerText = data.lastName || 'Not provided';
    document.getElementById("userAddress").innerText = data.address || 'Not provided';
    document.getElementById("userCity").innerText = data.city || 'Not provided';
    document.getElementById("userState").innerText = data.state || 'Not provided';
    document.getElementById("userZip").innerText = data.zipCode || 'Not provided';
    document.getElementById("userSkills").innerText = data.skills ? data.skills.join(', ') : 'None';
    document.getElementById("userRole").innerText = user.role || 'User';
    document.getElementById("userAvailability").innerText = 
      data.availability && data.availability.length > 0 ? data.availability.join(', ') : 'Not specified';
  })
  .catch(error => {
    console.error("Error fetching user profile:", error);
    // If there's an error, show a message and use placeholder data
    document.getElementById("userName").innerText = 'Error loading data';
    document.getElementById("userLastName").innerText = 'Error loading data';
    document.getElementById("userAddress").innerText = 'Error loading data';
    document.getElementById("userCity").innerText = 'Error loading data';
    document.getElementById("userState").innerText = 'Error loading data';
    document.getElementById("userZip").innerText = 'Error loading data';
    document.getElementById("userSkills").innerText = 'Error loading data';
    document.getElementById("userRole").innerText = user.role || 'User';
    document.getElementById("userAvailability").innerText = 'Error loading data';
  });

  // Fetch notifications
  fetch(`/api/notifications`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(data => {
        throw new Error(data.message || 'Failed to fetch notifications');
      });
    }
    return response.json();
  })
  .then(data => {
    // Filter unread notifications
    const unreadNotifications = data.filter(notification => !notification.read);
    
    // Update notifications UI
    updateNotifications(unreadNotifications);
  })
  .catch(error => {
    console.error("Error fetching notifications:", error);
    // Use mock notifications as fallback
    const mockNotifications = [
      {
        id: 1,
        type: "reminder",
        title: "Event Reminder",
        message: "Beach Cleanup starts in 3 days! Don't forget to bring gloves and water.",
        read: false
      }
    ];
    updateNotifications(mockNotifications);
  });

  function updateNotifications(notifications) {
    let unreadCount = notifications.length;
    const badge = document.getElementById("notificationBadge");
    const notificationSection = document.getElementById("notificationSection");
    
    // Update badge count
    if (unreadCount > 0) {
      badge.innerText = unreadCount;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
    
    // Clear notification section
    notificationSection.innerHTML = "";
    
    // Show first notification if available
    if (notifications.length > 0) {
      const notification = notifications[0];
      const notificationDiv = document.createElement("div");
      notificationDiv.classList.add("notification");
      notificationDiv.innerHTML = `
        <button class="close-btn" onclick="closeNotification(${notification.id})">×</button>
        <h3>${notification.title || 'Notification'}</h3>
        <p>${notification.message}</p>
      `;
      notificationSection.appendChild(notificationDiv);
    }
  }

  // Function to mark notification as read
  window.closeNotification = function (notificationId) {
    fetch(`/api/notifications/${notificationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ read: true }),
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || 'Failed to update notification');
        });
      }
      return response.json();
    })
    .then(() => {
      // Remove notification from UI
      const notificationElement = document.querySelector(".notification");
      if (notificationElement) {
        notificationElement.remove();
      }
      
      // Update badge count
      const badge = document.getElementById("notificationBadge");
      let count = parseInt(badge.innerText) - 1;
      if (count > 0) {
        badge.innerText = count;
      } else {
        badge.style.display = "none";
      }
    })
    .catch(error => {
      console.error("Error marking notification as read:", error);
    });
  };
});

function toggleDropdown() {
  const dropdownMenu = document.getElementById("dropdownMenu");
  if (dropdownMenu) {
    dropdownMenu.classList.toggle("show");
  }
}

function toggleNotification() {
  // Toggle notification panel visibility
  const notificationSection = document.getElementById("notificationSection");
  if (notificationSection) {
    notificationSection.style.display = 
      notificationSection.style.display === "none" ? "block" : "none";
  }
}

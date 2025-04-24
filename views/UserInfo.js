document.addEventListener("DOMContentLoaded", function () {
  // Check if user is logged in
  const userJson = sessionStorage.getItem("user");
  if (!userJson) {
    alert("Please log in to view your profile");
    window.location.href = "Signin.html";
    return;
  }

  const user = JSON.parse(userJson);

  // ✅ FIXED: No query parameter needed here!
  fetch(`/api/userinfo`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          throw new Error(data.message || "Failed to fetch profile data");
        });
      }
      return response.json();
    })
    .then((data) => {
      document.getElementById("userName").innerText =
        data.name || "Not provided";
      document.getElementById("userLastName").innerText =
        data.lastName || "Not provided";
      document.getElementById("userAddress").innerText =
        data.address || "Not provided";
      document.getElementById("userCity").innerText =
        data.city || "Not provided";
      document.getElementById("userState").innerText =
        data.state || "Not provided"; // Full state name
      document.getElementById("userZip").innerText =
        data.zipCode || "Not provided";
      
      // Display skills as a comma-separated list
      document.getElementById("userSkills").innerText = 
        Array.isArray(data.skills) && data.skills.length > 0
        ? data.skills.join(", ")
        : "None";
        
      document.getElementById("userRole").innerText = user.role || "User";
      
      // Add a preferences display if not already in the HTML
      if (document.getElementById("userPreferences")) {
        document.getElementById("userPreferences").innerText = 
          data.preferences && data.preferences.trim() !== ""
          ? data.preferences
          : "None";
      }
      // Format and display availability dates
      if (data.availability && Array.isArray(data.availability) && data.availability.length > 0) {
        const formattedDates = data.availability.map(date => {
          return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          });
        });
        document.getElementById("userAvailability").innerHTML = formattedDates.join('<br>');
      } else {
        document.getElementById("userAvailability").innerText = "No availability dates provided";
      }
    })
    .catch((error) => {
      console.error("Error fetching user profile:", error);
      document.getElementById("userName").innerText = "Error loading data";
      document.getElementById("userLastName").innerText = "Error loading data";
      document.getElementById("userAddress").innerText = "Error loading data";
      document.getElementById("userCity").innerText = "Error loading data";
      document.getElementById("userState").innerText = "Error loading data";
      document.getElementById("userZip").innerText = "Error loading data";
      document.getElementById("userSkills").innerText = "Error loading data";
      document.getElementById("userRole").innerText = user.role || "User";
      document.getElementById("userAvailability").innerText =
        "Error loading data";
    });

  // Fetch notifications
  fetch(`/api/userinfo/notifications`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          throw new Error(data.message || "Failed to fetch notifications");
        });
      }
      return response.json();
    })
    .then((data) => {
      const unreadNotifications = data.filter(
        (notification) => !notification.read
      );
      updateNotifications(unreadNotifications);
    })
    .catch((error) => {
      console.error("Error fetching notifications:", error);
      const mockNotifications = [
        {
          id: 1,
          type: "reminder",
          title: "Event Reminder",
          message:
            "Beach Cleanup starts in 3 days! Don't forget to bring gloves and water.",
          read: false,
        },
      ];
      updateNotifications(mockNotifications);
    });

  function updateNotifications(notifications) {
    const badge = document.getElementById("notificationBadge");
    const notificationSection = document.getElementById("notificationSection");
    const unreadCount = notifications.length;

    if (badge) {
      badge.innerText = unreadCount;
      badge.style.display = unreadCount > 0 ? "inline-block" : "none";
    }

    notificationSection.innerHTML = "";

    if (notifications.length > 0) {
      const notification = notifications[0];
      const notificationDiv = document.createElement("div");
      notificationDiv.classList.add("notification");
      notificationDiv.innerHTML = `
        <button class="close-btn" onclick="closeNotification(${
          notification.id
        })">×</button>
        <h3>${notification.title || "Notification"}</h3>
        <p>${notification.message}</p>
      `;
      notificationSection.appendChild(notificationDiv);
    }
  }

  window.closeNotification = function (notificationId) {
    fetch(`/api/userinfo/notifications/${notificationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.message || "Failed to update notification");
          });
        }
        return response.json();
      })
      .then(() => {
        const notificationElement = document.querySelector(".notification");
        if (notificationElement) notificationElement.remove();

        const badge = document.getElementById("notificationBadge");
        let count = parseInt(badge.innerText) - 1;
        badge.innerText = count > 0 ? count : "";
        badge.style.display = count > 0 ? "inline-block" : "none";
      })
      .catch((error) => {
        console.error("Error marking notification as read:", error);
      });
  };

  // Dropdown toggle for navbar
  const dropdown = document.getElementById("navDropdown");
  const button = dropdown?.querySelector(".dropbtn");

  if (button) {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdown.classList.toggle("show");
    });

    window.addEventListener("click", () => {
      dropdown.classList.remove("show");
    });
  }
});

// Logout function
function logout() {
  sessionStorage.removeItem("user");
  window.location.href = "Homepage.html";
}

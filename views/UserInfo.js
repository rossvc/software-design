document.addEventListener("DOMContentLoaded", function () {
  // Mock User Data
  const mockUserData = {
    name: "Alejandro.",
    LastName: "Avila.",
    address: "4302 University Dr.",
    city: "Houston.",
    state: "Texas.",
    zipcode: "77004.",
    skills: "Event Planning, Fundraising, Community Outreach.",
    userRole: "Volunteer.",
    availability: "04/15/2025.",
  };

  // Load user data with delay
  setTimeout(() => {
    document.getElementById("userName").innerText = mockUserData.name;
    document.getElementById("userLastName").innerText = mockUserData.LastName;
    document.getElementById("userAddress").innerText = mockUserData.address;
    document.getElementById("userCity").innerText = mockUserData.city;
    document.getElementById("userState").innerText = mockUserData.state;
    document.getElementById("userZip").innerText = mockUserData.zipcode;
    document.getElementById("userSkills").innerText = mockUserData.skills;
    document.getElementById("userRole").innerText = mockUserData.userRole;
    document.getElementById("userAvailability").innerText =
      mockUserData.availability;
  }, 1000);

  // Mock Notifications
  let notifications = [
    "Beach Cleanup starts in 3 days! Don't forget to bring gloves and water.",
    "New volunteer opportunity: Community Garden event this Saturday!",
    "Reminder: Fundraising event meeting tomorrow at 5 PM.",
  ];

  let unreadCount = notifications.length;
  const badge = document.getElementById("notificationBadge");
  const notificationSection = document.getElementById("notificationSection");

  // Function to update the badge count
  function updateBadge() {
    if (unreadCount > 0) {
      badge.innerText = unreadCount;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }

  function showNotification() {
    notificationSection.innerHTML = "";

    if (notifications.length > 0) {
      const notificationDiv = document.createElement("div");
      notificationDiv.classList.add("notification");
      notificationDiv.innerHTML = `
        <button class="close-btn" onclick="closeNotification()">×</button>
        <h3>Notification</h3>
        <p>${notifications[0]}</p>
      `;
      notificationSection.appendChild(notificationDiv);
    }
  }

  window.closeNotification = function () {
    notifications.shift();
    unreadCount--;
    updateBadge();
    showNotification();
  };

  // Initialize badge and show the first notification
  updateBadge();
  showNotification();
});

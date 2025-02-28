document.addEventListener("DOMContentLoaded", function () {
    // Toggle dropdown menu
    function toggleDropdown() {
      const dropdownMenu = document.getElementById("dropdownMenu");
      dropdownMenu.style.display = dropdownMenu.style.display === "none" ? "block" : "none";
    }
  
    document.getElementById("menuIcon").addEventListener("click", toggleDropdown);
  
    // Close dropdown when clicking outside
    window.onclick = function (event) {
      if (!event.target.matches("#menuIcon, #menuIcon *")) {
        const dropdownMenu = document.getElementById("dropdownMenu");
        if (dropdownMenu && dropdownMenu.style.display === "block") {
          dropdownMenu.style.display = "none";
        }
      }
    };
  
    // User credentials
    const users = [
      { username: "admin", password: "admin123", role: "admin" },
      { username: "volunteer", password: "volunteer123", role: "volunteer" },
    ];
  
    // Handle login form submission
    document.getElementById("loginForm").addEventListener("submit", function (event) {
      event.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
  
      const user = users.find(
        (user) => user.username === username && user.password === password
      );
  
      if (user) {
        showAlert("Login successful!", "success");
        setTimeout(() => {
          window.location.href =
            user.role === "admin" ? "AdminEventsDashboard.html" : "VolunteerEvents.html";
        }, 1500);
      } else {
        showAlert("Invalid username or password. Please try again.");
      }
    });
  
    // Custom alert functions
    function showAlert(message, type = "error") {
      const alertBox = document.getElementById("customAlert");
      const alertMessage = document.getElementById("alertMessage");
  
      alertMessage.textContent = message;
      alertBox.className = `alert ${type === "success" ? "success" : ""}`;
      alertBox.style.display = "flex";
  
      setTimeout(closeAlert, 3000);
    }
  
    function closeAlert() {
      const alertBox = document.getElementById("customAlert");
      alertBox.style.animation = "fadeOut 0.5s ease-in-out";
      setTimeout(() => {
        alertBox.style.display = "none";
      }, 500);
    }
  
    document.getElementById("closeAlertBtn").addEventListener("click", closeAlert);
  });
  
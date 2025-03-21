document.addEventListener("DOMContentLoaded", function () {
  // Toggle dropdown menu
  function toggleDropdown() {
    const dropdownMenu = document.getElementById("dropdownMenu");
    if (dropdownMenu) {
      dropdownMenu.style.display =
        dropdownMenu.style.display === "none" ? "block" : "none";
    }
  }

  const menuIcon = document.getElementById("menuIcon");
  if (menuIcon) {
    menuIcon.addEventListener("click", toggleDropdown);
  }

  // Close dropdown when clicking outside
  window.onclick = function (event) {
    if (!event.target.matches("#menuIcon, #menuIcon *")) {
      const dropdownMenu = document.getElementById("dropdownMenu");
      if (dropdownMenu && dropdownMenu.style.display === "block") {
        dropdownMenu.style.display = "none";
      }
    }
  };

  // Handle login form submission
  document
    .getElementById("loginForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      // Show loading state
      const submitButton = this.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = "Logging in...";
      submitButton.disabled = true;

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      // Call the login API with the correct endpoint
      fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include", // Important for session cookies
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((data) => {
              throw new Error(data.message || "Login failed");
            });
          }
          return response.json();
        })
        .then((data) => {
          // Store user info in session storage
          sessionStorage.setItem("user", JSON.stringify(data.user));

          showAlert("Login successful!", "success");
          setTimeout(() => {
            window.location.href =
              data.user.role === "admin"
                ? "AdminEventsDashboard.html"
                : "VolunteerEvents.html";
          }, 1500);
        })
        .catch((error) => {
          showAlert(
            error.message || "Invalid username or password. Please try again."
          );
        })
        .finally(() => {
          // Reset button state
          submitButton.textContent = originalButtonText;
          submitButton.disabled = false;
        });
    });

  // Custom alert functions
  function showAlert(message, type = "error") {
    const alertBox = document.getElementById("customAlert");
    const alertMessage = document.getElementById("alertMessage");

    if (alertBox && alertMessage) {
      alertMessage.textContent = message;
      alertBox.className = `alert ${type === "success" ? "success" : ""}`;
      alertBox.style.display = "flex";

      setTimeout(closeAlert, 3000);
    } else {
      // Fallback to regular alert if custom alert elements don't exist
      alert(message);
    }
  }

  function closeAlert() {
    const alertBox = document.getElementById("customAlert");
    if (alertBox) {
      alertBox.style.animation = "fadeOut 0.5s ease-in-out";
      setTimeout(() => {
        alertBox.style.display = "none";
      }, 500);
    }
  }

  const closeAlertBtn = document.getElementById("closeAlertBtn");
  if (closeAlertBtn) {
    closeAlertBtn.addEventListener("click", closeAlert);
  }
});

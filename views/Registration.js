document.addEventListener("DOMContentLoaded", function () {
  // Password validation
  function validatePassword() {
    var password = document.getElementById("password");
    var confirmPassword = document.getElementById("confirm_password");
    var submitButton = document.getElementById("submitBtn");
    var errorMessage = document.getElementById("passwordError");

    if (password.value.trim() === "" || confirmPassword.value.trim() === "") {
      errorMessage.textContent = "Fields cannot be empty!";
      errorMessage.style.color = "red";
      submitButton.disabled = true;
      return;
    }

    if (password.value !== confirmPassword.value) {
      errorMessage.textContent = "Passwords do not match!";
      errorMessage.style.color = "red";
      submitButton.disabled = true;
    } else {
      errorMessage.textContent = "";
      submitButton.disabled = false;
    }
  }

  document
    .getElementById("password")
    .addEventListener("input", validatePassword);
  document
    .getElementById("confirm_password")
    .addEventListener("input", validatePassword);

  // Toggle dropdown menu
  const menuIcon = document.getElementById("menuIcon");
  if (menuIcon) {
    menuIcon.addEventListener("click", function () {
      const dropdownMenu = document.getElementById("dropdownMenu");
      if (dropdownMenu) {
        dropdownMenu.style.display =
          dropdownMenu.style.display === "none" ? "block" : "none";
      }
    });
  }

  window.onclick = function (event) {
    if (!event.target.matches("#menuIcon, #menuIcon *")) {
      const dropdownMenu = document.getElementById("dropdownMenu");
      if (dropdownMenu && dropdownMenu.style.display === "block") {
        dropdownMenu.style.display = "none";
      }
    }
  };

  // Handle registration form submission
  const registrationForm = document.getElementById("registrationForm");
  if (registrationForm) {
    registrationForm.addEventListener("submit", function (event) {
      event.preventDefault();
      
      // Get form data
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      
      // Show loading state
      const submitButton = document.getElementById("submitBtn");
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = "Registering...";
      submitButton.disabled = true;
      
      // Call the registration API
      fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include' // Important for session cookies
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.message || 'Registration failed');
          });
        }
        return response.json();
      })
      .then(data => {
        // Store user ID for the next step
        sessionStorage.setItem('registeredUserId', data.user.id);
        sessionStorage.setItem('registeredUsername', data.user.username);
        
        // Show success message and redirect
        const errorMessage = document.getElementById("passwordError");
        if (errorMessage) {
          errorMessage.textContent = "Registration successful!";
          errorMessage.style.color = "green";
        }
        
        setTimeout(() => {
          window.location.href = "RegistrationForm.html";
        }, 1500);
      })
      .catch(error => {
        // Show error message
        const errorMessage = document.getElementById("passwordError");
        if (errorMessage) {
          errorMessage.textContent = error.message || "Registration failed. Please try again.";
          errorMessage.style.color = "red";
        }
      })
      .finally(() => {
        // Reset button state
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
      });
    });
  }
});

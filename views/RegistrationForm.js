document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registrationForm");
  const selectedDatesContainer = document.getElementById("selected-dates");
  const availabilityInput = document.getElementById("availability");
  const availabilityDatesInput = document.getElementById("availability-dates");
  let selectedDates = [];

  // Check if we have a registered user ID from the previous step
  const userId = sessionStorage.getItem("registeredUserId");
  const username = sessionStorage.getItem("registeredUsername");

  if (!userId) {
    console.warn(
      "No user ID found in session storage. User may not have completed registration step 1."
    );
    window.location.href = "Registration.html";
    return;
  }

  // Ensure consistent styling for the availability input
  function matchInputStyles() {
    const standardInput = document.getElementById("fullName"); // Using fullName as reference
    if (standardInput) {
      // Get computed styles from standard input
      const computedStyle = window.getComputedStyle(standardInput);

      // Apply the same width styling to availability input
      availabilityInput.style.width = computedStyle.width;
    }
  }

  // Call initially to set proper width
  matchInputStyles();

  // Also handle window resize
  window.addEventListener("resize", matchInputStyles);

  // Initialize flatpickr
  const datePicker = flatpickr("#availability", {
    mode: "multiple",
    dateFormat: "Y-m-d",
    minDate: "today",
    inline: false,
    static: true,
    disableMobile: "true",
    position: "below",
    monthSelectorType: "static",
    onChange: function (selectedDatesArray, dateStr) {
      selectedDates = selectedDatesArray.map((date) => {
        return flatpickr.formatDate(date, "Y-m-d");
      });

      // Update hidden input with selected dates
      availabilityDatesInput.value = JSON.stringify(selectedDates);

      // Update visual display of selected dates
      updateSelectedDatesDisplay();
    },
    onOpen: function (selectedDates, dateStr, instance) {
      // Ensure calendar width matches input width
      const inputWidth = availabilityInput.offsetWidth;
      instance.calendarContainer.style.width = inputWidth + "px";

      // Re-apply styles to maintain consistent width
      matchInputStyles();
    },
    onClose: function () {
      // Ensure the input shows something when dates are selected
      if (selectedDates.length > 0) {
        availabilityInput.value = `${selectedDates.length} date(s) selected`;
      }
    },
  });

  // Function to update the display of selected dates
  function updateSelectedDatesDisplay() {
    selectedDatesContainer.innerHTML = "";

    selectedDates.forEach((date) => {
      const dateTag = document.createElement("div");
      dateTag.className = "date-tag";

      const dateText = document.createElement("span");
      dateText.textContent = formatDisplayDate(date);

      const removeBtn = document.createElement("button");
      removeBtn.innerHTML = "&times;";
      removeBtn.setAttribute("data-date", date);
      removeBtn.addEventListener("click", function () {
        removeDate(date);
      });

      dateTag.appendChild(dateText);
      dateTag.appendChild(removeBtn);
      selectedDatesContainer.appendChild(dateTag);
    });
  }

  // Format date for display
  function formatDisplayDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // Remove a date from selection
  function removeDate(dateToRemove) {
    selectedDates = selectedDates.filter((date) => date !== dateToRemove);
    datePicker.setDate(selectedDates);
    availabilityDatesInput.value = JSON.stringify(selectedDates);
    updateSelectedDatesDisplay();

    if (selectedDates.length > 0) {
      availabilityInput.value = `${selectedDates.length} date(s) selected`;
    } else {
      availabilityInput.value = "";
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Show loading state
    const submitButton = this.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = "Submitting...";
    submitButton.disabled = true;

    // Collect values from the form
    const fullName = document.getElementById("fullName").value;
    const middleName = document.getElementById("middleName")?.value || "";
    const lastName = document.getElementById("lastName").value;
    const address = document.getElementById("address").value;
    const address2 = document.getElementById("address2")?.value || "";
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const zip = document.getElementById("zip").value;
    const skills = document.getElementById("skills").value;
    const preferences = document.getElementById("preferences")?.value || "";

    // Get availability dates from the hidden input
    const availabilityDates = selectedDates;

    // Validate required fields
    if (fullName && lastName && address && city && state && zip && skills) {
      // Prepare profile data
      const profileData = {
        name: fullName,
        lastName: lastName,
        address: address,
        city: city,
        state: state,
        zipCode: zip,
        skills: [skills],
        preferences: preferences,
        availability: availabilityDates,
      };

      // Call the API to update user profile with the correct endpoint
      fetch(`/api/userinfo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, profileData }),
        credentials: "include", // Important for session cookies
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((data) => {
              throw new Error(data.message || "Failed to update profile");
            });
          }
          return response.json();
        })
        .then((data) => {
          console.log("Profile updated successfully:", data);

          // Store user profile in session storage
          sessionStorage.setItem("user", JSON.stringify(data.profile));

          // Show success message and redirect
          alert("Registration successful!");
          window.location.href = "Signin.html";
        })
        .catch((error) => {
          console.error("Error updating profile:", error);
          alert(error.message || "Failed to update profile. Please try again.");
        })
        .finally(() => {
          // Reset button state
          submitButton.textContent = originalButtonText;
          submitButton.disabled = false;
        });
    } else {
      alert("Please fill in all required fields.");
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  });
});

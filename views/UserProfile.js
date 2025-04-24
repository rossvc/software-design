document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("userProfileForm");
  const selectedDatesContainer = document.getElementById("selected-dates");
  const availabilityInput = document.getElementById("availability");
  const availabilityDatesInput = document.getElementById("availability-dates");
  let selectedDates = [];

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

  // Check if user is logged in
  const userJson = sessionStorage.getItem("user");
  if (!userJson) {
    window.location.href = "Signin.html";
    return;
  }

  const user = JSON.parse(userJson);
  // Fetch current user profile data to populate the form
  fetch(`/api/userinfo`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
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
      // Populate form with existing data
      if (data) {
        document.getElementById("fullName").value = data.name || "";
        document.getElementById("lastName").value = data.lastName || "";
        document.getElementById("address").value = data.address || "";
        document.getElementById("city").value = data.city || "";
        
        // Properly set the state dropdown value
        const stateSelect = document.getElementById("state");
        if (data.state) {
          console.log("Setting state dropdown for state:", data.state);
          let stateFound = false;
          
          // First try to match by state code (2-letter abbreviation)
          for (let i = 0; i < stateSelect.options.length; i++) {
            if (stateSelect.options[i].value === data.state) {
              stateSelect.selectedIndex = i;
              stateFound = true;
              console.log("State matched by code at index:", i);
              break;
            }
          }
          
          // If no match found by code, try to match by state name
          if (!stateFound) {
            const stateName = data.state.toLowerCase();
            for (let i = 0; i < stateSelect.options.length; i++) {
              if (stateSelect.options[i].text.toLowerCase() === stateName) {
                stateSelect.selectedIndex = i;
                stateFound = true;
                console.log("State matched by name at index:", i);
                break;
              }
            }
            
            // If still no match, try to find a partial match
            if (!stateFound) {
              for (let i = 0; i < stateSelect.options.length; i++) {
                if (stateSelect.options[i].text.toLowerCase().includes(stateName) || 
                    stateName.includes(stateSelect.options[i].text.toLowerCase())) {
                  stateSelect.selectedIndex = i;
                  console.log("State matched by partial name at index:", i);
                  break;
                }
              }
            }
          }
        }
        
        document.getElementById("zip").value = data.zipCode || "";

        // Properly set the skills dropdown value
        const skillsSelect = document.getElementById("skills");
        if (data.skills && data.skills.length > 0) {
          console.log("Setting skills dropdown for skills:", data.skills);
          let skillFound = false;
          
          // Find the first matching skill and select it
          for (let i = 0; i < skillsSelect.options.length; i++) {
            const optionValue = skillsSelect.options[i].value.toLowerCase();
            
            // Check for exact match
            for (const skill of data.skills) {
              if (skill.toLowerCase() === optionValue) {
                skillsSelect.selectedIndex = i;
                skillFound = true;
                console.log("Skill matched at index:", i);
                break;
              }
            }
            
            if (skillFound) break;
          }
          
          // If no exact match, try partial match
          if (!skillFound) {
            for (let i = 0; i < skillsSelect.options.length; i++) {
              const optionValue = skillsSelect.options[i].value.toLowerCase();
              const optionText = skillsSelect.options[i].text.toLowerCase();
              
              for (const skill of data.skills) {
                const skillLower = skill.toLowerCase();
                if (skillLower.includes(optionValue) || optionValue.includes(skillLower) ||
                    skillLower.includes(optionText) || optionText.includes(skillLower)) {
                  skillsSelect.selectedIndex = i;
                  console.log("Skill partially matched at index:", i);
                  break;
                }
              }
            }
          }
        }

        // Handle preferences as a simple string
        if (data.preferences) {
          document.getElementById("preferences").value = data.preferences;
        }

        // Set availability dates
        if (
          data.availability &&
          Array.isArray(data.availability) &&
          data.availability.length > 0
        ) {
          // Set selected dates in the flatpickr
          selectedDates = data.availability;
          datePicker.setDate(selectedDates);
          availabilityDatesInput.value = JSON.stringify(selectedDates);

          // Update display
          availabilityInput.value = `${selectedDates.length} date(s) selected`;
          updateSelectedDatesDisplay();
        }
      }
    })
    .catch((error) => {
      console.error("Error fetching profile data:", error);
    });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Show loading state
    const submitButton = this.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = "Saving...";
    submitButton.disabled = true;

    const fullName = document.getElementById("fullName").value;
    const lastName = document.getElementById("lastName").value;
    const address = document.getElementById("address").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const zip = document.getElementById("zip").value;
    const skills = document.getElementById("skills").value;
    const preferences = document.getElementById("preferences")?.value || "";

    // Get availability dates from the hidden input
    const availabilityDates = selectedDates;

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

      // Call the API to update user profile
      fetch(`/api/userinfo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
        credentials: "include",
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

          // Update user profile in session storage
          sessionStorage.setItem("userProfile", JSON.stringify(data.profile));

          // Show success message and redirect
          alert("Changes saved!");
          window.location.href = "UserInfo.html";
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

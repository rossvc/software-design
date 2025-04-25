document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("userProfileForm");
  const selectedDatesContainer = document.getElementById("selected-dates");
  const availabilityInput = document.getElementById("availability");
  const availabilityDatesInput = document.getElementById("availability-dates");
  let selectedDates = [];

  // Keep availability input styled correctly
  function matchInputStyles() {
    const standardInput = document.getElementById("fullName");
    if (standardInput) {
      const computedStyle = window.getComputedStyle(standardInput);
      availabilityInput.style.width = computedStyle.width;
    }
  }

  matchInputStyles();
  window.addEventListener("resize", matchInputStyles);

  // ✅ Initialize flatpickr with calendar opening upward
  const datePicker = flatpickr("#availability", {
    mode: "multiple",
    dateFormat: "Y-m-d",
    minDate: "today",
    inline: false,
    static: false,
    disableMobile: "true",
    position: "above",
    monthSelectorType: "static",
    onChange: function (selectedDatesArray) {
      selectedDates = selectedDatesArray.map((date) =>
        flatpickr.formatDate(date, "Y-m-d")
      );
      availabilityDatesInput.value = JSON.stringify(selectedDates);
      updateSelectedDatesDisplay();
    },
    onOpen: function () {
      matchInputStyles(); // ✅ Keep this, but REMOVE width override!
    },
    onClose: function () {
      availabilityInput.value =
        selectedDates.length > 0
          ? `${selectedDates.length} date(s) selected`
          : "";
    },
  });

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

  function formatDisplayDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function removeDate(dateToRemove) {
    selectedDates = selectedDates.filter((date) => date !== dateToRemove);
    datePicker.setDate(selectedDates);
    availabilityDatesInput.value = JSON.stringify(selectedDates);
    updateSelectedDatesDisplay();
    availabilityInput.value =
      selectedDates.length > 0
        ? `${selectedDates.length} date(s) selected`
        : "";
  }

  // Check if user is logged in
  const userJson = sessionStorage.getItem("user");
  if (!userJson) {
    window.location.href = "Signin.html";
    return;
  }

  const user = JSON.parse(userJson);

  // Populate form with existing user data
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
      if (data) {
        document.getElementById("fullName").value = data.name || "";
        document.getElementById("middleName").value = data.middleName || "";
        document.getElementById("lastName").value = data.lastName || "";
        document.getElementById("address").value = data.address || "";
        document.getElementById("address2").value = data.address2 || "";
        document.getElementById("city").value = data.city || "";

        const stateSelect = document.getElementById("state");
        if (data.state) {
          let stateFound = false;
          for (let i = 0; i < stateSelect.options.length; i++) {
            if (stateSelect.options[i].value === data.state) {
              stateSelect.selectedIndex = i;
              stateFound = true;
              break;
            }
          }
          if (!stateFound) {
            const stateName = data.state.toLowerCase();
            for (let i = 0; i < stateSelect.options.length; i++) {
              if (stateSelect.options[i].text.toLowerCase() === stateName) {
                stateSelect.selectedIndex = i;
                break;
              }
            }
          }
        }

        document.getElementById("zip").value = data.zipCode || "";

        // ✅ Populate skills (checkboxes)
        if (data.skills && data.skills.length > 0) {
          const skillCheckboxes = document.querySelectorAll(
            "#skills input[type='checkbox']"
          );
          skillCheckboxes.forEach((checkbox) => {
            if (data.skills.includes(checkbox.value)) {
              checkbox.checked = true;
            }
          });
        }

        if (data.preferences) {
          document.getElementById("preferences").value = data.preferences;
        }

        if (data.availability && Array.isArray(data.availability)) {
          selectedDates = data.availability;
          datePicker.setDate(selectedDates);
          availabilityDatesInput.value = JSON.stringify(selectedDates);
          availabilityInput.value = `${selectedDates.length} date(s) selected`;
          updateSelectedDatesDisplay();
        }
      }
    })
    .catch((error) => {
      console.error("Error fetching profile data:", error);
    });

  // ✅ Handle form submit
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const submitButton = this.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = "Saving...";
    submitButton.disabled = true;

    const fullName = document.getElementById("fullName").value;
    const middleName = document.getElementById("middleName").value;
    const lastName = document.getElementById("lastName").value;
    const address = document.getElementById("address").value;
    const address2 = document.getElementById("address2").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const zip = document.getElementById("zip").value;
    const preferences = document.getElementById("preferences").value;

    // ✅ Collect selected skills (checkboxes)
    const skillCheckboxes = document.querySelectorAll(
      "#skills input[type='checkbox']"
    );
    const skills = Array.from(skillCheckboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);

    const availabilityDates = selectedDates;

    if (
      fullName &&
      lastName &&
      address &&
      city &&
      state &&
      zip &&
      skills.length > 0
    ) {
      const profileData = {
        name: fullName,
        middleName: middleName,
        lastName: lastName,
        address: address,
        address2: address2,
        city: city,
        state: state,
        zipCode: zip,
        skills: skills,
        preferences: preferences,
        availability: availabilityDates,
      };

      fetch(`/api/userinfo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
          sessionStorage.setItem("userProfile", JSON.stringify(data.profile));
          alert("Changes saved!");
          window.location.href = "UserInfo.html";
        })
        .catch((error) => {
          console.error("Error updating profile:", error);
          alert(error.message || "Failed to update profile. Please try again.");
        })
        .finally(() => {
          submitButton.textContent = originalButtonText;
          submitButton.disabled = false;
        });
    } else {
      alert(
        "Please fill in all required fields, including selecting at least one skill."
      );
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  });
});

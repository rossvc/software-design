document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registrationForm");
  const selectedDatesContainer = document.getElementById("selected-dates");
  const availabilityInput = document.getElementById("availability");
  const availabilityDatesInput = document.getElementById("availability-dates");
  let selectedDates = [];

  const userId = sessionStorage.getItem("registeredUserId");
  if (!userId) {
    console.warn("No user ID found. Redirecting to registration start.");
    window.location.href = "Registration.html";
    return;
  }

  // ✅ Fixed Flatpickr Initialization
  const datePicker = flatpickr("#availability", {
    mode: "multiple",
    dateFormat: "Y-m-d",
    minDate: "today",
    inline: false,
    static: false,               // ✅ Allows floating outside the container
    disableMobile: "true",
    position: "auto",            // ✅ Smart positioning
    appendTo: document.body,     // ✅ Prevents cutting off by containers
    monthSelectorType: "static",
    onChange: function (selectedDatesArray) {
      selectedDates = selectedDatesArray.map((date) =>
        flatpickr.formatDate(date, "Y-m-d")
      );
      availabilityDatesInput.value = JSON.stringify(selectedDates);
      updateSelectedDatesDisplay(); // ✅ Draw blue rectangles
    },
    onClose: function () {
      availabilityInput.value = selectedDates.length > 0 ? `${selectedDates.length} date(s) selected` : "";
    }
  });

  // ✅ Draw the selected dates (blue rectangles)
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

  // ✅ Format date for blue tag display
  function formatDisplayDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // ✅ Remove a selected date (when clicking the "×" button)
  function removeDate(dateToRemove) {
    selectedDates = selectedDates.filter((date) => date !== dateToRemove);
    datePicker.setDate(selectedDates);
    availabilityDatesInput.value = JSON.stringify(selectedDates);
    updateSelectedDatesDisplay();
    availabilityInput.value = selectedDates.length > 0 ? `${selectedDates.length} date(s) selected` : "";
  }

  // ✅ Submit the form
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const submitButton = this.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = "Submitting...";
    submitButton.disabled = true;

    const fullName = document.getElementById("fullName").value;
    const middleName = document.getElementById("middleName")?.value || "";
    const lastName = document.getElementById("lastName").value;
    const address = document.getElementById("address").value;
    const address2 = document.getElementById("address2")?.value || "";
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const zip = document.getElementById("zip").value;
    const preferences = document.getElementById("preferences")?.value || "";

    // ✅ Collect selected skills (checkboxes)
    const selectedSkills = Array.from(document.querySelectorAll('input[name="skills"]:checked'))
      .map((checkbox) => checkbox.value);

    const availabilityDates = selectedDates;

    // ✅ Validation
    if (fullName && lastName && address && city && state && zip && selectedSkills.length > 0) {
      const profileData = {
        name: fullName,
        middleName: middleName,
        lastName: lastName,
        address: address,
        address2: address2,
        city: city,
        state: state,
        zipCode: zip,
        skills: selectedSkills, // ✅ Skills sent as array
        preferences: preferences,
        availability: availabilityDates, // ✅ Dates also sent as array
      };

      fetch(`/api/userinfo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, profileData }),
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
          sessionStorage.setItem("user", JSON.stringify(data.profile));
          alert("Registration successful!");
          window.location.href = "Signin.html";
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
      alert("Please fill in all required fields and select at least one skill.");
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  });
});

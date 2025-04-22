document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registrationForm");

  // Check if we have a registered user ID from the previous step
  const userId = sessionStorage.getItem("registeredUserId");
  const username = sessionStorage.getItem("registeredUsername");

  if (!userId) {
    console.warn(
      "No user ID found in session storage. User may not have completed registration step 1."
    );
  }

  if (form) {
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
      const availability = document.getElementById("availability")?.value || "";

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
          availability: availability ? [availability] : [],
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
            window.location.href = "VolunteerEvents.html";
          })
          .catch((error) => {
            console.error("Error updating profile:", error);
            alert(
              error.message || "Failed to update profile. Please try again."
            );
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
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("userProfileForm");

  // Get user data from session storage
  const userJson = sessionStorage.getItem("user");
  if (!userJson) {
    // Redirect to login if not logged in
    alert("Please log in to update your profile");
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
    body: JSON.stringify({ userId: user.id }),
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
        document.getElementById("state").value = data.state || "";
        document.getElementById("zip").value = data.zipCode || "";

        // For select fields, we need to find the matching option
        const skillsSelect = document.getElementById("skills");
        if (data.skills && data.skills.length > 0) {
          for (let i = 0; i < skillsSelect.options.length; i++) {
            if (data.skills.includes(skillsSelect.options[i].value)) {
              skillsSelect.selectedIndex = i;
              break;
            }
          }
        }

        if (data.preferences) {
          document.getElementById("preferences").value = data.preferences;
        }

        if (data.availability && data.availability.length > 0) {
          document.getElementById("availability").value = data.availability[0];
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
    const availability = document.getElementById("availability")?.value || "";

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

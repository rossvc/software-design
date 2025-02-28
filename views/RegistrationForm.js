document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registrationForm");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Collect values from the form
    const fullName = document.getElementById("fullName").value;
    const lastName = document.getElementById("lastName").value;
    const address = document.getElementById("address").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const zip = document.getElementById("zip").value;
    const skills = document.getElementById("skills").value;

    // Validate required fields
    if (fullName && lastName && address && city && state && zip && skills) {
      console.log("Registration successful!");
      alert("Registration successful!");
      window.location.href = "VolunteerEvents.html"; // Redirect to VolunteerEvents.html
    } else {
      alert("Please fill in all required fields.");
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("userProfileForm");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value;
    const lastName = document.getElementById("lastName").value;
    const address = document.getElementById("address").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const zip = document.getElementById("zip").value;
    const skills = document.getElementById("skills").value;

    if (fullName && lastName && address && city && state && zip && skills) {
      console.log("Profile updated successfully!");
      alert("Changes saved!");
      window.location.href = "UserInfo.html";
    } else {
      alert("Please fill in all required fields.");
    }
  });
});

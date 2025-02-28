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

  document.getElementById("menuIcon").addEventListener("click", function () {
    const dropdownMenu = document.getElementById("dropdownMenu");
    dropdownMenu.style.display =
      dropdownMenu.style.display === "none" ? "block" : "none";
  });

  window.onclick = function (event) {
    if (!event.target.matches("#menuIcon, #menuIcon *")) {
      const dropdownMenu = document.getElementById("dropdownMenu");
      if (dropdownMenu.style.display === "block") {
        dropdownMenu.style.display = "none";
      }
    }
  };

  document
    .getElementById("registrationForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      window.location.href = "RegistrationForm.html";
    });
});

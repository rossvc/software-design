document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("signUpBtn").addEventListener("click", function () {
    window.location.href = "Registration.html";
  });

  document.getElementById("logInBtn").addEventListener("click", function () {
    window.location.href = "Signin.html";
  });

  document.getElementById("menuIcon").addEventListener("click", function () {
    alert("Menu clicked! You can implement functionality here.");
  });
});

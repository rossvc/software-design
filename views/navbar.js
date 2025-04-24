// Dynamically inject navbar.html into #navbar-container and set up menu links
function loadNavbar(title) {
  fetch("navbar.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navbar-container").innerHTML = data;
      if (title) {
        document.getElementById("navbar-title").textContent = title;
      }
      setupNavbarLinks();
      setupDropdown();
    });
}

function setupNavbarLinks() {
  const userJson = sessionStorage.getItem("user");
  const linksDiv = document.getElementById("navbar-links");
  let links = "";
  if (!userJson) {
    // Not logged in
    links += '<a href="Homepage.html">Home</a>';
    links += '<a href="Signin.html">Sign In</a>';
    links += '<a href="Registration.html">Register</a>';
  } else {
    const user = JSON.parse(userJson);
    if (user.role === "admin") {
      links += '<a href="Homepage.html">Home</a>';
      links += '<a href="AdminEventsDashboard.html">Admin Dashboard</a>';
      links += '<a href="Reporting.html">Reports</a>';
      links += '<a href="notifications.html">Notifications</a>';
    } else {
      links += '<a href="Homepage.html">Home</a>';
      links += '<a href="UserInfo.html">Your Profile</a>';
      links += '<a href="VolunteerEvents.html">Volunteer Events</a>';
      links += '<a href="volunteer-history.html">Volunteer History</a>';
      links += '<a href="notifications.html">Notifications</a>';
    }
    links += '<a href="#" id="logout-link">Log Out</a>';
  }
  linksDiv.innerHTML = links;
  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();
      sessionStorage.removeItem("user");
      window.location.href = "Homepage.html";
    });
  }
}

function setupDropdown() {
  const menuIcon = document.getElementById("menuIcon");
  const dropdownMenu = document.getElementById("dropdownMenu");
  if (menuIcon && dropdownMenu) {
    menuIcon.onclick = function () {
      dropdownMenu.style.display =
        dropdownMenu.style.display === "block" ? "none" : "block";
    };
    window.onclick = function (event) {
      if (!event.target.matches("#menuIcon, #menuIcon *")) {
        if (dropdownMenu.style.display === "block") {
          dropdownMenu.style.display = "none";
        }
      }
    };
  }
}

// Usage: loadNavbar('Page Title'); // Call this in each HTML page after #navbar-container

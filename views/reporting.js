// reporting.js

document.addEventListener("DOMContentLoaded", () => {
  // Load the external navbar
  fetch("navbar.html")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("navbar").innerHTML = html;

      // After navbar is injected, setup dropdown toggle
      const menuButton = document.getElementById("menu-toggle");
      const dropdown = document.getElementById("dropdown-menu");

      if (menuButton && dropdown) {
        menuButton.addEventListener("click", () => {
          dropdown.classList.toggle("show");
        });

        // Close dropdown when clicking outside
        window.addEventListener("click", (e) => {
          const clickedInsideMenu =
            menuButton.contains(e.target) || dropdown.contains(e.target);
          if (!clickedInsideMenu) {
            dropdown.classList.remove("show");
          }
        });
      }
    })
    .catch((err) => {
      console.error("Failed to load navbar:", err);
    });
});

// Generate and download a report
function generateReport(type, format) {
  const msgDiv = document.getElementById("report-message");
  msgDiv.textContent = "Generating report...";

  const token = sessionStorage.getItem("user");

  if (!token) {
    msgDiv.textContent = "Not authorized. Please log in.";
    return;
  }

  fetch(`/api/reports/${type}?format=${format}`, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to generate report");
      }
      return res.blob();
    })
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-report.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      msgDiv.textContent = "Report downloaded.";
    })
    .catch((err) => {
      console.error("Error generating report:", err);
      msgDiv.textContent = err.message;
    });
}

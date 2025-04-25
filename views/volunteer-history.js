document.addEventListener("DOMContentLoaded", function () {
  let volunteerHistory = [];
  
  // Check if user is logged in
  const userJson = sessionStorage.getItem('user');
  if (!userJson) {
    // Redirect to login if not logged in
    alert('Please log in to view your volunteer history');
    window.location.href = 'Signin.html';
    return;
  }

  const user = JSON.parse(userJson);
  
  // Function to toggle dropdown menu
  window.toggleDropdown = function() {
    const dropdownMenu = document.getElementById("dropdownMenu");
    if (dropdownMenu) {
      dropdownMenu.classList.toggle("show");
    }
  };

  // Close dropdown when clicking outside
  window.onclick = function(event) {
    if (!event.target.matches('.menu-icon, .menu-icon *')) {
      const dropdownMenu = document.getElementById("dropdownMenu");
      if (dropdownMenu && dropdownMenu.classList.contains("show")) {
        dropdownMenu.classList.remove("show");
      }
    }
  };

  // Set up table sorting
  document.querySelectorAll("th").forEach((header) => {
    header.addEventListener("click", () => {
      const table = header.closest("table");
      const index = Array.from(header.parentElement.children).indexOf(header);
      const rows = Array.from(table.querySelectorAll("tbody tr"));
      const isAscending = header.querySelector(".sort-icon").textContent === "↓";

      document.querySelectorAll(".sort-icon").forEach((icon) => {
        icon.textContent = "↕";
      });
      header.querySelector(".sort-icon").textContent = isAscending ? "↑" : "↓";

      rows.sort((a, b) => {
        const aValue = a.children[index].textContent;
        const bValue = b.children[index].textContent;
        return isAscending
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });

      const tbody = table.querySelector("tbody");
      tbody.innerHTML = "";
      rows.forEach((row) => tbody.appendChild(row));
    });
  });

  // Set up search functionality
  const searchBox = document.querySelector(".search-box");
  if (searchBox) {
    searchBox.addEventListener("input", () => {
      filterTable();
    });
  }

  // Set up filter functionality
  const filters = document.querySelectorAll(".filter-select");
  filters.forEach((filter) => {
    filter.addEventListener("change", () => {
      filterTable();
    });
  });

  // Function to filter the table based on search and filters
  function filterTable() {
    const rows = document.querySelectorAll("tbody tr");
    const searchTerm = document.querySelector(".search-box").value.toLowerCase();
    const statusFilter = document.getElementById("status-filter").value;
    const urgencyFilter = document.getElementById("urgency-filter").value;

    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      const status = row.querySelector(".status-badge")?.textContent.toLowerCase() || "";
      const urgency = row.querySelector('[class^="urgency-"]')?.textContent.toLowerCase() || "";
      
      const searchMatch = text.includes(searchTerm);
      const statusMatch = !statusFilter || status.includes(statusFilter);
      const urgencyMatch = !urgencyFilter || urgency.includes(urgencyFilter);

      row.style.display = searchMatch && statusMatch && urgencyMatch ? "" : "none";
    });
  }

  // Set up export functionality
  const exportButton = document.querySelector(".export-button");
  if (exportButton) {
    exportButton.addEventListener("click", () => {
      const table = document.querySelector("table");
      const rows = Array.from(table.querySelectorAll("tr"));

      const csvContent = rows
        .map((row) => {
          return Array.from(row.children)
            .map((cell) => `"${cell.textContent.trim()}"`)
            .join(",");
        })
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "volunteer-history.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  // Function to fetch volunteer history
  function fetchVolunteerHistory() {
    // Show loading state
    const tableBody = document.querySelector("tbody");
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Loading...</td></tr>';
    
    fetch('/api/history/current', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || 'Failed to fetch volunteer history');
        });
      }
      return response.json();
    })
    .then(data => {
      volunteerHistory = data;
      updateHistoryTable(data);
    })
    .catch(error => {
      console.error('Error fetching volunteer history:', error);
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">Error loading history: ${error.message}</td></tr>`;
    });
  }

  // Function to update the history table
  function updateHistoryTable(historyData) {
    const tableBody = document.querySelector("tbody");
    tableBody.innerHTML = '';
    
    if (historyData.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No volunteer history found</td></tr>';
      return;
    }
    
    historyData.forEach(item => {
      const row = document.createElement('tr');
      
      // Format date
      const eventDate = new Date(item.eventDate || item.date);
      const formattedDate = eventDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      // Determine status class
      let statusClass = 'status-upcoming';
      if (item.status === 'completed') {
        statusClass = 'status-completed';
      } else if (item.status === 'cancelled') {
        statusClass = 'status-cancelled';
      }
      
      // Determine urgency class
      const urgencyClass = `urgency-${item.urgency.toLowerCase()}`;
      
      row.innerHTML = `
        <td>${item.eventName || item.name}</td>
        <td>${item.eventDescription || item.description || 'No description available'}</td>
        <td>${item.eventLocation || item.location}</td>
        <td>
          <div class="skills-list">
            ${item.requiredSkills ? item.requiredSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('') : 'No skills required'}
          </div>
        </td>
        <td><span class="${urgencyClass}">${item.urgency}</span></td>
        <td>${formattedDate}</td>
        <td>
          <span class="status-badge ${statusClass}">${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
  }

  // Set up pagination
  function setupPagination(totalPages) {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;
    
    pagination.innerHTML = '';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '<i class="bx bx-chevron-left"></i>';
    prevButton.disabled = true;
    prevButton.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        fetchPagedHistory(currentPage);
      }
    });
    pagination.appendChild(prevButton);
    
    // Page buttons
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      if (i === 1) pageButton.classList.add('active');
      pageButton.addEventListener('click', () => {
        currentPage = i;
        fetchPagedHistory(currentPage);
        
        // Update active state
        document.querySelectorAll('.pagination button').forEach(btn => {
          btn.classList.remove('active');
        });
        pageButton.classList.add('active');
      });
      pagination.appendChild(pageButton);
    }
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '<i class="bx bx-chevron-right"></i>';
    nextButton.disabled = totalPages <= 1;
    nextButton.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        fetchPagedHistory(currentPage);
      }
    });
    pagination.appendChild(nextButton);
  }

  // Function to fetch paged history
  function fetchPagedHistory(page) {
    // In a real implementation, this would call the API with pagination parameters
    // For now, we'll just use the in-memory data
    const itemsPerPage = 10;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pagedData = volunteerHistory.slice(start, end);
    
    updateHistoryTable(pagedData);
    
    // Update pagination buttons
    const buttons = document.querySelectorAll('.pagination button');
    if (buttons.length > 0) {
      buttons[0].disabled = page === 1; // Prev button
      buttons[buttons.length - 1].disabled = page === Math.ceil(volunteerHistory.length / itemsPerPage); // Next button
    }
  }

  // Initialize by fetching volunteer history
  fetchVolunteerHistory();
});

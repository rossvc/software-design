document.addEventListener("DOMContentLoaded", function () {
  let notifications = [];
  
  // Check if user is logged in
  const userJson = sessionStorage.getItem('user');
  if (!userJson) {
    // Redirect to login if not logged in
    alert('Please log in to view notifications');
    window.location.href = 'Signin.html';
    return;
  }

  const user = JSON.parse(userJson);
  
  // Set up dropdown menu
  const menuIcon = document.querySelector('.menu-icon');
  if (menuIcon) {
    menuIcon.addEventListener('click', function() {
      const dropdownMenu = document.getElementById('dropdownMenu');
      if (dropdownMenu) {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
      }
    });
  }
  
  // Close dropdown when clicking outside
  window.onclick = function(event) {
    if (!event.target.matches('.menu-icon, .menu-icon *')) {
      const dropdownMenu = document.getElementById('dropdownMenu');
      if (dropdownMenu && dropdownMenu.style.display === 'block') {
        dropdownMenu.style.display = 'none';
      }
    }
  };

  // Set up filter buttons
  const filterButtons = document.querySelectorAll(".filter-button");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const filterValue = button.dataset.filter;
      filterNotifications(filterValue);
    });
  });

  // Function to filter notifications
  function filterNotifications(filterValue) {
    const notificationElements = document.querySelectorAll(".notification");
    notificationElements.forEach((notification) => {
      if (filterValue === "all" || notification.dataset.type === filterValue) {
        notification.style.display = "";
      } else {
        notification.style.display = "none";
      }
    });

    // Check if there are any visible notifications
    const visibleNotifications = document.querySelectorAll('.notification[style=""]');
    const emptyState = document.querySelector(".empty-state");
    
    if (visibleNotifications.length === 0) {
      if (!emptyState) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.innerHTML = `
          <i class="bx bx-bell-off"></i>
          <p>No notifications to show</p>
        `;
        document.querySelector(".notification-list").appendChild(empty);
      }
    } else if (emptyState) {
      emptyState.remove();
    }
  }

  // Set up mark all as read button
  const markAllReadButton = document.querySelector(".mark-all-read");
  if (markAllReadButton) {
    markAllReadButton.addEventListener("click", () => {
      // Show loading state
      markAllReadButton.textContent = "Marking...";
      markAllReadButton.disabled = true;
      
      // Call the API to mark all notifications as read
      fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.message || 'Failed to mark notifications as read');
          });
        }
        return response.json();
      })
      .then(data => {
        // Update UI
        const notificationElements = document.querySelectorAll(".notification");
        notificationElements.forEach((notification) => {
          notification.classList.remove("unread");
        });
        
        // Update local notifications data
        notifications.forEach(notification => {
          notification.read = true;
        });
      })
      .catch(error => {
        console.error('Error marking notifications as read:', error);
        alert(error.message || "Failed to mark notifications as read. Please try again.");
      })
      .finally(() => {
        // Reset button state
        markAllReadButton.textContent = "Mark All as Read";
        markAllReadButton.disabled = false;
      });
    });
  }

  // Function to mark a single notification as read
  function markNotificationAsRead(notificationId, element) {
    fetch(`/api/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || 'Failed to mark notification as read');
        });
      }
      return response.json();
    })
    .then(data => {
      // Update UI
      element.classList.remove("unread");
      
      // Update local notifications data
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    })
    .catch(error => {
      console.error('Error marking notification as read:', error);
    });
  }

  // Function to fetch notifications
  function fetchNotifications() {
    // Show loading state
    const notificationList = document.querySelector(".notification-list");
    notificationList.innerHTML = '<div class="loading" style="text-align: center; padding: 20px;">Loading notifications...</div>';
    
    fetch('/api/notifications', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || 'Failed to fetch notifications');
        });
      }
      return response.json();
    })
    .then(data => {
      notifications = data;
      updateNotificationsList(data);
    })
    .catch(error => {
      console.error('Error fetching notifications:', error);
      notificationList.innerHTML = `<div class="error" style="text-align: center; padding: 20px; color: red;">Error loading notifications: ${error.message}</div>`;
    });
  }

  // Function to update the notifications list
  function updateNotificationsList(notificationsData) {
    const notificationList = document.querySelector(".notification-list");
    notificationList.innerHTML = '';
    
    if (notificationsData.length === 0) {
      notificationList.innerHTML = `
        <div class="empty-state">
          <i class="bx bx-bell-off"></i>
          <p>No notifications to show</p>
        </div>
      `;
      return;
    }
    
    notificationsData.forEach(notification => {
      // Determine notification type class
      let typeClass = 'type-update';
      if (notification.type === 'assignment') {
        typeClass = 'type-assignment';
      } else if (notification.type === 'reminder') {
        typeClass = 'type-reminder';
      }
      
      // Determine icon based on type
      let icon = 'bx-refresh';
      if (notification.type === 'assignment') {
        icon = 'bx-calendar-check';
      } else if (notification.type === 'reminder') {
        icon = 'bx-bell';
      }
      
      // Format time
      const notificationTime = formatTimeAgo(new Date(notification.createdAt));
      
      const notificationElement = document.createElement('div');
      notificationElement.className = `notification ${notification.read ? '' : 'unread'}`;
      notificationElement.dataset.type = notification.type;
      notificationElement.dataset.id = notification.id;
      
      notificationElement.innerHTML = `
        <div class="notification-icon">
          <i class="bx ${icon}" style="font-size: 24px"></i>
        </div>
        <div class="notification-content">
          <div class="notification-title">
            ${notification.title}
            <span class="notification-type ${typeClass}">${notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}</span>
          </div>
          <div class="notification-message">
            ${notification.message}
          </div>
          <div class="notification-time">${notificationTime}</div>
        </div>
      `;
      
      // Add click event to mark as read
      notificationElement.addEventListener("click", () => {
        if (!notification.read) {
          markNotificationAsRead(notification.id, notificationElement);
        }
      });
      
      notificationList.appendChild(notificationElement);
    });
    
    // Apply current filter
    const activeFilter = document.querySelector(".filter-button.active");
    if (activeFilter) {
      filterNotifications(activeFilter.dataset.filter);
    }
  }

  // Helper function to format time ago
  function formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  }

  // Initialize by fetching notifications
  fetchNotifications();
});

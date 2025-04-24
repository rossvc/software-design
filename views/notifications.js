document.addEventListener("DOMContentLoaded", function () {
  let notifications = [];

  // Check if user is logged in
  const userJson = sessionStorage.getItem("user");
  if (!userJson) {
    // Redirect to login if not logged in
    alert("Please log in to view notifications");
    window.location.href = "Signin.html";
    return;
  }

  const user = JSON.parse(userJson);

  // Set up dropdown menu
  const menuIcon = document.querySelector(".menu-icon");
  if (menuIcon) {
    menuIcon.addEventListener("click", function () {
      const dropdownMenu = document.getElementById("dropdownMenu");
      if (dropdownMenu) {
        dropdownMenu.style.display =
          dropdownMenu.style.display === "block" ? "none" : "block";
      }
    });
  }

  // Close dropdown when clicking outside
  window.onclick = function (event) {
    if (!event.target.matches(".menu-icon, .menu-icon *")) {
      const dropdownMenu = document.getElementById("dropdownMenu");
      if (dropdownMenu && dropdownMenu.style.display === "block") {
        dropdownMenu.style.display = "none";
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
    const visibleNotifications = document.querySelectorAll(
      '.notification[style=""]'
    );
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
      fetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((data) => {
              throw new Error(
                data.message || "Failed to mark notifications as read"
              );
            });
          }
          return response.json();
        })
        .then((data) => {
          // Add removing class to all notifications for animation
          const notificationElements = document.querySelectorAll(".notification");
          
          if (notificationElements.length > 0) {
            notificationElements.forEach((notification, index) => {
              // Stagger the animations slightly for visual effect
              setTimeout(() => {
                notification.classList.add("removing");
              }, index * 50);
            });
            
            // Show success toast
            showToast("All notifications marked as read", "success");
            
            // Clear the list after animations complete
            setTimeout(() => {
              const notificationList = document.querySelector(".notification-list");
              notificationList.innerHTML = `
                <div class="empty-state">
                  <i class="bx bx-bell-off"></i>
                  <p>No notifications to show</p>
                </div>
              `;
            }, notificationElements.length * 50 + 500);
            
            // Clear the notifications array
            notifications = [];
          }
        })
        .catch((error) => {
          console.error("Error marking notifications as read:", error);
          showToast(error.message || "Failed to mark notifications as read", "error");
        })
        .finally(() => {
          // Reset button state
          markAllReadButton.textContent = "Mark All as Read";
          markAllReadButton.disabled = false;
        });
    });
  }

  // Function to show toast notification
  function showToast(message, type = "success", duration = 3000) {
    const toastContainer = document.querySelector(".toast-container");
    
    // Create toast element
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    // Set icon based on type
    let icon = "bx-check-circle";
    if (type === "error") {
      icon = "bx-error-circle";
    }
    
    // Create toast content
    toast.innerHTML = `
      <div class="toast-icon">
        <i class="bx ${icon}"></i>
      </div>
      <div class="toast-content">
        ${message}
      </div>
      <div class="toast-progress">
        <div class="toast-progress-bar"></div>
      </div>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Show toast with animation
    setTimeout(() => {
      toast.classList.add("show");
      
      // Animate progress bar
      const progressBar = toast.querySelector(".toast-progress-bar");
      progressBar.style.width = "100%";
      progressBar.style.transitionDuration = `${duration}ms`;
      progressBar.style.width = "0%";
    }, 10);
    
    // Remove toast after duration
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }

  // Function to mark a single notification as read
  function markNotificationAsRead(notificationId, element) {
    fetch(`/api/notifications/${notificationId}/read`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(
              data.message || "Failed to mark notification as read"
            );
          });
        }
        return response.json();
      })
      .then((data) => {
        // Add removing class for animation
        element.classList.add("removing");
        
        // Show success toast
        showToast("Notification marked as read", "success");
        
        // Remove element after animation completes
        setTimeout(() => {
          element.remove();
          
          // Check if there are any notifications left
          const notificationElements = document.querySelectorAll(".notification");
          if (notificationElements.length === 0) {
            const notificationList = document.querySelector(".notification-list");
            notificationList.innerHTML = `
              <div class="empty-state">
                <i class="bx bx-bell-off"></i>
                <p>No notifications to show</p>
              </div>
            `;
          }
        }, 500);
        
        // Update local notifications data
        const index = notifications.findIndex((n) => n.id === notificationId);
        if (index !== -1) {
          // Remove the notification from the array
          notifications.splice(index, 1);
        }
      })
      .catch((error) => {
        console.error("Error marking notification as read:", error);
        showToast(error.message || "Failed to mark notification as read", "error");
      });
  }

  // Function to fetch notifications
  function fetchNotifications() {
    // Show loading state
    const notificationList = document.querySelector(".notification-list");
    notificationList.innerHTML =
      '<div class="loading" style="text-align: center; padding: 20px;">Loading notifications...</div>';

    fetch("/api/userinfo/notifications", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.message || "Failed to fetch notifications");
          });
        }
        return response.json();
      })
      .then((data) => {
        notifications = data;
        updateNotificationsList(data);
      })
      .catch((error) => {
        console.error("Error fetching notifications:", error);
        notificationList.innerHTML = `<div class="error" style="text-align: center; padding: 20px; color: red;">Error loading notifications: ${error.message}</div>`;
      });
  }

  // Function to update the notifications list
  function updateNotificationsList(notificationsData) {
    const notificationList = document.querySelector(".notification-list");
    notificationList.innerHTML = "";

    if (notificationsData.length === 0) {
      notificationList.innerHTML = `
        <div class="empty-state">
          <i class="bx bx-bell-off"></i>
          <p>No notifications to show</p>
        </div>
      `;
      return;
    }

    notificationsData.forEach((notification) => {
      // Determine notification type class
      let typeClass = "type-update";
      if (notification.type === "assignment") {
        typeClass = "type-assignment";
      } else if (notification.type === "reminder") {
        typeClass = "type-reminder";
      }

      // Determine icon based on type
      let icon = "bx-refresh";
      if (notification.type === "assignment") {
        icon = "bx-calendar-check";
      } else if (notification.type === "reminder") {
        icon = "bx-bell";
      }

      // Format time
      const notificationTime = formatTimeAgo(new Date(notification.createdAt));

      const notificationElement = document.createElement("div");
      notificationElement.className = `notification ${
        notification.read ? "" : "unread"
      }`;
      notificationElement.dataset.type = notification.type;
      notificationElement.dataset.id = notification.id;

      notificationElement.innerHTML = `
        <div class="notification-icon">
          <i class="bx ${icon}" style="font-size: 24px"></i>
        </div>
        <div class="notification-content">
          <div class="notification-title">
            ${notification.title}
            <span class="notification-type ${typeClass}">${
        notification.type.charAt(0).toUpperCase() + notification.type.slice(1)
      }</span>
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
      return "Just now";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
  }

  // Initialize by fetching notifications
  fetchNotifications();
});

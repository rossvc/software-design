const notifications = [
  {
    id: 1,
    type: "assignment",
    title: "New Event Assignment",
    message:
      'You have been assigned to "Beach Cleanup" event on February 20, 2025.',
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "update",
    title: "Event Update",
    message:
      'The location for "Senior Care Workshop" has been updated to "Main Community Center".',
    time: "5 hours ago",
    read: false,
  },
  {
    id: 3,
    type: "reminder",
    title: "Event Reminder",
    message:
      'Don\'t forget about your upcoming event "Teaching Workshop" tomorrow at 9 AM.',
    time: "1 day ago",
    read: true,
  },
];

// Validate notification data
const validateNotification = (notification) => {
  // Required fields validation
  const requiredFields = ["type", "title", "message"];
  for (const field of requiredFields) {
    if (!notification[field]) {
      throw new Error(`${field} is required`);
    }
  }

  // Field type validation
  if (typeof notification.type !== "string")
    throw new Error("Type must be a string");
  if (typeof notification.title !== "string")
    throw new Error("Title must be a string");
  if (typeof notification.message !== "string")
    throw new Error("Message must be a string");
  if (
    notification.read !== undefined &&
    typeof notification.read !== "boolean"
  ) {
    throw new Error("Read status must be a boolean");
  }

  // Field length validation
  if (notification.title.length < 3)
    throw new Error("Title must be at least 3 characters");
  if (notification.message.length < 10)
    throw new Error("Message must be at least 10 characters");

  // Type enum validation
  const validTypes = ["assignment", "update", "reminder"];
  if (!validTypes.includes(notification.type)) {
    throw new Error("Type must be assignment, update, or reminder");
  }
};

module.exports = {
  getAllNotifications: () => notifications,

  getNotificationById: (id) => notifications.find((n) => n.id === id),

  addNotification: (notification) => {
    validateNotification(notification);
    const newNotification = {
      id: notifications.length + 1,
      ...notification,
      read: notification.read || false,
      createdAt: new Date().toISOString(),
    };
    notifications.push(newNotification);
    return newNotification;
  },

  updateNotification: (id, updatedFields) => {
    const index = notifications.findIndex((n) => n.id === id);
    if (index === -1) return null;

    const updatedNotification = { ...notifications[index], ...updatedFields };
    validateNotification(updatedNotification);

    notifications[index] = updatedNotification;
    return notifications[index];
  },

  deleteNotification: (id) => {
    const index = notifications.findIndex((n) => n.id === id);
    if (index === -1) return null;
    return notifications.splice(index, 1)[0];
  },

  markAllAsRead: () => {
    notifications.forEach((n) => (n.read = true));
    return notifications;
  },

  validateNotification, // Export for testing
};

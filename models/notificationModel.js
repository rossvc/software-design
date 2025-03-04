
const notifications = [
    {
      id: 1,
      type: "assignment",
      title: "New Event Assignment",
      message: 'You have been assigned to "Beach Cleanup" event on February 20, 2025.',
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      type: "update",
      title: "Event Update",
      message: 'The location for "Senior Care Workshop" has been updated to "Main Community Center".',
      time: "5 hours ago",
      read: false,
    },
    {
      id: 3,
      type: "reminder",
      title: "Event Reminder",
      message: 'Don\'t forget about your upcoming event "Teaching Workshop" tomorrow at 9 AM.',
      time: "1 day ago",
      read: true,
    },
  ];
  
  module.exports = {
    
    getAllNotifications: () => notifications,
  
  
    getNotificationById: (id) => notifications.find((n) => n.id === id),
  
  
    addNotification: (notification) => {
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
      notifications[index] = { ...notifications[index], ...updatedFields };
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
  };
  
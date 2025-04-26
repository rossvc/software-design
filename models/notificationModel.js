const db = require("../utils/db");

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
  getAllNotifications: async () => {
    try {
      return await db.query(
        "SELECT * FROM Notifications ORDER BY created_at DESC"
      );
    } catch (error) {
      console.error("Error getting all notifications:", error);
      throw error;
    }
  },

  getNotificationsByUserId: async (userId) => {
    try {
      return await db.query(
        "SELECT * FROM Notifications WHERE user_id = ? AND status = 'unread' ORDER BY created_at DESC",
        [userId]
      );
    } catch (error) {
      console.error("Error getting notifications by user ID:", error);
      throw error;
    }
  },

  getNotificationById: async (id) => {
    try {
      const notifications = await db.query(
        "SELECT * FROM Notifications WHERE id = ?",
        [id]
      );
      return notifications.length ? notifications[0] : null;
    } catch (error) {
      console.error("Error getting notification by ID:", error);
      throw error;
    }
  },

  addNotification: async (notification) => {
    try {
      validateNotification(notification);

      const status = notification.read ? "read" : "unread";

      const result = await db.query(
        `INSERT INTO Notifications (user_id, title, message, type, status) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          notification.userId,
          notification.title,
          notification.message,
          notification.type,
          status,
        ]
      );

      return {
        id: result.insertId,
        ...notification,
        status,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error adding notification:", error);
      throw error;
    }
  },

  updateNotification: async (id, updatedFields) => {
    try {
      const notification = await module.exports.getNotificationById(id);
      if (!notification) return null;

      const updatedNotification = { ...notification, ...updatedFields };
      validateNotification(updatedNotification);

      const status = updatedNotification.read ? "read" : "unread";

      await db.query(
        `UPDATE Notifications 
         SET title = ?, message = ?, type = ?, status = ? 
         WHERE id = ?`,
        [
          updatedNotification.title,
          updatedNotification.message,
          updatedNotification.type,
          status,
          id,
        ]
      );

      return {
        ...updatedNotification,
        status,
      };
    } catch (error) {
      console.error("Error updating notification:", error);
      throw error;
    }
  },

  deleteNotification: async (id) => {
    try {
      const notification = await module.exports.getNotificationById(id);
      if (!notification) return null;

      await db.query("DELETE FROM Notifications WHERE id = ?", [id]);
      return notification;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },

  markNotificationAsRead: async (id) => {
    try {
      const notification = await module.exports.getNotificationById(id);
      if (!notification) return null;

      await db.query('UPDATE Notifications SET status = "read" WHERE id = ?', [
        id,
      ]);
      return notification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  markAllAsRead: async (userId) => {
    try {
      await db.query(
        "UPDATE Notifications SET status = 'read' WHERE user_id = ?",
        [userId]
      );
      return await module.exports.getNotificationsByUserId(userId);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },

  validateNotification, // Export for testing
};

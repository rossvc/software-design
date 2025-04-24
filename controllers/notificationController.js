const notificationsModel = require("../models/notificationModel");

const getAllNotifications = async (req, res) => {
  try {
    const { type } = req.query;
    let allNotifications = await notificationsModel.getAllNotifications();

    if (type) {
      allNotifications = allNotifications.filter(
        (n) => n.type.toLowerCase() === type.toLowerCase()
      );
    }

    res.status(200).json(allNotifications);
  } catch (error) {
    console.error("Error getting all notifications:", error);
    res.status(500).json({ message: error.message });
  }
};

const getUserNotifications = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.session.user.id;
    const { type } = req.query;

    let notifications = await notificationsModel.getNotificationsByUserId(
      userId
    );

    if (type) {
      notifications = notifications.filter(
        (n) => n.type.toLowerCase() === type.toLowerCase()
      );
    }

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error getting user notifications:", error);
    res.status(500).json({ message: error.message });
  }
};

const getNotification = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const notification = await notificationsModel.getNotificationById(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error("Error getting notification:", error);
    res.status(500).json({ message: error.message });
  }
};

const createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, read } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newNotification = await notificationsModel.addNotification({
      userId,
      type,
      title,
      message,
      read,
    });

    res.status(201).json({
      message: "Notification created successfully",
      notification: newNotification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateNotification = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updatedNotification = await notificationsModel.updateNotification(
      id,
      req.body
    );

    if (!updatedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({
      message: "Notification updated successfully",
      notification: updatedNotification,
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const deletedNotification = await notificationsModel.deleteNotification(id);

    if (!deletedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({
      message: "Notification deleted successfully",
      notification: deletedNotification,
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: error.message });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updatedNotification = await notificationsModel.markNotificationAsRead(id);

    if (!updatedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({
      message: "Notification marked as read successfully",
      notification: updatedNotification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.session.user.id;
    const updatedNotifications = await notificationsModel.markAllAsRead(userId);

    res.status(200).json({
      message: "All notifications marked as read",
      notifications: updatedNotifications,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllNotifications,
  getUserNotifications,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification,
  markNotificationAsRead,
  markAllAsRead,
};

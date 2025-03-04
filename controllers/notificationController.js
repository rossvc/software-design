

const notificationsModel = require("../models/notificationModel");

const getAllNotifications = (req, res) => {
  try {
    const { type } = req.query;
    let allNotifications = notificationsModel.getAllNotifications();
    if (type) {
      allNotifications = allNotifications.filter(
        (n) => n.type.toLowerCase() === type.toLowerCase()
      );
    }
    res.status(200).json(allNotifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNotification = (req, res) => {
  try {
    const id = Number(req.params.id);
    const notification = notificationsModel.getNotificationById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const createNotification = (req, res) => {
  try {
    const { type, title, message, time, read } = req.body;
    if (!type || !title || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const newNotification = notificationsModel.addNotification({
      type,
      title,
      message,
      time,
      read,
    });
    res.status(201).json({
      message: "Notification created successfully",
      notification: newNotification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateNotification = (req, res) => {
  try {
    const id = Number(req.params.id);
    const updatedNotification = notificationsModel.updateNotification(id, req.body);
    if (!updatedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json({
      message: "Notification updated successfully",
      notification: updatedNotification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteNotification = (req, res) => {
  try {
    const id = Number(req.params.id);
    const deletedNotification = notificationsModel.deleteNotification(id);
    if (!deletedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json({
      message: "Notification deleted successfully",
      notification: deletedNotification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAllAsRead = (req, res) => {
  try {
    const updatedNotifications = notificationsModel.markAllAsRead();
    res.status(200).json({
      message: "All notifications marked as read",
      notifications: updatedNotifications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllNotifications,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification,
  markAllAsRead,
};


const express = require("express");
const router = express.Router();
const notificationsController = require("../controllers/notificationController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Get all notifications - Requires authentication
router.get("/", isAuthenticated, notificationsController.getAllNotifications);

// Get a specific notification - Requires authentication
router.get("/:id", isAuthenticated, notificationsController.getNotification);

// Mark a notification as read - Requires authentication
router.put("/:id/read", isAuthenticated, notificationsController.markNotificationAsRead);

// Create a new notification - Admin only
router.post("/", isAuthenticated, isAdmin, notificationsController.createNotification);

// Update a notification - Admin only
router.put("/:id", isAuthenticated, isAdmin, notificationsController.updateNotification);

// Delete a notification - Admin only
router.delete("/:id", isAuthenticated, isAdmin, notificationsController.deleteNotification);

// Mark all notifications as read - Requires authentication
router.put("/mark-all-read", isAuthenticated, notificationsController.markAllAsRead);

module.exports = router;

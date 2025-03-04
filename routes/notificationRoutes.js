
const express = require("express");
const router = express.Router();
const notificationsController = require("../controllers/notificationController");

router.get("/", notificationsController.getAllNotifications);

router.get("/:id", notificationsController.getNotification);

router.post("/", notificationsController.createNotification);

router.put("/:id", notificationsController.updateNotification);

router.delete("/:id", notificationsController.deleteNotification);

router.put("/mark-all-read", notificationsController.markAllAsRead);

module.exports = router;

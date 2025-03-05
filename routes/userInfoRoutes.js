const express = require("express");
const router = express.Router();
const userInfoController = require("../controllers/userInfoController");

// Get user info
router.get("/", userInfoController.getUserInfo);

// Get user notifications
router.get("/notifications", userInfoController.getUserNotifications);

module.exports = router;

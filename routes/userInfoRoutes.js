const express = require("express");
const router = express.Router();
const userInfoController = require("../controllers/userInfoController");

// Get user profile - Requires authentication
router.get("/", userInfoController.getUserProfile);

// Update user profile - Requires authentication
router.put("/", userInfoController.updateUserProfile);

// Get user notifications - Requires authentication
router.get("/notifications", userInfoController.getUserNotifications);

module.exports = router;

const express = require("express");
const router = express.Router();
const userInfoController = require("../controllers/userInfoController");
const { isAuthenticated } = require("../middleware/auth");

// Get user profile - Requires authentication
router.get("/", isAuthenticated, userInfoController.getUserProfile);

// Update user profile - Requires authentication
router.put("/", userInfoController.updateUserProfile);

// Get user notifications - Requires authentication
router.get(
  "/notifications",
  isAuthenticated,
  userInfoController.getUserNotifications
);

module.exports = router;

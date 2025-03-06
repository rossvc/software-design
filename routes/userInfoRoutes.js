const express = require("express");
const router = express.Router();
const userInfoController = require("../controllers/userInfoController");
const { isAuthenticated } = require("../middleware/auth");

// Get user info - Requires authentication
router.get("/", isAuthenticated, userInfoController.getUserInfo);

// Get user notifications - Requires authentication
router.get(
  "/notifications",
  isAuthenticated,
  userInfoController.getUserNotifications
);

module.exports = router;

const express = require("express");
const router = express.Router();
const registrationController = require("../controllers/registrationController");
const signInController = require("../controllers/signInController");
const userInfoController = require("../controllers/userInfoController");
const { isAuthenticated } = require("../middleware/auth");

// Registration route
router.post("/register", registrationController.registerUser);

// Login route
router.post("/login", signInController.signIn);

// Logout route
router.post("/logout", signInController.signOut);

// Get user profile
router.get("/profile/:id", isAuthenticated, userInfoController.getUserProfile);

// Update user profile
router.put("/profile/:id", isAuthenticated, userInfoController.updateUserProfile);

// Get current user from session
router.get("/current", (req, res) => {
  if (req.session.user) {
    res.status(200).json({ user: req.session.user });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

module.exports = router;

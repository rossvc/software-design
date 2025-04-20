const express = require("express");
const router = express.Router();
const registrationController = require("../controllers/registrationController");
const { isAdmin } = require("../middleware/auth");

// Serve registration page data
router.get("/", registrationController.getRegistrationPageContent);

// Handle user registration
router.post("/", registrationController.registerUser);

// Handle admin account creation (protected by admin middleware)
router.post("/admin", registrationController.createAdminAccount);
// Serve the RegistrationForm.html file
router.get("/form", (req, res) => {
  res.sendFile("RegistrationForm.html", { root: "./public" });
});

module.exports = router;

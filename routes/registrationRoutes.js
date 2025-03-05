const express = require("express");
const router = express.Router();
const registrationController = require("../controllers/registrationController");

// Serve registration page data
router.get("/", registrationController.getRegistrationPageContent);

// Handle user registration
router.post("/", registrationController.registerUser);

module.exports = router;

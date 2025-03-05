const registrationModel = require("../models/registrationModel");

// Get registration page content
const getRegistrationPageContent = (req, res) => {
  try {
    const content = registrationModel.getRegistrationPageContent();
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Handle user registration
const registerUser = (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password required" });
    }

    // Register the user
    const newUser = registrationModel.registerUser(username, password);

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getRegistrationPageContent,
  registerUser,
};

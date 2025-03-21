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
const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password required" });
    }

    // Register the user
    const newUser = await registrationModel.registerUser(username, password);

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Registration controller error:", error);
    res.status(400).json({ message: error.message });
  }
};

// Handle admin account creation
const createAdminAccount = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user is authenticated and is an admin
    if (!req.session.user || req.session.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only administrators can create admin accounts" });
    }

    const creatorId = req.session.user.id;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Create admin account
    const newAdmin = await registrationModel.createAdminAccount(
      username,
      password,
      creatorId
    );

    res
      .status(201)
      .json({ message: "Admin account created successfully", user: newAdmin });
  } catch (error) {
    console.error("Admin creation controller error:", error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getRegistrationPageContent,
  registerUser,
  createAdminAccount,
};

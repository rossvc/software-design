const db = require("../utils/db");
const bcrypt = require("bcrypt");

// Get registration page content
const registrationPageContent = {
  title: "Register for Volunteer Center",
  description: "Create an account to start volunteering!",
};

// Validate user input
const validateUser = (username, password) => {
  // Required field validation
  if (!username) throw new Error("Username is required");
  if (!password) throw new Error("Password is required");

  // Field type validation
  if (typeof username !== "string")
    throw new Error("Username must be a string");
  if (typeof password !== "string")
    throw new Error("Password must be a string");

  // Field length validation
  if (username.length < 3)
    throw new Error("Username must be at least 3 characters");
  if (password.length < 6)
    throw new Error("Password must be at least 6 characters");
};

// Function to register a new user
const registerUser = async (username, password) => {
  try {
    // Validate input
    validateUser(username, password);

    // Check if user already exists
    const existingUsers = await db.query(
      "SELECT * FROM UserCredentials WHERE username = ?",
      [username]
    );
    if (existingUsers.length > 0) {
      throw new Error("Username already exists!");
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Add user to the database
    const result = await db.query(
      "INSERT INTO UserCredentials (username, password, role) VALUES (?, ?, ?)",
      [username, hashedPassword, "volunteer"]
    );

    return {
      id: result.insertId,
      username,
      role: "volunteer",
    };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Function to create an admin account
const createAdminAccount = async (username, password) => {
  try {
    // Validate input
    validateUser(username, password);

    // Check if user already exists
    const existingUsers = await db.query(
      "SELECT * FROM UserCredentials WHERE username = ?",
      [username]
    );
    if (existingUsers.length > 0) {
      throw new Error("Username already exists!");
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Add admin to the database
    const result = await db.query(
      "INSERT INTO UserCredentials (username, password, role) VALUES (?, ?, ?)",
      [username, hashedPassword, "admin"]
    );

    return {
      id: result.insertId,
      username,
      role: "admin",
    };
  } catch (error) {
    console.error("Admin creation error:", error);
    throw error;
  }
};

module.exports = {
  getRegistrationPageContent: () => registrationPageContent,
  registerUser,
  createAdminAccount,
  validateUser,
};

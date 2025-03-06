// Mock user database
const users = [];

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
const registerUser = (username, password) => {
  // Validate input
  validateUser(username, password);

  // Check if user already exists
  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    throw new Error("Username already exists!");
  }

  // Add user to the mock database
  const newUser = { id: users.length + 1, username, password };
  users.push(newUser);
  return newUser;
};

module.exports = {
  getRegistrationPageContent: () => registrationPageContent,
  registerUser,
  validateUser, // Exported for testing
};

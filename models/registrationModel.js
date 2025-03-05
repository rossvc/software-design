// Mock user database
const users = [];

// Get registration page content
const registrationPageContent = {
  title: "Register for Volunteer Center",
  description: "Create an account to start volunteering!",
};

// Function to register a new user
const registerUser = (username, password) => {
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
};

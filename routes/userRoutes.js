const express = require("express");
const router = express.Router();

// Placeholder routes for user management
router.post("/register", (req, res) => {
  // Validate required fields
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Create a new user (in a real app, this would be saved to a database)
  const userId = Date.now();
  const newUser = {
    id: userId,
    username,
    role: "volunteer", // Default role
  };

  // Store user in session
  req.session.user = newUser;

  // Return success message
  res.status(200).json({
    message: "Registration successful",
    user: newUser,
  });
});

router.post("/login", (req, res) => {
  // Simple hardcoded validation for demonstration
  const { username, password } = req.body;

  // Mock user credentials (in a real app, this would come from a database)
  const users = [
    { id: 1, username: "admin", password: "admin123", role: "admin" },
    { id: 2, username: "volunteer", password: "volunteer123", role: "volunteer" },
  ];

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    // Store user in session
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };
    
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } else {
    res.status(401).json({ message: "Invalid username or password" });
  }
});

router.get("/profile/:id", (req, res) => {
  const userId = req.params.id;

  // Just a mock profile for demonstration
  res.status(200).json({
    id: userId,
    username: "testuser",
    name: "Test User",
    email: "test@example.com",
    location: "Houston",
    skills: ["Teaching", "First Aid"],
    availability: ["Weekends", "Evenings"],
  });
});

router.put("/profile/:id", (req, res) => {
  const userId = req.params.id;
  const profileData = req.body;

  // Validate the data
  if (!profileData.name || !profileData.email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  // In a real app, you would update the database
  res.status(200).json({
    message: "Profile updated successfully",
    profile: {
      id: userId,
      ...profileData,
    },
  });
});

// Logout route
router.post("/logout", (req, res) => {
  // Clear the session
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to logout" });
    }
    
    res.status(200).json({ message: "Logout successful" });
  });
});

// Get current user from session
router.get("/current", (req, res) => {
  if (req.session.user) {
    res.status(200).json({ user: req.session.user });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

module.exports = router;

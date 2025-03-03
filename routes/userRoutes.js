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

  // For now, just return a success message (no actual database storage)
  res.status(200).json({
    message: "Registration successful",
    user: {
      id: Date.now(),
      username,
    },
  });
});

router.post("/login", (req, res) => {
  // Simple hardcoded validation for demonstration
  const { username, password } = req.body;

  // Mock user credentials (in a real app, this would come from a database)
  const users = [
    { username: "admin", password: "admin123", role: "admin" },
    { username: "volunteer", password: "volunteer123", role: "volunteer" },
  ];

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    res.status(200).json({
      message: "Login successful",
      user: {
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

module.exports = router;

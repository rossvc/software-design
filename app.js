const express = require("express");
const path = require("path");
const session = require("express-session");
const db = require("./utils/db");
const app = express();
const PORT = process.env.PORT || 3000;

// Test database connection
(async () => {
  try {
    await db.query("SELECT 1");
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
})();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "views")));

// Session middleware
app.use(
  session({
    secret: "volunteer-center-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Import routes
try {
  console.log("Importing routes...");
  const userRoutes = require("./routes/userRoutes");
  const eventRoutes = require("./routes/eventRoutes");
  const volunteerMatchingRoutes = require("./routes/volunteerMatchingRoutes");
  const volunteerHistoryRoutes = require("./routes/volunteerHistoryRoutes");
  const notificationRoutes = require("./routes/notificationRoutes");
  const createEventRoutes = require("./routes/createEventRoutes");
  const registrationRoutes = require("./routes/registrationRoutes");
  const homePageRoutes = require("./routes/HomePageRoutes");
  const userInfoRoutes = require("./routes/userInfoRoutes");
  const signInRoutes = require("./routes/signInRoutes");
  const reportRoutes = require("./routes/reportRoutes");
  console.log("Routes imported successfully");

  // Use routes
  app.use("/api/users", userRoutes);
  app.use("/api/events", eventRoutes);
  app.use("/api/matching", volunteerMatchingRoutes);
  app.use("/api/history", volunteerHistoryRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/createevents", createEventRoutes);
  app.use("/api/registration", registrationRoutes);
  app.use("/api/homepage", homePageRoutes);
  app.use("/api/userinfo", userInfoRoutes);
  app.use("/api/reports", reportRoutes);
  app.use("/api/signin", signInRoutes);
  console.log("Routes set up successfully");
} catch (error) {
  console.error("Error setting up routes:", error);
  process.exit(1);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error in middleware:", err);
  res.status(500).send("Something went wrong!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await db.pool.end();
    console.log("Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Error closing database connection:", error);
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

// Serve the frontend - Always return the main page for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "Homepage.html"));
});

module.exports = app; // For testing purposes

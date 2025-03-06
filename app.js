const express = require("express");
const path = require("path");
const session = require("express-session");
const app = express();
const PORT = process.env.PORT || 3000;

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
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const volunteerMatchingRoutes = require("./routes/volunteerMatchingRoutes");
const volunteerHistoryRoutes = require("./routes/volunteerHistoryRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const createEventRoutes = require("./routes/createEventRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const homePageRoutes = require("./routes/HomePageRoutes");
const userInfoRoutes = require("./routes/userInfoRoutes");
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


// Serve the frontend - Always return the main page for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "Homepage.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing purposes

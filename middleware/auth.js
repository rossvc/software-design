/**
 * Authentication middleware
 */

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    // User is authenticated
    next();
  } else {
    // User is not authenticated
    res.status(401).json({ message: "Authentication required" });
  }
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === "admin") {
    // User is an admin
    next();
  } else {
    // User is not an admin
    res.status(403).json({ message: "Admin access required" });
  }
};

// Middleware to check if user is a volunteer
const isVolunteer = (req, res, next) => {
  if (req.session.user && req.session.user.role === "volunteer") {
    // User is a volunteer
    next();
  } else {
    // User is not a volunteer
    res.status(403).json({ message: "Volunteer access required" });
  }
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isVolunteer,
};

const userInfoModel = require("../models/userInfoModel");
const notificationModel = require("../models/notificationModel");

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.session.user.id; // ✅ FIXED: Get user ID from session

    const userProfile = await userInfoModel.getUserProfile(userId);

    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    res.status(200).json(userProfile);
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    let userId;
    let profileData;

    // Check if this is a registration flow (userId in request body) or a profile update (userId in session)
    if (req.body.userId) {
      // Registration flow - userId is in the request body
      userId = req.body.userId;
      profileData = req.body.profileData || req.body;
    } else if (req.session && req.session.user && req.session.user.id) {
      // Regular profile update - userId is in the session
      userId = req.session.user.id;
      profileData = req.body;
    } else {
      return res.status(400).json({ message: "User ID not provided" });
    }
    
    // Ensure availability is properly formatted as an array of dates
    if (profileData.availability) {
      // If availability is provided as a string, convert it to an array
      if (typeof profileData.availability === 'string') {
        try {
          profileData.availability = JSON.parse(profileData.availability);
        } catch (e) {
          // If parsing fails, treat it as a single date string
          profileData.availability = [profileData.availability];
        }
      }
      
      // Ensure availability is an array
      if (!Array.isArray(profileData.availability)) {
        profileData.availability = [profileData.availability];
      }
      
      // Validate that all dates are in a valid format
      profileData.availability = profileData.availability.filter(date => {
        return date && !isNaN(new Date(date).getTime());
      });
    } else {
      // Default to empty array if no availability provided
      profileData.availability = [];
    }

    const updatedProfile = await userInfoModel.updateUserProfile(
      userId,
      profileData
    );
    res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(400).json({ message: error.message });
  }
};

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.session.user.id;

    const notifications = await notificationModel.getNotificationsByUserId(
      userId
    );
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error getting user notifications:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserNotifications,
};

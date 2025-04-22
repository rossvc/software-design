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
    const userId = req.body.userId;
    const profileData = req.body.profileData;

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


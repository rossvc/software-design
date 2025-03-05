const userInfoModel = require("../models/userInfoModel");

// Get user info
const getUserInfo = (req, res) => {
  try {
    const userInfo = userInfoModel.getUserInfo();
    res.status(200).json(userInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user notifications
const getUserNotifications = (req, res) => {
  try {
    const notifications = userInfoModel.getUserNotifications();
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserInfo,
  getUserNotifications,
};

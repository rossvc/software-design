const homepageModel = require("../models/HomePageModel");

// Get homepage content
const getHomepageContent = (req, res) => {
  try {
    const content = homepageModel.getHomepageContent();
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getHomepageContent };

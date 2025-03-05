const express = require("express");
const router = express.Router();
const homepageController = require("../controllers/HomePageController");

// Serve homepage content
router.get("/", homepageController.getHomepageContent);

module.exports = router;

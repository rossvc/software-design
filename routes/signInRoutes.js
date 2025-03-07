const express = require("express");
const userController = require("../controllers/signInController");

const router = express.Router();

// Handle user sign in
router.post("/signin", userController.signIn);

// Handle user sign out
router.post("/signout", userController.signOut);

module.exports = router;

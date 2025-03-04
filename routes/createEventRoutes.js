const express = require("express");
const router = express.Router();
const eventController = require("../controllers/CreateEventController");

router.get("/", eventController.getAllEvents);

router.get("/:id", eventController.getEvent);

router.post("/", eventController.addEvent);

router.patch("/:id", eventController.updateEvent);

router.delete("/:id", eventController.deleteEvent);

module.exports = router;

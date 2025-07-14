const express = require("express");
const { createEvent, getEvents } = require("../controllers/eventController");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.post("/", requireAuth, createEvent);
router.get("/", getEvents); // New route

module.exports = router;

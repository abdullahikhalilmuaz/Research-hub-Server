const Event = require("../models/eventModel");

// GET all events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

// POST create event
const createEvent = async (req, res) => {
  console.log("Request Body:", req.body);
  const { title, description, location, date, time } = req.body;
  const { name } = req.institution;

  if (!title || !description || !location || !date || !time) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newEvent = await Event.create({
      title,
      description,
      host: name,
      location,
      date,
      time,
      createdBy: name,
    });

    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
};

module.exports = { createEvent, getEvents };

const express = require("express");
const {
  submitJournal,
  getInstitutionJournals,
  getAllJournals,
} = require("../controllers/newJournalController.js");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/journals"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Public route for journal submission
router.post("/submit", submitJournal);

// Public route to get institution journals (no auth required)
router.get("/institution/:institutionId", getInstitutionJournals);

// Public route to get all journals (no auth required)
router.get("/all", getAllJournals);

// Route for uploading journal files
router.post("/upload-journal", upload.single("journal"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const fileUrl = `/uploads/journals/${req.file.filename}`;

    res.status(201).json({
      success: true,
      fileUrl: fileUrl,
    });
  } catch (error) {
    console.error("Error uploading journal:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;

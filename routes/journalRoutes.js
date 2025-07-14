const express = require("express");
const router = express.Router();
const {
  getCollegeJournals,
  compileJournals,
  serveJournalFile,
} = require("../controllers/journalController");

// Get all journals for an institution
router.get("/institution/:institutionId", getCollegeJournals);

// Compile journals for an institution
router.post("/institution/:institutionId/compile", compileJournals);

// Serve journal files - this handles the file serving
router.get("/uploads/journals/:fileName", serveJournalFile);

module.exports = router;

const NewJournal = require("../models/newJournalModel.js");
const Institution = require("../models/institutionModel.js");

// Submit new journal with institution ID verification
const submitJournal = async (req, res) => {
  try {
    const { institution, ...journalData } = req.body;

    // Log the incoming data for debugging
    console.log("Received journal data:", {
      institution,
      ...journalData,
    });

    // Check if institution ID is provided
    if (!institution) {
      return res.status(400).json({
        success: false,
        message: "Institution ID is required",
      });
    }

    // Verify institution exists
    const institutionDoc = await Institution.findById(institution);
    if (!institutionDoc) {
      return res.status(400).json({
        success: false,
        message: "Invalid institution ID",
      });
    }

    // Create new journal
    const newJournal = await NewJournal.create({
      ...journalData,
      institution: institutionDoc._id,
    });

    res.status(201).json({
      success: true,
      message: "Journal submitted successfully",
      data: newJournal,
    });
  } catch (error) {
    console.error("Error submitting journal:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error, failed to create journal",
      error: error.message,
    });
  }
};

// Get all journals for an institution
const getInstitutionJournals = async (req, res) => {
  try {
    const { institutionId } = req.params;

    const journals = await NewJournal.find({ institution: institutionId }).sort(
      { createdAt: -1 }
    );

    res.status(200).json({
      success: true,
      data: journals,
    });
  } catch (error) {
    console.error("Error fetching journals:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error, Failed to get institution journal",
      error: error.message,
    });
  }
};

// Get all journals (no authentication required)
const getAllJournals = async (req, res) => {
  try {
    const journals = await NewJournal.find()
      .populate("institution", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: journals,
    });
  } catch (error) {
    console.error("Error fetching all journals:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  submitJournal,
  getInstitutionJournals,
  getAllJournals,
};

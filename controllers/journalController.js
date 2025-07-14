const Journal = require("../models/journalModel");
const path = require("path");
const fs = require("fs");

// Get all journals for college
exports.getCollegeJournals = async (req, res) => {
  try {
    const journals = await Journal.find({
      institution: req.params.institutionId,
    }).lean();
    
    const processedJournals = journals.map((journal) => {
      if (!journal.fileUrl) return journal;
      
      // Ensure the fileUrl is properly formatted
      const fileName = path.basename(journal.fileUrl);
      return {
        ...journal,
        fileUrl: `/api/journals/uploads/journals/${fileName}`,
      };
    });
    
    res.json({ success: true, data: processedJournals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Simple journal compilation
exports.compileJournals = async (req, res) => {
  try {
    const journals = await Journal.find({
      institution: req.params.institutionId,
      isCompiled: false,
    });
    
    if (journals.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No journals to compile",
      });
    }
    
    // Fixed: _id instead of *id
    await Journal.updateMany(
      { _id: { $in: journals.map((j) => j._id) } },
      { isCompiled: true }
    );
    
    res.json({
      success: true,
      message: `${journals.length} journals compiled`,
      data: journals,
    });
  } catch (error) {
    console.error("Error compiling journals:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Add this new function to serve journal files
exports.serveJournalFile = async (req, res) => {
  try {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, "../uploads/journals", fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "File not found"
      });
    }
    
    // Set appropriate headers for PDF files
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    
    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error("Error serving file:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
const Institution = require("../models/institutionModel");
const { generatePasskey } = require("../utils/passkeyGenerator");

// Get institution profile
exports.getInstitutionProfile = async (req, res) => {
  try {
    const institutionId = req.query.institutionId;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: "Institution ID is required",
      });
    }

    const institution = await Institution.findById(institutionId)
      .select("-password -pendingPayments")
      .populate("journals", "title status");

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: "Institution not found",
      });
    }

    res.status(200).json({
      success: true,
      data: institution,
    });
  } catch (error) {
    console.error("Error fetching institution profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update institution profile
exports.updateInstitutionProfile = async (req, res) => {
  try {
    const { institutionId, ...updates } = req.body;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: "Institution ID is required",
      });
    }

    const allowedUpdates = [
      "name",
      "bio",
      "website",
      "contactEmail",
      "description",
      "logo",
    ];
    const isValidOperation = Object.keys(updates).every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({
        success: false,
        message: "Invalid updates!",
      });
    }

    const institution = await Institution.findByIdAndUpdate(
      institutionId,
      updates,
      { new: true, runValidators: true }
    )
      .select("-password -pendingPayments")
      .populate("journals", "title status");

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: "Institution not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: institution,
    });
  } catch (error) {
    console.error("Error updating institution profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Regenerate passkey
exports.regeneratePasskey = async (req, res) => {
  try {
    const { institutionId } = req.body;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: "Institution ID is required",
      });
    }

    const newPasskey = generatePasskey();

    const institution = await Institution.findByIdAndUpdate(
      institutionId,
      { passkey: newPasskey },
      { new: true }
    ).select("passkey");

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: "Institution not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Passkey regenerated successfully",
      data: institution,
    });
  } catch (error) {
    console.error("Error regenerating passkey:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

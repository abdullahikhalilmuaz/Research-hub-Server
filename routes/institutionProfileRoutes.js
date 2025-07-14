const express = require("express");
const router = express.Router();
const {
  getInstitutionProfile,
  updateInstitutionProfile,
  regeneratePasskey,
} = require("../controllers/institutionProfileController");

// NO auth middleware anymore

// Get institution profile by ID (send ?institutionId=...)
router.get("/", getInstitutionProfile);

// Update institution profile by ID (send { institutionId, ...updates } in body)
router.patch("/", updateInstitutionProfile);

// Regenerate passkey by ID (send { institutionId } in body)
router.post("/regenerate-passkey", regeneratePasskey);

module.exports = router;

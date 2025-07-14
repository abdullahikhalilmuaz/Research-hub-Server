const express = require("express");
const crypto = require("crypto");

const {
  signupInstitution,
  loginInstitution,
  getInstitutionDetails,
  updateInstitutionProfile,
} = require("../controllers/institutionController");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// Login route
router.post("/login", loginInstitution);

// Signup route
router.post("/signup", signupInstitution);

// Protected routes
router.use(requireAuth);

// Fetch institution details
router.get("/details", getInstitutionDetails);

// Update profile
router.patch("/update", updateInstitutionProfile);

// Get all institutions

router.get("/all", requireAuth, async (req, res) => {
  try {
    const institutions = await Institution.find().select("-password");
    res.status(200).json(institutions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

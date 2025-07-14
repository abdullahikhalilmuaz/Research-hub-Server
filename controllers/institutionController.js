const Institution = require("../models/institutionModel");
const jwt = require("jsonwebtoken");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

// Login institution
const loginInstitution = async (req, res) => {
  const { email, password } = req.body;

  try {
    const institution = await Institution.login(email, password);
    const token = createToken(institution._id);

    res.status(200).json({
      _id: institution._id,
      name: institution.name,
      email: institution.email,
      bio: institution.bio,
      logo: institution.logo,
      website: institution.website,
      contactEmail: institution.contactEmail,
      description: institution.description,
      passkey: institution.passkey,
      pendingPayments: institution.pendingPayments,
      journals: institution.journals,
      token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Signup institution
const signupInstitution = async (req, res) => {
  const {
    name,
    email,
    password,
    accreditationNumber,
    bio,
    website,
    contactEmail,
    description,
  } = req.body;

  try {
    const institution = await Institution.signup(
      name,
      email,
      password,
      accreditationNumber,
      bio,
      website,
      contactEmail,
      description
    );
    const token = createToken(institution._id);

    res.status(200).json({
      _id: institution._id,
      name: institution.name,
      email: institution.email,
      bio: institution.bio,
      website: institution.website,
      contactEmail: institution.contactEmail,
      description: institution.description,
      passkey: institution.passkey,
      token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getInstitutionDetails = async (req, res) => {
  try {
    const institution = await Institution.findById(req.institution._id)
      .select("-password")
      .populate("journals", "title issn");

    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    res.status(200).json(institution);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch institution details" });
  }
};

const updateInstitutionProfile = async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = [
      "name",
      "bio",
      "logo",
      "website",
      "contactEmail",
      "description",
    ];

    // Filter only allowed updates
    const filteredUpdates = Object.keys(updates).reduce((acc, key) => {
      if (allowedUpdates.includes(key)) {
        acc[key] = updates[key];
      }
      return acc;
    }, {});

    const institution = await Institution.findByIdAndUpdate(
      req.institution._id,
      filteredUpdates,
      { new: true }
    ).select("-password");

    res.status(200).json(institution);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  signupInstitution,
  loginInstitution,
  getInstitutionDetails,
  updateInstitutionProfile,
};

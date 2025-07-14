const jwt = require("jsonwebtoken");
const Institution = require("../models/institutionModel");

const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new Error("Authorization token required");
    }

    const { _id } = jwt.verify(token, process.env.SECRET);

    // Find institution and populate journals
    const institution = await Institution.findById(_id)
      .select("-password -pendingPayments")
      .populate("journals", "title status");

    if (!institution) {
      throw new Error("Institution not found");
    }

    req.institution = institution;
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

module.exports = requireAuth;

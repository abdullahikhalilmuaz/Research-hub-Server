import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Institution from "../models/institutionModel";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/logos/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "logo-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Middleware to parse form-data and JSON properly
const parseFormData = (req, res, next) => {
  if (req.headers["content-type"]?.startsWith("multipart/form-data")) {
    upload.single("logo")(req, res, (err) => {
      if (err)
        return res.status(400).json({ success: false, message: err.message });

      // Manually parse other form fields
      req.body = {
        ...req.body,
        institutionId: req.body.institutionId,
        name: req.body.name,
        description: req.body.description,
        bio: req.body.bio,
        website: req.body.website,
        contactEmail: req.body.contactEmail,
      };
      next();
    });
  } else {
    express.json()(req, res, next);
  }
};

// Update institution profile
router.patch("/", parseFormData, async (req, res) => {
  try {
    const { institutionId, ...updateData } = req.body;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: "Institution ID is required",
      });
    }

    // Handle file upload if present
    if (req.file) {
      updateData.logo = req.file.path;

      // Delete old logo if exists
      const institution = await Institution.findById(institutionId);
      if (institution?.logo && fs.existsSync(institution.logo)) {
        fs.unlinkSync(institution.logo);
      }
    }

    const updatedInstitution = await Institution.findByIdAndUpdate(
      institutionId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password -__v");

    if (!updatedInstitution) {
      return res.status(404).json({
        success: false,
        message: "Institution not found",
      });
    }

    // Convert logo path to URL if exists
    if (updatedInstitution.logo) {
      updatedInstitution.logo = `${req.protocol}://${req.get("host")}/${
        updatedInstitution.logo
      }`;
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedInstitution,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Regenerate passkey
router.post("/regenerate-passkey", express.json(), async (req, res) => {
  try {
    const { institutionId } = req.body;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: "Institution ID is required",
      });
    }

    // Generate a random 8-character alphanumeric passkey
    const newPasskey = Array(8)
      .fill(0)
      .map(() => Math.random().toString(36).charAt(2))
      .join("")
      .toUpperCase();

    const updatedInstitution = await Institution.findByIdAndUpdate(
      institutionId,
      { passkey: newPasskey },
      { new: true }
    ).select("-password -__v");

    if (!updatedInstitution) {
      return res.status(404).json({
        success: false,
        message: "Institution not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Passkey regenerated successfully",
      data: updatedInstitution,
    });
  } catch (error) {
    console.error("Passkey regeneration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

export default router;

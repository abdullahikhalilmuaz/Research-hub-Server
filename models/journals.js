const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const journalSchema = new Schema(
  {
    // Core Identification
    title: {
      type: String,
      required: [true, "Journal title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
    },

    // Content
    abstract: {
      type: String,
      trim: true,
      maxlength: [2000, "Abstract cannot exceed 2000 characters"],
    },
    fileUrl: {
      type: String,
      required: [true, "File URL is required"],
    },

    // Institutional Reference
    institution: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: [true, "Institution reference is required"],
      index: true,
    },
    institutionName: {
      type: String,
      required: [true, "Institution name is required"],
    },

    // Metadata
    category: {
      type: String,
      enum: ["research", "review", "case-study", "technical", "other"],
      default: "research",
    },
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
    publicationFrequency: {
      type: String,
      enum: ["monthly", "quarterly", "biannual", "annual", "irregular"],
      default: "annual",
    },

    // Status Management (default approved)
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
      index: true,
    },
    approvalDate: {
      type: Date,
      default: Date.now,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    reviewerComments: {
      type: String,
      trim: true,
    },

    // Compilation Info (for compiled journals)
    isCompiled: {
      type: Boolean,
      default: false,
      index: true,
    },
    compilationDetails: {
      title: String,
      description: String,
      year: Number,
      volume: {
        type: Number,
        min: 1,
      },
      issue: {
        type: Number,
        min: 1,
      },
      editors: [String],
      coverImage: String,
    },
    compiledFileUrl: String,

    // Relationships
    compiledJournal: {
      type: Schema.Types.ObjectId,
      ref: "Journal",
    },
    constituentJournals: [
      {
        type: Schema.Types.ObjectId,
        ref: "Journal",
      },
    ],

    // Statistics
    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Enable virtuals to be included in JSON output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Automatic timestamp update
journalSchema.pre("save", function (next) {
  this.updatedAt = Date.now();

  // Auto-set approval date when status changes to approved
  if (this.isModified("status") && this.status === "approved") {
    this.approvalDate = this.approvalDate || new Date();
  }

  // Auto-set review date when status changes to rejected
  if (this.isModified("status") && this.status === "rejected") {
    this.reviewDate = this.reviewDate || new Date();
  }

  next();
});

// Virtual for whether journal is publishable
journalSchema.virtual("isPublishable").get(function () {
  return this.status === "approved" && !!this.fileUrl;
});

// Indexes for optimized queries
journalSchema.index({ title: "text", abstract: "text" }); // Full-text search
journalSchema.index({ institution: 1, status: 1 });
journalSchema.index({
  "compilationDetails.year": -1,
  "compilationDetails.volume": -1,
});

// Prevent overwriting model if already exists
const Journal =
  mongoose.models.Journal || mongoose.model("Journal", journalSchema);
module.exports = Journal;

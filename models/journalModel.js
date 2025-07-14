const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const journalSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: String },
    institution: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    institutionName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    isCompiled: { type: Boolean, default: false },
    compiledJournal: { type: Schema.Types.ObjectId, ref: "Journal" },
    compiledDetails: {
      description: { type: String },
      volume: { type: Number, default: 1 },
      issue: { type: Number, default: 1 },
    },
    constituentJournals: [{ type: Schema.Types.ObjectId, ref: "Journal" }],
  },
  { timestamps: true }
);

journalSchema.index({ institution: 1 });
journalSchema.index({ isCompiled: 1 });

module.exports = mongoose.model("Journal", journalSchema);

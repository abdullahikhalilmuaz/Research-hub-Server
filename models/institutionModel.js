const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const validator = require("validator");

const Schema = mongoose.Schema;

const institutionSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  accreditationNumber: { type: String, required: true, unique: true },
  bio: { type: String, default: "" },
  logo: { type: String, default: "" },
  website: { type: String, default: "" },
  contactEmail: { type: String, default: "" },
  passkey: {
    type: String,
    unique: true,
  },
  description: { type: String, default: "" },
  pendingPayments: [
    {
      amount: { type: Number, default: 0 },
      dueDate: { type: Date },
      isPaid: { type: Boolean, default: false },
      description: { type: String, default: "Journal hosting fee" },
    },
  ],
  journals: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Static sign-up method
institutionSchema.statics.signup = async function (
  name,
  email,
  password,
  accreditationNumber,
  bio = "",
  website = "",
  contactEmail = "",
  description = ""
) {
  if (!name || !email || !password || !accreditationNumber) {
    throw Error("All required fields must be filled");
  }

  if (!validator.isEmail(email)) {
    throw Error("Email is not valid");
  }

  if (!validator.isStrongPassword(password)) {
    throw Error("Password is not strong enough");
  }

  const emailExists = await this.findOne({ email });
  if (emailExists) {
    throw Error("Email already in use");
  }

  const accreditationExists = await this.findOne({ accreditationNumber });
  if (accreditationExists) {
    throw Error("Accreditation number already in use");
  }

  const salt = await bcryptjs.genSalt(10);
  const hash = await bcryptjs.hash(password, salt);

  // Generate initial passkey
  const passkey = Array(8)
    .fill(0)
    .map(() => Math.random().toString(36).charAt(2))
    .join("")
    .toUpperCase();

  const institution = await this.create({
    name,
    email,
    password: hash,
    accreditationNumber,
    bio,
    website,
    contactEmail,
    description,
    passkey
  });

  return institution;
};

// Static login method
institutionSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("All fields must be filled");
  }

  const institution = await this.findOne({ email });
  if (!institution) {
    throw Error("Incorrect email");
  }

  const match = await bcryptjs.compare(password, institution.password);
  if (!match) {
    throw Error("Incorrect password");
  }

  return institution;
};

module.exports = mongoose.model("Institution", institutionSchema);
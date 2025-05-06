// models/User.js
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  websiteURL: { type: String, required: true },
  email: { type: String, unique: true },
  passwordHash: { type: String, required: true }, // Argon2id hash
  vault: { type: String }, // base64 or hex string for the vault
  salt: { type: String },
});

module.exports = mongoose.model("users", userSchema);

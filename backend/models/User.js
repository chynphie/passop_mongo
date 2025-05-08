// models/User.js
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  websiteURL: { type: String, required: true },
  email: { type: String, unique: true },
  passwordHash: { type: String, required: true }, // Argon2id hash
  encryptedVault: { type: String }, // base64 or hex string for the vault
  salt: { type: String },
  iv: { type: String }, // Initialization Vector for encryption
});

module.exports = mongoose.model("users", userSchema);

// models/VaultEntry.js
const mongoose = require("mongoose");

const VaultEntrySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  encryptedVault: {
    // your AES-GCM ciphertext + metadata for a single entry
    type: String,
    required: true,
  },
  iv: {
    type: String, // Base64 IV
    required: true,
  },
  keyHex: {
    type: String, // Hexadecimal representation of the key
    required: true,
  },
  // (Optional) If you ever want per‐entry salts for re-keying:
  salt: {
    type: String,
  },
  websiteURL: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("VaultEntry", VaultEntrySchema);

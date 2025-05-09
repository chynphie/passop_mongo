// controllers/vaultController.js
const User = require("../models/User"); // or your Mongoose User model
const VaultEntry = require("../models/VaultEntry");

/**
 * POST /api/vault
 * Body: {
 *   encryptedVault: string,   // Base64 AES-GCM ciphertext of the entire vault
 *   iv:             string,   // Base64 IV used for that encryption
 *   vaultSalt?:     string    // (optional) if you ever rotate the KDF salt
 * }
 *
 * Assumes you have an authentication middleware that sets `req.userId`.
 */
exports.saveVault = async (req, res) => {
  const { userId, websiteURL, encryptedVault, iv, salt, keyHex } = req.body;
  console.log("Save vault request body:", req.body);
  try {
    const entry = new VaultEntry({ userId, encryptedVault, iv, salt, keyHex, websiteURL });
    console.log("Saving vault entry:", entry);

    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save vault entry" });
  }
};

exports.updateVault = async (req, res) => {
  const { userId, encryptedVault, iv, salt } = req.body;
  try {
    const entry = new VaultEntry({ userId, encryptedVault, iv, salt });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save vault entry" });
  }
};

exports.getEntries = async (req, res) => {
  const { userId } = req.params;
  try {
    const list = await VaultEntry.find({ userId }).sort("createdAt");
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch vault entries" });
  }
};

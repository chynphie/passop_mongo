// controllers/authController.js
const User = require("../models/User"); // Assuming you have a User model
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
const argon2 = require('argon2');

// Function to register a new user
exports.register = async (req, res) => {
  const { websiteURL, email, password, encryptedVault, salt } = req.body;

  try {
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 4,
      parallelism: 2
    });

    const user = new User({
      websiteURL,
      email,
      passwordHash,
      vault: encryptedVault,
      salt // This is the salt used for vault encryption (not password hashing)
    });
    console.log('the created user is----',user);
    
    await user.save();
    res.status(201).json({ message: 'User registered' });

  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
};

// Function to login user
exports.login = async (req, res) => {
  const {websiteURL, email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const passwordMatches = await argon2.verify(user.passwordHash, password);
    if (!passwordMatches) return res.status(401).json({ error: 'Invalid credentials' });

    // Auth success: send back vault + salt so client can decrypt
    res.json({
      vault: user.vault,
      salt: user.salt // Needed on client to derive vault decryption key
    });

  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }

};

// Function to logout user
exports.logout = (req, res) => {
  // In a real-world scenario you might handle token invalidation or session management
  res.status(200).json({ message: "Logged out successfully" });
};

// Function to get user profile
exports.profile = async (req, res) => {
  try {
    const userId = req.userId; // Assuming you have middleware that extracts userId from the token
    const user = await User.findById(userId).select("-password"); // Exclude password from response
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch profile", error: error.message });
  }
};

// Function to get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
};

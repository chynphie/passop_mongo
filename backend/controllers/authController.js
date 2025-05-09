// controllers/authController.js
const User = require("../models/User"); // Assuming you have a User model
const argon2 = require("argon2");
const crypto = require("crypto");

const { deriveKey, decryptVault } = require("../services/cryptoService");

// Function to register a new user
exports.register = async (req, res) => {
  const { email, masterPassword, encryptedVault, salt, iv } = req.body;
  try {
    // 1) Generate random salt for hashing
    const passwordSalt = crypto.randomBytes(16).toString("base64");
    console.log("Password salt:", passwordSalt);

    // 2) Hash the *master password* with Argon2id + salt
    const passwordHash = await argon2.hash(masterPassword, {
      type: argon2.argon2id,
      salt: Buffer.from(passwordSalt, "base64"),
      memoryCost: 2 ** 16,
      timeCost: 4,
      parallelism: 1,
    });

    // 3) Create user record
    const userId = crypto.randomUUID(); // Generate a unique user ID
    const user = new User({
      userId,
      email,
      passwordHash,
      passwordSalt,
      encryptedVault,
      salt,
      iv,
    });
    console.log("User to be saved:", user);
    await user.save();
    res.status(201).json({ message: "User registered." });
  } catch (err) {
    console.error("Registration error:", err);
    res
      .status(500)
      .json({ error: "Registration failed", details: err.message });
  }
};

// Function to login user
exports.login = async (req, res) => {
  console.log("Login request body:", req.body);

  const { email, masterPassword } = req.body;
  console.log(
    "Login attempt for:",
    email,
    "on",
    masterPassword
  );

  try {
    // 1) Look up user
    const user = await User.findOne({ email });
    console.log("User found:", user);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    console.log("user passwordhash is", user.passwordHash);

    // 2) Verify the master password
    const valid = await argon2.verify(user.passwordHash, masterPassword, {
      type: argon2.argon2id,
    });
    console.log("Password verification result:", valid);

    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 3) Authentication succeeded — return vault info
    res.json({
      userId: user.userId,
      encryptedVault: user.encryptedVault, // your AES-GCM blob (Base64)
      salt: user.salt,
      iv: user.iv,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed", details: err.message });
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
exports.getPasswordByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ userId })
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch user password", error: error.message });
  }
};

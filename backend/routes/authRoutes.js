// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
// const authMiddleware = require('../middleware/authMiddleware'); // Import the middleware

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/users', authController.getAllUsers);
// router.get('/profile', authMiddleware, authController.profile); // Use middleware to protect route

module.exports = router;
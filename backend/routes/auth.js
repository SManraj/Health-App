const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyFirebaseToken } = require('../middleware/auth');

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Verify token
router.get('/verify', verifyFirebaseToken, authController.verifyToken);

// Refresh token
router.post('/refresh', authController.refreshToken);

// Logout
router.post('/logout', verifyFirebaseToken, authController.logout);

module.exports = router;

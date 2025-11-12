const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyFirebaseToken } = require('../middleware/auth');

// All user routes require authentication
router.use(verifyFirebaseToken);

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put('/profile', userController.updateProfile);

// Get user goals
router.get('/goals', userController.getGoals);

// Set user goals
router.post('/goals', userController.setGoals);

// Update user goals
router.put('/goals/:goalId', userController.updateGoals);

// Delete user account
router.delete('/account', userController.deleteAccount);

module.exports = router;

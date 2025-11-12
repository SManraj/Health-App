const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyFirebaseToken } = require('../middleware/auth');

// All notification routes require authentication
router.use(verifyFirebaseToken);

// Register device for push notifications
router.post('/register-device', notificationController.registerDevice);

// Unregister device
router.delete('/unregister-device', notificationController.unregisterDevice);

// Get notification preferences
router.get('/preferences', notificationController.getPreferences);

// Update notification preferences
router.put('/preferences', notificationController.updatePreferences);

// Send test notification
router.post('/test', notificationController.sendTestNotification);

// Get notification history
router.get('/history', notificationController.getHistory);

// Mark notification as read
router.put('/:notificationId/read', notificationController.markAsRead);

module.exports = router;

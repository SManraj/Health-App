const db = require('../config/database');
const { Expo } = require('expo-server-sdk');

// Create a new Expo SDK client
const expo = new Expo();

const notificationController = {
  /**
   * Register device for push notifications
   */
  registerDevice: async (req, res) => {
    try {
      const { uid } = req.user;
      const { pushToken, deviceType } = req.body;

      if (!Expo.isExpoPushToken(pushToken)) {
        return res.status(400).json({ error: { message: 'Invalid Expo push token' } });
      }

      // Get user ID
      const userResult = await db.query(
        'SELECT id FROM users WHERE firebase_uid = $1',
        [uid]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: { message: 'User not found' } });
      }

      const userId = userResult.rows[0].id;

      // Insert or update device token
      const result = await db.query(
        `INSERT INTO notification_devices (user_id, push_token, device_type, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, true, NOW(), NOW())
         ON CONFLICT (push_token)
         DO UPDATE SET user_id = $1, device_type = $3, is_active = true, updated_at = NOW()
         RETURNING *`,
        [userId, pushToken, deviceType]
      );

      res.status(200).json({
        message: 'Device registered successfully',
        device: result.rows[0]
      });
    } catch (error) {
      console.error('Register device error:', error);
      res.status(500).json({ error: { message: 'Failed to register device' } });
    }
  },

  /**
   * Unregister device
   */
  unregisterDevice: async (req, res) => {
    try {
      const { uid } = req.user;
      const { pushToken } = req.body;

      const result = await db.query(
        `UPDATE notification_devices nd
         SET is_active = false, updated_at = NOW()
         FROM users u
         WHERE nd.user_id = u.id AND u.firebase_uid = $1 AND nd.push_token = $2
         RETURNING nd.*`,
        [uid, pushToken]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: { message: 'Device not found' } });
      }

      res.status(200).json({ message: 'Device unregistered successfully' });
    } catch (error) {
      console.error('Unregister device error:', error);
      res.status(500).json({ error: { message: 'Failed to unregister device' } });
    }
  },

  /**
   * Get notification preferences
   */
  getPreferences: async (req, res) => {
    try {
      const { uid } = req.user;

      const result = await db.query(
        `SELECT np.* FROM notification_preferences np
         INNER JOIN users u ON np.user_id = u.id
         WHERE u.firebase_uid = $1`,
        [uid]
      );

      if (result.rows.length === 0) {
        // Return default preferences if none exist
        return res.status(200).json({
          preferences: {
            meal_reminders: true,
            goal_reminders: true,
            achievement_notifications: true,
            daily_summary: true,
            quiet_hours_start: null,
            quiet_hours_end: null
          }
        });
      }

      res.status(200).json({ preferences: result.rows[0] });
    } catch (error) {
      console.error('Get preferences error:', error);
      res.status(500).json({ error: { message: 'Failed to get preferences' } });
    }
  },

  /**
   * Update notification preferences
   */
  updatePreferences: async (req, res) => {
    try {
      const { uid } = req.user;
      const {
        mealReminders,
        goalReminders,
        achievementNotifications,
        dailySummary,
        quietHoursStart,
        quietHoursEnd
      } = req.body;

      // Get user ID
      const userResult = await db.query(
        'SELECT id FROM users WHERE firebase_uid = $1',
        [uid]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: { message: 'User not found' } });
      }

      const userId = userResult.rows[0].id;

      const result = await db.query(
        `INSERT INTO notification_preferences
         (user_id, meal_reminders, goal_reminders, achievement_notifications,
          daily_summary, quiet_hours_start, quiet_hours_end, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (user_id)
         DO UPDATE SET
           meal_reminders = COALESCE($2, notification_preferences.meal_reminders),
           goal_reminders = COALESCE($3, notification_preferences.goal_reminders),
           achievement_notifications = COALESCE($4, notification_preferences.achievement_notifications),
           daily_summary = COALESCE($5, notification_preferences.daily_summary),
           quiet_hours_start = COALESCE($6, notification_preferences.quiet_hours_start),
           quiet_hours_end = COALESCE($7, notification_preferences.quiet_hours_end),
           updated_at = NOW()
         RETURNING *`,
        [userId, mealReminders, goalReminders, achievementNotifications, dailySummary, quietHoursStart, quietHoursEnd]
      );

      res.status(200).json({
        message: 'Preferences updated successfully',
        preferences: result.rows[0]
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({ error: { message: 'Failed to update preferences' } });
    }
  },

  /**
   * Send test notification
   */
  sendTestNotification: async (req, res) => {
    try {
      const { uid } = req.user;

      // Get user's active devices
      const devicesResult = await db.query(
        `SELECT nd.push_token FROM notification_devices nd
         INNER JOIN users u ON nd.user_id = u.id
         WHERE u.firebase_uid = $1 AND nd.is_active = true`,
        [uid]
      );

      if (devicesResult.rows.length === 0) {
        return res.status(404).json({ error: { message: 'No active devices found' } });
      }

      const messages = devicesResult.rows.map(device => ({
        to: device.push_token,
        sound: 'default',
        title: 'Test Notification',
        body: 'This is a test notification from your dieting app!',
        data: { type: 'test' }
      }));

      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending notification chunk:', error);
        }
      }

      res.status(200).json({
        message: 'Test notification sent successfully',
        tickets
      });
    } catch (error) {
      console.error('Send test notification error:', error);
      res.status(500).json({ error: { message: 'Failed to send test notification' } });
    }
  },

  /**
   * Get notification history
   */
  getHistory: async (req, res) => {
    try {
      const { uid } = req.user;
      const { limit = 50, offset = 0 } = req.query;

      const result = await db.query(
        `SELECT nh.* FROM notification_history nh
         INNER JOIN users u ON nh.user_id = u.id
         WHERE u.firebase_uid = $1
         ORDER BY nh.sent_at DESC
         LIMIT $2 OFFSET $3`,
        [uid, limit, offset]
      );

      res.status(200).json({ notifications: result.rows });
    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({ error: { message: 'Failed to get notification history' } });
    }
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (req, res) => {
    try {
      const { uid } = req.user;
      const { notificationId } = req.params;

      const result = await db.query(
        `UPDATE notification_history nh
         SET is_read = true, read_at = NOW()
         FROM users u
         WHERE nh.user_id = u.id AND u.firebase_uid = $1 AND nh.id = $2
         RETURNING nh.*`,
        [uid, notificationId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: { message: 'Notification not found' } });
      }

      res.status(200).json({
        message: 'Notification marked as read',
        notification: result.rows[0]
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ error: { message: 'Failed to mark notification as read' } });
    }
  }
};

module.exports = notificationController;

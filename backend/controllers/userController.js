const db = require('../config/database');

const userController = {
  /**
   * Get user profile
   */
  getProfile: async (req, res) => {
    try {
      const { uid } = req.user;

      const result = await db.query(
        `SELECT u.id, u.firebase_uid, u.email, u.display_name, u.created_at,
                up.age, up.gender, up.height, up.weight, up.activity_level
         FROM users u
         LEFT JOIN user_profiles up ON u.id = up.user_id
         WHERE u.firebase_uid = $1`,
        [uid]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: { message: 'User not found' } });
      }

      res.status(200).json({ user: result.rows[0] });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: { message: 'Failed to get profile' } });
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (req, res) => {
    try {
      const { uid } = req.user;
      const { displayName, age, gender, height, weight, activityLevel } = req.body;

      // Get user ID
      const userResult = await db.query(
        'SELECT id FROM users WHERE firebase_uid = $1',
        [uid]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: { message: 'User not found' } });
      }

      const userId = userResult.rows[0].id;

      // Update user table
      if (displayName) {
        await db.query(
          'UPDATE users SET display_name = $1, updated_at = NOW() WHERE id = $2',
          [displayName, userId]
        );
      }

      // Upsert user profile
      await db.query(
        `INSERT INTO user_profiles (user_id, age, gender, height, weight, activity_level, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (user_id)
         DO UPDATE SET age = $2, gender = $3, height = $4, weight = $5,
                      activity_level = $6, updated_at = NOW()`,
        [userId, age, gender, height, weight, activityLevel]
      );

      res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: { message: 'Failed to update profile' } });
    }
  },

  /**
   * Get user goals
   */
  getGoals: async (req, res) => {
    try {
      const { uid } = req.user;

      const result = await db.query(
        `SELECT g.* FROM user_goals g
         INNER JOIN users u ON g.user_id = u.id
         WHERE u.firebase_uid = $1 AND g.is_active = true
         ORDER BY g.created_at DESC`,
        [uid]
      );

      res.status(200).json({ goals: result.rows });
    } catch (error) {
      console.error('Get goals error:', error);
      res.status(500).json({ error: { message: 'Failed to get goals' } });
    }
  },

  /**
   * Set user goals
   */
  setGoals: async (req, res) => {
    try {
      const { uid } = req.user;
      const { goalType, targetValue, targetDate, dailyCalories, dailyProtein, dailyCarbs, dailyFats } = req.body;

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
        `INSERT INTO user_goals (user_id, goal_type, target_value, target_date,
                                 daily_calories, daily_protein, daily_carbs, daily_fats,
                                 is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())
         RETURNING *`,
        [userId, goalType, targetValue, targetDate, dailyCalories, dailyProtein, dailyCarbs, dailyFats]
      );

      res.status(201).json({
        message: 'Goal created successfully',
        goal: result.rows[0]
      });
    } catch (error) {
      console.error('Set goals error:', error);
      res.status(500).json({ error: { message: 'Failed to set goals' } });
    }
  },

  /**
   * Update user goals
   */
  updateGoals: async (req, res) => {
    try {
      const { uid } = req.user;
      const { goalId } = req.params;
      const { goalType, targetValue, targetDate, dailyCalories, dailyProtein, dailyCarbs, dailyFats, isActive } = req.body;

      const result = await db.query(
        `UPDATE user_goals g
         SET goal_type = COALESCE($1, goal_type),
             target_value = COALESCE($2, target_value),
             target_date = COALESCE($3, target_date),
             daily_calories = COALESCE($4, daily_calories),
             daily_protein = COALESCE($5, daily_protein),
             daily_carbs = COALESCE($6, daily_carbs),
             daily_fats = COALESCE($7, daily_fats),
             is_active = COALESCE($8, is_active),
             updated_at = NOW()
         FROM users u
         WHERE g.user_id = u.id AND u.firebase_uid = $9 AND g.id = $10
         RETURNING g.*`,
        [goalType, targetValue, targetDate, dailyCalories, dailyProtein, dailyCarbs, dailyFats, isActive, uid, goalId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: { message: 'Goal not found' } });
      }

      res.status(200).json({
        message: 'Goal updated successfully',
        goal: result.rows[0]
      });
    } catch (error) {
      console.error('Update goals error:', error);
      res.status(500).json({ error: { message: 'Failed to update goals' } });
    }
  },

  /**
   * Delete user account
   */
  deleteAccount: async (req, res) => {
    try {
      const { uid } = req.user;

      // Delete user from database (cascade will handle related records)
      await db.query('DELETE FROM users WHERE firebase_uid = $1', [uid]);

      res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ error: { message: 'Failed to delete account' } });
    }
  }
};

module.exports = userController;

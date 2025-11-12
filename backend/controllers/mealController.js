const db = require('../config/database');

const mealController = {
  /**
   * Get all meals for the logged-in user
   */
  getAllMeals: async (req, res) => {
    try {
      const { uid } = req.user;
      const { limit = 50, offset = 0 } = req.query;

      const result = await db.query(
        `SELECT m.* FROM meals m
         INNER JOIN users u ON m.user_id = u.id
         WHERE u.firebase_uid = $1
         ORDER BY m.meal_date DESC, m.meal_time DESC
         LIMIT $2 OFFSET $3`,
        [uid, limit, offset]
      );

      res.status(200).json({ meals: result.rows });
    } catch (error) {
      console.error('Get all meals error:', error);
      res.status(500).json({ error: { message: 'Failed to get meals' } });
    }
  },

  /**
   * Get a specific meal by ID
   */
  getMealById: async (req, res) => {
    try {
      const { uid } = req.user;
      const { mealId } = req.params;

      const result = await db.query(
        `SELECT m.* FROM meals m
         INNER JOIN users u ON m.user_id = u.id
         WHERE u.firebase_uid = $1 AND m.id = $2`,
        [uid, mealId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: { message: 'Meal not found' } });
      }

      res.status(200).json({ meal: result.rows[0] });
    } catch (error) {
      console.error('Get meal by ID error:', error);
      res.status(500).json({ error: { message: 'Failed to get meal' } });
    }
  },

  /**
   * Create a new meal
   */
  createMeal: async (req, res) => {
    try {
      const { uid } = req.user;
      const {
        mealName,
        mealType,
        mealDate,
        mealTime,
        calories,
        protein,
        carbs,
        fats,
        fiber,
        notes
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
        `INSERT INTO meals (user_id, meal_name, meal_type, meal_date, meal_time,
                           calories, protein, carbs, fats, fiber, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
         RETURNING *`,
        [userId, mealName, mealType, mealDate, mealTime, calories, protein, carbs, fats, fiber, notes]
      );

      res.status(201).json({
        message: 'Meal created successfully',
        meal: result.rows[0]
      });
    } catch (error) {
      console.error('Create meal error:', error);
      res.status(500).json({ error: { message: 'Failed to create meal' } });
    }
  },

  /**
   * Update a meal
   */
  updateMeal: async (req, res) => {
    try {
      const { uid } = req.user;
      const { mealId } = req.params;
      const {
        mealName,
        mealType,
        mealDate,
        mealTime,
        calories,
        protein,
        carbs,
        fats,
        fiber,
        notes
      } = req.body;

      const result = await db.query(
        `UPDATE meals m
         SET meal_name = COALESCE($1, meal_name),
             meal_type = COALESCE($2, meal_type),
             meal_date = COALESCE($3, meal_date),
             meal_time = COALESCE($4, meal_time),
             calories = COALESCE($5, calories),
             protein = COALESCE($6, protein),
             carbs = COALESCE($7, carbs),
             fats = COALESCE($8, fats),
             fiber = COALESCE($9, fiber),
             notes = COALESCE($10, notes),
             updated_at = NOW()
         FROM users u
         WHERE m.user_id = u.id AND u.firebase_uid = $11 AND m.id = $12
         RETURNING m.*`,
        [mealName, mealType, mealDate, mealTime, calories, protein, carbs, fats, fiber, notes, uid, mealId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: { message: 'Meal not found' } });
      }

      res.status(200).json({
        message: 'Meal updated successfully',
        meal: result.rows[0]
      });
    } catch (error) {
      console.error('Update meal error:', error);
      res.status(500).json({ error: { message: 'Failed to update meal' } });
    }
  },

  /**
   * Delete a meal
   */
  deleteMeal: async (req, res) => {
    try {
      const { uid } = req.user;
      const { mealId } = req.params;

      const result = await db.query(
        `DELETE FROM meals m
         USING users u
         WHERE m.user_id = u.id AND u.firebase_uid = $1 AND m.id = $2
         RETURNING m.id`,
        [uid, mealId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: { message: 'Meal not found' } });
      }

      res.status(200).json({ message: 'Meal deleted successfully' });
    } catch (error) {
      console.error('Delete meal error:', error);
      res.status(500).json({ error: { message: 'Failed to delete meal' } });
    }
  },

  /**
   * Get meals by date range
   */
  getMealsByDateRange: async (req, res) => {
    try {
      const { uid } = req.user;
      const { startDate, endDate } = req.params;

      const result = await db.query(
        `SELECT m.* FROM meals m
         INNER JOIN users u ON m.user_id = u.id
         WHERE u.firebase_uid = $1 AND m.meal_date BETWEEN $2 AND $3
         ORDER BY m.meal_date DESC, m.meal_time DESC`,
        [uid, startDate, endDate]
      );

      res.status(200).json({ meals: result.rows });
    } catch (error) {
      console.error('Get meals by date range error:', error);
      res.status(500).json({ error: { message: 'Failed to get meals' } });
    }
  },

  /**
   * Get daily nutrition summary
   */
  getDailySummary: async (req, res) => {
    try {
      const { uid } = req.user;
      const { date } = req.params;

      const result = await db.query(
        `SELECT
           COUNT(*) as meal_count,
           SUM(calories) as total_calories,
           SUM(protein) as total_protein,
           SUM(carbs) as total_carbs,
           SUM(fats) as total_fats,
           SUM(fiber) as total_fiber
         FROM meals m
         INNER JOIN users u ON m.user_id = u.id
         WHERE u.firebase_uid = $1 AND m.meal_date = $2`,
        [uid, date]
      );

      res.status(200).json({ summary: result.rows[0] });
    } catch (error) {
      console.error('Get daily summary error:', error);
      res.status(500).json({ error: { message: 'Failed to get daily summary' } });
    }
  },

  /**
   * Get weekly nutrition summary
   */
  getWeeklySummary: async (req, res) => {
    try {
      const { uid } = req.user;
      const { startDate } = req.params;

      const result = await db.query(
        `SELECT
           m.meal_date,
           COUNT(*) as meal_count,
           SUM(calories) as total_calories,
           SUM(protein) as total_protein,
           SUM(carbs) as total_carbs,
           SUM(fats) as total_fats,
           SUM(fiber) as total_fiber
         FROM meals m
         INNER JOIN users u ON m.user_id = u.id
         WHERE u.firebase_uid = $1
           AND m.meal_date >= $2
           AND m.meal_date < $2::date + INTERVAL '7 days'
         GROUP BY m.meal_date
         ORDER BY m.meal_date`,
        [uid, startDate]
      );

      res.status(200).json({ summary: result.rows });
    } catch (error) {
      console.error('Get weekly summary error:', error);
      res.status(500).json({ error: { message: 'Failed to get weekly summary' } });
    }
  }
};

module.exports = mealController;

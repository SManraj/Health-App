const db = require('../config/database');

const healthController = {
  /**
   * Sync health data from Apple HealthKit
   */
  syncHealthData: async (req, res) => {
    try {
      const { uid } = req.user;
      const { metrics } = req.body; // Array of health metrics from HealthKit

      if (!metrics || !Array.isArray(metrics)) {
        return res.status(400).json({ error: { message: 'Invalid metrics data' } });
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

      // Insert metrics in batch
      const insertPromises = metrics.map(metric => {
        return db.query(
          `INSERT INTO health_metrics (user_id, metric_type, metric_value, metric_unit,
                                       recorded_at, source, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT (user_id, metric_type, recorded_at, source)
           DO UPDATE SET metric_value = $3, metric_unit = $4`,
          [userId, metric.type, metric.value, metric.unit, metric.recordedAt, metric.source || 'HealthKit']
        );
      });

      await Promise.all(insertPromises);

      res.status(200).json({
        message: 'Health data synced successfully',
        syncedCount: metrics.length
      });
    } catch (error) {
      console.error('Sync health data error:', error);
      res.status(500).json({ error: { message: 'Failed to sync health data' } });
    }
  },

  /**
   * Get health metrics
   */
  getHealthMetrics: async (req, res) => {
    try {
      const { uid } = req.user;
      const { limit = 100, offset = 0 } = req.query;

      const result = await db.query(
        `SELECT hm.* FROM health_metrics hm
         INNER JOIN users u ON hm.user_id = u.id
         WHERE u.firebase_uid = $1
         ORDER BY hm.recorded_at DESC
         LIMIT $2 OFFSET $3`,
        [uid, limit, offset]
      );

      res.status(200).json({ metrics: result.rows });
    } catch (error) {
      console.error('Get health metrics error:', error);
      res.status(500).json({ error: { message: 'Failed to get health metrics' } });
    }
  },

  /**
   * Get specific metric by type
   */
  getMetricByType: async (req, res) => {
    try {
      const { uid } = req.user;
      const { metricType } = req.params;
      const { limit = 100, offset = 0 } = req.query;

      const result = await db.query(
        `SELECT hm.* FROM health_metrics hm
         INNER JOIN users u ON hm.user_id = u.id
         WHERE u.firebase_uid = $1 AND hm.metric_type = $2
         ORDER BY hm.recorded_at DESC
         LIMIT $3 OFFSET $4`,
        [uid, metricType, limit, offset]
      );

      res.status(200).json({ metrics: result.rows });
    } catch (error) {
      console.error('Get metric by type error:', error);
      res.status(500).json({ error: { message: 'Failed to get metric' } });
    }
  },

  /**
   * Get metrics by date range
   */
  getMetricsByDateRange: async (req, res) => {
    try {
      const { uid } = req.user;
      const { metricType, startDate, endDate } = req.params;

      const result = await db.query(
        `SELECT hm.* FROM health_metrics hm
         INNER JOIN users u ON hm.user_id = u.id
         WHERE u.firebase_uid = $1 AND hm.metric_type = $2
           AND hm.recorded_at BETWEEN $3 AND $4
         ORDER BY hm.recorded_at DESC`,
        [uid, metricType, startDate, endDate]
      );

      res.status(200).json({ metrics: result.rows });
    } catch (error) {
      console.error('Get metrics by date range error:', error);
      res.status(500).json({ error: { message: 'Failed to get metrics' } });
    }
  },

  /**
   * Manually add health metric
   */
  addHealthMetric: async (req, res) => {
    try {
      const { uid } = req.user;
      const { metricType, metricValue, metricUnit, recordedAt, source } = req.body;

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
        `INSERT INTO health_metrics (user_id, metric_type, metric_value, metric_unit,
                                     recorded_at, source, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING *`,
        [userId, metricType, metricValue, metricUnit, recordedAt, source || 'Manual']
      );

      res.status(201).json({
        message: 'Health metric added successfully',
        metric: result.rows[0]
      });
    } catch (error) {
      console.error('Add health metric error:', error);
      res.status(500).json({ error: { message: 'Failed to add health metric' } });
    }
  },

  /**
   * Update health metric
   */
  updateHealthMetric: async (req, res) => {
    try {
      const { uid } = req.user;
      const { metricId } = req.params;
      const { metricValue, metricUnit, recordedAt } = req.body;

      const result = await db.query(
        `UPDATE health_metrics hm
         SET metric_value = COALESCE($1, metric_value),
             metric_unit = COALESCE($2, metric_unit),
             recorded_at = COALESCE($3, recorded_at)
         FROM users u
         WHERE hm.user_id = u.id AND u.firebase_uid = $4 AND hm.id = $5
         RETURNING hm.*`,
        [metricValue, metricUnit, recordedAt, uid, metricId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: { message: 'Health metric not found' } });
      }

      res.status(200).json({
        message: 'Health metric updated successfully',
        metric: result.rows[0]
      });
    } catch (error) {
      console.error('Update health metric error:', error);
      res.status(500).json({ error: { message: 'Failed to update health metric' } });
    }
  },

  /**
   * Delete health metric
   */
  deleteHealthMetric: async (req, res) => {
    try {
      const { uid } = req.user;
      const { metricId } = req.params;

      const result = await db.query(
        `DELETE FROM health_metrics hm
         USING users u
         WHERE hm.user_id = u.id AND u.firebase_uid = $1 AND hm.id = $2
         RETURNING hm.id`,
        [uid, metricId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: { message: 'Health metric not found' } });
      }

      res.status(200).json({ message: 'Health metric deleted successfully' });
    } catch (error) {
      console.error('Delete health metric error:', error);
      res.status(500).json({ error: { message: 'Failed to delete health metric' } });
    }
  }
};

module.exports = healthController;

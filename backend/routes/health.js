const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const { verifyFirebaseToken } = require('../middleware/auth');

// All health routes require authentication
router.use(verifyFirebaseToken);

// Sync health data from Apple HealthKit
router.post('/sync', healthController.syncHealthData);

// Get health metrics
router.get('/metrics', healthController.getHealthMetrics);

// Get specific metric by type (steps, calories, water, etc.)
router.get('/metrics/:metricType', healthController.getMetricByType);

// Get metrics by date range
router.get('/metrics/:metricType/:startDate/:endDate', healthController.getMetricsByDateRange);

// Manually add health metric
router.post('/metrics', healthController.addHealthMetric);

// Update health metric
router.put('/metrics/:metricId', healthController.updateHealthMetric);

// Delete health metric
router.delete('/metrics/:metricId', healthController.deleteHealthMetric);

module.exports = router;

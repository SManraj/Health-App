const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const { verifyFirebaseToken } = require('../middleware/auth');

// All meal routes require authentication
router.use(verifyFirebaseToken);

// Get all meals for the logged-in user
router.get('/', mealController.getAllMeals);

// Get a specific meal by ID
router.get('/:mealId', mealController.getMealById);

// Create a new meal
router.post('/', mealController.createMeal);

// Update a meal
router.put('/:mealId', mealController.updateMeal);

// Delete a meal
router.delete('/:mealId', mealController.deleteMeal);

// Get meals by date range
router.get('/date-range/:startDate/:endDate', mealController.getMealsByDateRange);

// Get daily nutrition summary
router.get('/summary/daily/:date', mealController.getDailySummary);

// Get weekly nutrition summary
router.get('/summary/weekly/:startDate', mealController.getWeeklySummary);

module.exports = router;

const db = require('../config/database');
const admin = require('../config/firebase');

const authController = {
  /**
   * Register a new user in the database
   * Firebase Auth handles the actual authentication
   */
  register: async (req, res) => {
    try {
      const { uid, email, displayName } = req.body;

      // Check if user already exists
      const existingUser = await db.query(
        'SELECT * FROM users WHERE firebase_uid = $1',
        [uid]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: { message: 'User already exists' } });
      }

      // Insert new user
      const result = await db.query(
        `INSERT INTO users (firebase_uid, email, display_name, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING id, firebase_uid, email, display_name, created_at`,
        [uid, email, displayName]
      );

      res.status(201).json({
        message: 'User registered successfully',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: { message: 'Failed to register user' } });
    }
  },

  /**
   * Login user (handled by Firebase on client side)
   * This endpoint can be used for additional server-side logic
   */
  login: async (req, res) => {
    try {
      const { uid } = req.body;

      const result = await db.query(
        'SELECT id, firebase_uid, email, display_name FROM users WHERE firebase_uid = $1',
        [uid]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: { message: 'User not found' } });
      }

      res.status(200).json({
        message: 'Login successful',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: { message: 'Login failed' } });
    }
  },

  /**
   * Verify Firebase token
   */
  verifyToken: async (req, res) => {
    try {
      res.status(200).json({
        message: 'Token is valid',
        user: req.user
      });
    } catch (error) {
      console.error('Verify token error:', error);
      res.status(500).json({ error: { message: 'Token verification failed' } });
    }
  },

  /**
   * Refresh token (handled by Firebase SDK)
   */
  refreshToken: async (req, res) => {
    try {
      res.status(200).json({
        message: 'Token refresh should be handled by Firebase SDK on client side'
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({ error: { message: 'Token refresh failed' } });
    }
  },

  /**
   * Logout (handled by Firebase SDK on client side)
   */
  logout: async (req, res) => {
    try {
      res.status(200).json({
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: { message: 'Logout failed' } });
    }
  }
};

module.exports = authController;

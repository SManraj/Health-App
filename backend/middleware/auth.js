const admin = require('../config/firebase');

/**
 * Middleware to verify Firebase authentication token
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: { message: 'No token provided' } });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(401).json({ error: { message: 'Invalid or expired token' } });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

module.exports = { verifyFirebaseToken };

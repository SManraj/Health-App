const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
// and either provide the path or set it as an environment variable
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
  console.log('Firebase Admin initialized successfully');
} else {
  console.warn('Firebase Admin not initialized - missing service account credentials');
}

module.exports = admin;

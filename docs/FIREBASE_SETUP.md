# Firebase Authentication Setup Guide

This guide will walk you through setting up Firebase Authentication for the Dieting App.

## Prerequisites

- A Google account
- Access to [Firebase Console](https://console.firebase.google.com/)

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter your project name (e.g., "Dieting App")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Register Your Apps

### Web App (for Expo)

1. In your Firebase project, click the web icon (</>)
2. Register your app with a nickname (e.g., "Dieting App Web")
3. Copy the Firebase configuration object - you'll need this for the frontend

Example configuration:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### iOS App (Optional)

1. Click the iOS icon in Firebase Console
2. Register your iOS app with Bundle ID (from `app.json`)
3. Download `GoogleService-Info.plist`
4. Place it in the `frontend/` directory

### Android App (Optional)

1. Click the Android icon in Firebase Console
2. Register your Android app with Package Name (from `app.json`)
3. Download `google-services.json`
4. Place it in the `frontend/` directory

## Step 3: Enable Authentication Methods

1. In Firebase Console, go to "Authentication" in the left sidebar
2. Click "Get started" if it's your first time
3. Go to the "Sign-in method" tab
4. Enable the following providers:

### Email/Password Authentication

1. Click "Email/Password"
2. Toggle "Enable"
3. Click "Save"

### Optional: Apple Sign-In (for iOS)

1. Click "Apple"
2. Toggle "Enable"
3. Configure with your Apple Developer account details
4. Click "Save"

### Optional: Google Sign-In

1. Click "Google"
2. Toggle "Enable"
3. Select a support email
4. Click "Save"

## Step 4: Generate Service Account Key (Backend)

For the backend to authenticate with Firebase Admin SDK:

1. Go to Project Settings (gear icon) > Service Accounts
2. Click "Generate New Private Key"
3. Click "Generate Key" in the dialog
4. Save the downloaded JSON file as `serviceAccountKey.json`
5. Move this file to `backend/config/serviceAccountKey.json`

**Important**: Never commit this file to version control! It's already in `.gitignore`.

## Step 5: Configure Frontend

Update `frontend/src/services/firebase.js` with your Firebase configuration:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
```

## Step 6: Configure Backend

Update `backend/.env` with Firebase configuration:

```env
# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_PATH=./config/serviceAccountKey.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

Or, for production environments, use the JSON string:

```env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"your-project",...}'
```

## Step 7: Set Up Security Rules (Optional)

If you're using Firestore or Realtime Database:

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Realtime Database Rules

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

## Testing Authentication

### Test Registration

1. Start your app
2. Navigate to the Register screen
3. Enter email and password
4. Submit the form
5. Check Firebase Console > Authentication > Users to see the new user

### Test Login

1. Navigate to the Login screen
2. Enter the registered email and password
3. Submit the form
4. You should be logged in successfully

## Firebase Authentication Features

The app implements the following Firebase Auth features:

### Frontend (React Native)
- User registration with email/password
- User login
- User logout
- Auth state persistence
- Token management

### Backend (Node.js)
- Token verification
- Protected API endpoints
- User synchronization between Firebase and PostgreSQL

## Common Issues

### "Auth domain is not whitelisted"

Solution: Add your domain to authorized domains:
1. Go to Firebase Console > Authentication > Settings
2. Scroll to "Authorized domains"
3. Add your domain (e.g., `localhost` for development)

### "Invalid API key"

Solution: Verify your API key in `firebase.js` matches Firebase Console

### "Permission denied"

Solution: Check that the user is authenticated and tokens are being sent correctly

## Security Best Practices

1. **Never commit service account keys** to version control
2. **Use environment variables** for sensitive configuration
3. **Enable App Check** in production to prevent abuse
4. **Implement rate limiting** on authentication endpoints
5. **Use HTTPS** in production
6. **Regularly rotate** service account keys
7. **Monitor authentication** activity in Firebase Console

## Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
- [React Native Firebase](https://rnfirebase.io/)
- [Expo Firebase Integration](https://docs.expo.dev/guides/using-firebase/)

## Support

If you encounter issues:
1. Check the [Firebase Status Dashboard](https://status.firebase.google.com/)
2. Review [Firebase Documentation](https://firebase.google.com/docs)
3. Search [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
4. Check the app's error logs

# Dieting App

A comprehensive health and dieting tracking application built with React Native + Expo for the frontend, Node.js/Express.js for the backend, and PostgreSQL for the database. The app integrates with Apple HealthKit, Firebase Authentication, and Expo Notifications.

## Features

- **User Authentication**: Secure authentication using Firebase
- **Meal Tracking**: Log and track your daily meals with detailed nutrition information
- **Health Metrics**: Sync and monitor health data from Apple HealthKit or Google Health Connect
- **Goal Setting**: Set and track your dietary and fitness goals
- **Push Notifications**: Receive reminders and updates via Expo Notifications
- **Daily/Weekly Summaries**: View comprehensive nutrition summaries
- **Containerized Deployment**: Full Docker support for easy deployment

## Tech Stack

### Frontend
- React Native
- Expo
- React Navigation
- Firebase SDK
- Expo Notifications
- Expo Apple Authentication
- Axios

### Backend
- Node.js
- Express.js
- PostgreSQL
- Firebase Admin SDK
- Expo Server SDK

### DevOps
- Docker
- Docker Compose

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker](https://www.docker.com/) and Docker Compose
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Firebase Account](https://firebase.google.com/)
- iOS device or simulator (for Apple HealthKit features)

## Project Structure

```
Health-App/
├── frontend/           # React Native + Expo application
│   ├── src/
│   │   ├── screens/   # App screens
│   │   ├── components/# Reusable components
│   │   ├── navigation/# Navigation configuration
│   │   ├── contexts/  # React contexts (Auth, Notifications)
│   │   ├── services/  # API and Firebase services
│   │   └── utils/     # Utility functions
│   ├── App.js
│   ├── package.json
│   └── Dockerfile
├── backend/           # Node.js/Express.js API
│   ├── routes/       # API routes
│   ├── controllers/  # Route controllers
│   ├── models/       # Data models
│   ├── middleware/   # Custom middleware
│   ├── config/       # Configuration files
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── database/         # Database initialization scripts
│   └── init.sql
└── docker-compose.yml
```

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Health-App
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Download the service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the file as `serviceAccountKey.json` in `backend/config/`
5. Copy your Firebase config for the frontend:
   - Go to Project Settings > General
   - Under "Your apps", select Web app
   - Copy the configuration

### 3. Configure Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```env
PORT=3000
NODE_ENV=development
DB_HOST=postgres
DB_PORT=5432
DB_NAME=dieting_app
DB_USER=postgres
DB_PASSWORD=your_secure_password

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_PATH=./config/serviceAccountKey.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### 4. Configure Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Update Firebase configuration in `src/services/firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

3. Update the API URL in `src/services/api.js` if needed:
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

### 5. Running with Docker (Recommended)

The easiest way to run the entire stack is using Docker Compose:

```bash
# From the root directory
docker-compose up --build
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 3000
- Frontend (Expo web) on port 19000

Access the application:
- Frontend: http://localhost:19000
- Backend API: http://localhost:3000
- Database: localhost:5432

### 6. Running Locally (Without Docker)

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npx expo start
```

For iOS:
```bash
npx expo start --ios
```

For Android:
```bash
npx expo start --android
```

For Web:
```bash
npx expo start --web
```

## Apple HealthKit Integration

### iOS Configuration

1. In Xcode, enable HealthKit capability:
   - Open `ios/YourApp.xcworkspace`
   - Select your target
   - Go to "Signing & Capabilities"
   - Click "+ Capability" and add "HealthKit"

2. Update `Info.plist` with health permissions:
```xml
<key>NSHealthShareUsageDescription</key>
<string>This app needs access to your health data to track your nutrition and fitness goals.</string>
<key>NSHealthUpdateUsageDescription</key>
<string>This app needs to update your health data.</string>
```

3. The app uses `expo-health-connect` for Android and native HealthKit APIs for iOS.

### Android Configuration (Google Health Connect)

1. Add required permissions in `app.json`:
```json
"android": {
  "permissions": [
    "android.permission.health.READ_STEPS",
    "android.permission.health.READ_ACTIVE_CALORIES_BURNED",
    "android.permission.health.WRITE_STEPS"
  ]
}
```

## Push Notifications Setup

Expo Notifications are configured and ready to use. For production:

1. Configure push notification credentials:
```bash
expo credentials:manager
```

2. For iOS, you'll need:
   - Apple Push Notification service (APNs) key
   - Apple Developer account

3. For Android:
   - Firebase Cloud Messaging (FCM) server key

## Database Schema

The PostgreSQL database includes the following tables:
- `users` - User accounts
- `user_profiles` - Extended user profile information
- `user_goals` - User dietary and fitness goals
- `meals` - Meal logs with nutrition data
- `health_metrics` - Health data from HealthKit/Health Connect
- `notification_devices` - Push notification device tokens
- `notification_preferences` - User notification settings
- `notification_history` - Notification history

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/goals` - Get user goals
- `POST /api/users/goals` - Create user goal
- `PUT /api/users/goals/:goalId` - Update user goal

### Meals
- `GET /api/meals` - Get all meals
- `POST /api/meals` - Create meal
- `GET /api/meals/:mealId` - Get specific meal
- `PUT /api/meals/:mealId` - Update meal
- `DELETE /api/meals/:mealId` - Delete meal
- `GET /api/meals/summary/daily/:date` - Get daily summary
- `GET /api/meals/summary/weekly/:startDate` - Get weekly summary

### Health
- `POST /api/health/sync` - Sync health data from HealthKit
- `GET /api/health/metrics` - Get health metrics
- `GET /api/health/metrics/:metricType` - Get specific metric type
- `POST /api/health/metrics` - Add health metric manually

### Notifications
- `POST /api/notifications/register-device` - Register device for push
- `GET /api/notifications/preferences` - Get notification preferences
- `PUT /api/notifications/preferences` - Update notification preferences
- `POST /api/notifications/test` - Send test notification

## Development

### Backend Development

```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development

```bash
cd frontend
npx expo start
```

### Database Migrations

To reset the database:
```bash
docker-compose down -v  # Remove volumes
docker-compose up --build
```

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Deployment

### Backend Deployment

1. Build the Docker image:
```bash
docker build -t dieting-app-backend ./backend
```

2. Deploy to your preferred platform (AWS ECS, Google Cloud Run, etc.)

### Frontend Deployment

For production builds:

```bash
cd frontend

# iOS
eas build --platform ios

# Android
eas build --platform android

# Web
expo build:web
```

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `FIREBASE_SERVICE_ACCOUNT_PATH` - Path to Firebase service account key
- `FIREBASE_DATABASE_URL` - Firebase database URL

### Frontend
- Update `src/services/firebase.js` with Firebase config
- Update `src/services/api.js` with API base URL

## Troubleshooting

### Docker Issues

```bash
# Clean up containers and volumes
docker-compose down -v
docker system prune -a

# Rebuild from scratch
docker-compose up --build --force-recreate
```

### Database Connection Issues

Check that PostgreSQL is running:
```bash
docker-compose ps
```

### Expo Issues

Clear Expo cache:
```bash
npx expo start -c
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository.

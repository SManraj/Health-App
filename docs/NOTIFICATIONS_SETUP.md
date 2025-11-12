# Expo Notifications Setup Guide

This guide explains how to set up and configure push notifications using Expo Notifications for the Dieting App.

## Overview

The app uses Expo Notifications to send:
- Meal reminders
- Goal achievement notifications
- Daily nutrition summaries
- Motivational messages
- Health data sync reminders

## Prerequisites

- Expo account
- For iOS: Apple Developer account ($99/year)
- For Android: Firebase Cloud Messaging (FCM) setup

## Basic Setup (Development)

### Step 1: Install Dependencies

The notification dependencies are already included in `package.json`:

```bash
cd frontend
npm install
```

Key packages:
- `expo-notifications`: Expo's notification SDK
- `expo-device`: Device information
- `expo-server-sdk`: Backend notification sending (in backend)

### Step 2: Configure App.json

Update `app.json` with notification settings:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#ffffff",
      "androidMode": "default",
      "androidCollapsedTitle": "#{unread_notifications} new notifications"
    }
  }
}
```

### Step 3: Request Permissions

Permissions are requested automatically on app launch (see `App.js`):

```javascript
import * as Notifications from 'expo-notifications';

const requestPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('Notification permissions are required for reminders!');
  }
};
```

### Step 4: Get Push Token

The app automatically gets the Expo Push Token (see `NotificationContext.js`):

```javascript
import * as Notifications from 'expo-notifications';

const token = await Notifications.getExpoPushTokenAsync();
console.log('Expo Push Token:', token.data);
```

## iOS Setup (Production)

### Step 1: Apple Developer Account Setup

1. Go to [Apple Developer](https://developer.apple.com/)
2. Sign in with your Apple ID
3. Enroll in Apple Developer Program ($99/year)

### Step 2: Create App Identifier

1. Go to Certificates, Identifiers & Profiles
2. Click "Identifiers" → "+"
3. Select "App IDs" → "App"
4. Enter description and Bundle ID (must match `app.json`)
5. Enable "Push Notifications" capability
6. Click "Register"

### Step 3: Create APNs Key

1. Go to "Keys" → "+"
2. Enter key name (e.g., "Dieting App Notifications")
3. Enable "Apple Push Notifications service (APNs)"
4. Click "Continue" → "Register"
5. Download the `.p8` key file
6. Note the Key ID and Team ID

### Step 4: Configure Expo with APNs

Using Expo CLI:

```bash
expo credentials:manager
```

Select iOS → Push Notifications → Upload credentials:
- Upload your `.p8` file
- Enter Key ID
- Enter Team ID

Or configure in `eas.json`:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "production": {
      "ios": {
        "credentials": {
          "pushKey": {
            "path": "./credentials/AuthKey_XXXXXXXXXX.p8",
            "keyId": "YOUR_KEY_ID"
          }
        }
      }
    }
  }
}
```

## Android Setup (Production)

### Step 1: Firebase Cloud Messaging Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create new)
3. Click project settings (gear icon)
4. Go to "Cloud Messaging" tab
5. Under "Cloud Messaging API (Legacy)", note the Server Key

### Step 2: Configure Expo with FCM

Using Expo CLI:

```bash
expo credentials:manager
```

Select Android → Push Notifications → Enter FCM server key

Or add to `app.json`:

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

### Step 3: Download google-services.json

1. In Firebase Console, go to Project Settings
2. Under "Your apps", select your Android app
3. Download `google-services.json`
4. Place it in `frontend/` directory

## Notification Implementation

### Frontend - Receiving Notifications

Already implemented in `NotificationContext.js`:

```javascript
// Listen for notifications when app is in foreground
Notifications.addNotificationReceivedListener(notification => {
  console.log('Notification received:', notification);
  // Handle notification display
});

// Listen for notification interactions
Notifications.addNotificationResponseReceivedListener(response => {
  console.log('Notification tapped:', response);
  // Navigate to relevant screen
});
```

### Frontend - Scheduling Local Notifications

```javascript
import * as Notifications from 'expo-notifications';

// Schedule a notification
const scheduleMealReminder = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Meal Reminder 🍽️",
      body: "Don't forget to log your lunch!",
      data: { screen: 'Meals' },
    },
    trigger: {
      hour: 12,
      minute: 0,
      repeats: true,
    },
  });
};
```

### Backend - Sending Push Notifications

Already implemented in `backend/controllers/notificationController.js`:

```javascript
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

// Send notification to user's device
const sendPushNotification = async (pushToken, title, body, data) => {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error('Invalid push token');
    return;
  }

  const message = {
    to: pushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
  };

  try {
    const ticket = await expo.sendPushNotificationsAsync([message]);
    console.log('Notification sent:', ticket);
    return ticket;
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};
```

## Notification Types

### 1. Meal Reminders

Remind users to log their meals:

```javascript
// Backend API endpoint
POST /api/notifications/schedule-meal-reminder
{
  "userId": 123,
  "mealType": "breakfast",
  "time": "08:00"
}
```

### 2. Goal Progress Notifications

Notify about goal achievements:

```javascript
const sendGoalAchievement = async (userId, goalType) => {
  const user = await getUserWithDevice(userId);

  await sendPushNotification(
    user.pushToken,
    "🎉 Goal Achieved!",
    `Congratulations! You've reached your ${goalType} goal.`,
    { screen: 'Profile', tab: 'Goals' }
  );
};
```

### 3. Daily Summary

Send daily nutrition summary:

```javascript
// Schedule daily summary at 8 PM
const scheduleDailySummary = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Daily Summary 📊",
      body: "Check out your nutrition summary for today!",
      data: { screen: 'Home' },
    },
    trigger: {
      hour: 20,
      minute: 0,
      repeats: true,
    },
  });
};
```

### 4. Motivational Messages

Send encouraging messages:

```javascript
const motivationalMessages = [
  "You're doing great! Keep it up! 💪",
  "Stay consistent with your goals! 🎯",
  "Remember to stay hydrated! 💧",
  "Great job tracking your meals! 📝"
];

const sendMotivationalMessage = async (userId) => {
  const message = motivationalMessages[
    Math.floor(Math.random() * motivationalMessages.length)
  ];

  const user = await getUserWithDevice(userId);
  await sendPushNotification(
    user.pushToken,
    "Stay Motivated",
    message,
    { screen: 'Home' }
  );
};
```

## Notification Channels (Android)

Configure notification channels for Android:

```javascript
import * as Notifications from 'expo-notifications';

// Create notification channels
await Notifications.setNotificationChannelAsync('meal-reminders', {
  name: 'Meal Reminders',
  importance: Notifications.AndroidImportance.HIGH,
  vibrationPattern: [0, 250, 250, 250],
  sound: 'default',
});

await Notifications.setNotificationChannelAsync('achievements', {
  name: 'Achievements',
  importance: Notifications.AndroidImportance.HIGH,
  sound: 'achievement.wav',
});

await Notifications.setNotificationChannelAsync('daily-summary', {
  name: 'Daily Summary',
  importance: Notifications.AndroidImportance.DEFAULT,
});
```

## Notification Preferences

Users can customize notification preferences (already implemented):

```javascript
// Frontend - Update preferences
import { notificationAPI } from '../services/api';

const updatePreferences = async (preferences) => {
  await notificationAPI.updatePreferences({
    mealReminders: true,
    goalReminders: true,
    achievementNotifications: true,
    dailySummary: true,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00"
  });
};

// Backend - Check quiet hours before sending
const isQuietHours = (preferences) => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const quietStart = parseTime(preferences.quiet_hours_start);
  const quietEnd = parseTime(preferences.quiet_hours_end);

  return currentTime >= quietStart && currentTime <= quietEnd;
};
```

## Testing Notifications

### Development

Test notifications using Expo Go:

```bash
# Start development server
npx expo start

# Scan QR code with Expo Go app
# Notifications will work on physical devices
```

### Send Test Notification via API

```bash
# Using the test endpoint
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Test with Expo Push Tool

Use [Expo Push Notification Tool](https://expo.dev/notifications):

1. Go to https://expo.dev/notifications
2. Enter your Expo Push Token
3. Enter title and body
4. Click "Send a Notification"

## Notification Best Practices

### Timing

- Don't send notifications during quiet hours
- Respect user time zones
- Limit frequency to avoid annoyance
- Allow users to customize timing

### Content

- Keep titles short and clear
- Make body text actionable
- Use emojis sparingly
- Personalize when possible

### User Control

- Provide granular notification settings
- Allow users to disable specific types
- Make it easy to manage preferences
- Honor system notification settings

### Performance

- Batch notifications when possible
- Handle token expiration gracefully
- Retry failed notifications
- Log notification metrics

## Troubleshooting

### Notifications not received

1. Check device permissions:
```javascript
const { status } = await Notifications.getPermissionsAsync();
console.log('Permission status:', status);
```

2. Verify push token is registered:
```javascript
const token = await Notifications.getExpoPushTokenAsync();
console.log('Push token:', token);
```

3. Check backend logs for sending errors

### Invalid push token error

Solution: Re-register the device token:
```javascript
await notificationAPI.registerDevice({
  pushToken: newToken,
  deviceType: Platform.OS
});
```

### Notifications not working on iOS simulator

Issue: Push notifications don't work on iOS simulator

Solution: Test on physical iOS device

### Android notifications not showing

Solution: Check notification channel settings:
```javascript
const channels = await Notifications.getNotificationChannelsAsync();
console.log('Channels:', channels);
```

## Production Checklist

- [ ] Configure APNs for iOS
- [ ] Configure FCM for Android
- [ ] Test notifications on physical devices
- [ ] Implement notification preferences
- [ ] Add quiet hours functionality
- [ ] Set up notification channels (Android)
- [ ] Handle notification taps properly
- [ ] Log notification delivery metrics
- [ ] Implement retry logic for failures
- [ ] Add notification history tracking
- [ ] Test notification on both platforms
- [ ] Review notification copy and timing
- [ ] Ensure privacy compliance

## Monitoring

Track notification metrics:

```javascript
// Log notification events
const logNotification = async (userId, type, status) => {
  await db.query(
    `INSERT INTO notification_history
     (user_id, notification_type, status, sent_at)
     VALUES ($1, $2, $3, NOW())`,
    [userId, type, status]
  );
};

// Track delivery rates
const getDeliveryRate = async () => {
  const result = await db.query(`
    SELECT
      notification_type,
      COUNT(*) as total,
      SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered
    FROM notification_history
    WHERE sent_at > NOW() - INTERVAL '7 days'
    GROUP BY notification_type
  `);
  return result.rows;
};
```

## Additional Resources

- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Push Notification Tool](https://expo.dev/notifications)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Apple Push Notification Service](https://developer.apple.com/documentation/usernotifications)
- [Expo Server SDK](https://github.com/expo/expo-server-sdk-node)

## Support

For notification issues:
1. Check Expo status page
2. Verify credentials are configured
3. Test on physical devices
4. Review platform-specific requirements
5. Check backend logs for errors

# Apple HealthKit Integration Guide

This guide explains how to integrate Apple HealthKit with the Dieting App to sync health and fitness data.

## Overview

The app integrates with:
- **iOS**: Apple HealthKit
- **Android**: Google Health Connect

This allows users to automatically sync health metrics like steps, calories burned, heart rate, and more.

## iOS - Apple HealthKit Setup

### Prerequisites

- macOS with Xcode installed
- Apple Developer account (for physical device testing)
- iOS device or simulator running iOS 13.0+

### Step 1: Configure App Capabilities

1. Run Expo prebuild to generate native projects:
```bash
cd frontend
npx expo prebuild
```

2. Open the iOS project in Xcode:
```bash
open ios/YourApp.xcworkspace
```

3. Select your app target in the project navigator

4. Go to "Signing & Capabilities" tab

5. Click "+ Capability" button

6. Search for and add "HealthKit"

### Step 2: Configure Info.plist

Add health data usage descriptions to your `app.json`:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSHealthShareUsageDescription": "This app needs access to your health data to track your nutrition and fitness goals.",
        "NSHealthUpdateUsageDescription": "This app needs permission to update your health data with meal and activity information."
      }
    }
  }
}
```

### Step 3: Install HealthKit Library

The app uses `expo-apple-authentication` and native HealthKit APIs:

```bash
npx expo install expo-apple-authentication
```

### Step 4: Request HealthKit Permissions

Add permission request code in your app:

```javascript
import AppleHealthKit from 'react-native-health';

const permissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.BodyMass,
      AppleHealthKit.Constants.Permissions.Height,
      AppleHealthKit.Constants.Permissions.Water,
    ],
    write: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.Water,
    ],
  },
};

AppleHealthKit.initHealthKit(permissions, (error) => {
  if (error) {
    console.log('Error initializing HealthKit:', error);
    return;
  }
  console.log('HealthKit initialized successfully');
});
```

### Step 5: Read Health Data

Example: Reading step count data

```javascript
const options = {
  date: new Date().toISOString(),
  includeManuallyAdded: true,
};

AppleHealthKit.getStepCount(options, (err, results) => {
  if (err) {
    console.error('Error fetching step count:', err);
    return;
  }
  console.log('Steps:', results.value);
  // Sync with backend
  syncHealthData([{
    type: 'steps',
    value: results.value,
    unit: 'count',
    recordedAt: new Date().toISOString(),
    source: 'HealthKit'
  }]);
});
```

### Step 6: Sync with Backend

The app automatically syncs HealthKit data with the backend:

```javascript
import { healthAPI } from '../services/api';

const syncHealthData = async (metrics) => {
  try {
    await healthAPI.syncHealthData({ metrics });
    console.log('Health data synced successfully');
  } catch (error) {
    console.error('Error syncing health data:', error);
  }
};
```

## Android - Google Health Connect Setup

### Prerequisites

- Android Studio
- Android device or emulator running Android 9.0+ (API 28+)
- Google Health Connect app installed

### Step 1: Add Health Connect Dependency

In `app.json`, add the Health Connect plugin:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-health-connect",
        {
          "permissions": [
            "READ_STEPS",
            "WRITE_STEPS",
            "READ_ACTIVE_CALORIES_BURNED",
            "WRITE_ACTIVE_CALORIES_BURNED",
            "READ_HEART_RATE",
            "READ_WEIGHT",
            "WRITE_WEIGHT"
          ]
        }
      ]
    ],
    "android": {
      "permissions": [
        "android.permission.health.READ_STEPS",
        "android.permission.health.READ_ACTIVE_CALORIES_BURNED",
        "android.permission.health.READ_HEART_RATE",
        "android.permission.health.WRITE_STEPS",
        "android.permission.health.WRITE_ACTIVE_CALORIES_BURNED"
      ]
    }
  }
}
```

### Step 2: Install Health Connect Library

```bash
npx expo install expo-health-connect
```

### Step 3: Request Permissions

```javascript
import HealthConnect from 'expo-health-connect';

const requestPermissions = async () => {
  const permissions = [
    { accessType: 'read', recordType: 'Steps' },
    { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
    { accessType: 'read', recordType: 'HeartRate' },
    { accessType: 'write', recordType: 'Steps' },
  ];

  const granted = await HealthConnect.requestPermission(permissions);
  if (granted) {
    console.log('Health Connect permissions granted');
  }
};
```

### Step 4: Read Health Data

```javascript
const readSteps = async () => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));

  const steps = await HealthConnect.readRecords('Steps', {
    timeRangeFilter: {
      startTime: startOfDay.toISOString(),
      endTime: new Date().toISOString(),
    },
  });

  const totalSteps = steps.reduce((sum, record) => sum + record.count, 0);
  console.log('Total steps:', totalSteps);

  // Sync with backend
  syncHealthData([{
    type: 'steps',
    value: totalSteps,
    unit: 'count',
    recordedAt: new Date().toISOString(),
    source: 'HealthConnect'
  }]);
};
```

## Available Health Metrics

The app can sync the following health metrics:

### Activity Metrics
- **Steps**: Daily step count
- **Active Calories**: Calories burned from activity
- **Exercise Minutes**: Active exercise time
- **Distance**: Walking/running distance

### Body Measurements
- **Weight**: Body weight in kg
- **Height**: Height in cm
- **BMI**: Body Mass Index
- **Body Fat Percentage**: Body fat %

### Vital Signs
- **Heart Rate**: Beats per minute
- **Blood Pressure**: Systolic/Diastolic
- **Respiratory Rate**: Breaths per minute
- **Body Temperature**: Temperature in Celsius

### Nutrition
- **Water Intake**: Daily water consumption in ml
- **Calories Consumed**: Daily calorie intake
- **Macronutrients**: Protein, carbs, fats in grams

### Sleep
- **Sleep Duration**: Hours of sleep
- **Sleep Quality**: Sleep stages data

## Data Sync Strategy

### Automatic Sync

The app automatically syncs health data:
- On app launch
- Every 30 minutes when app is active
- When user manually triggers sync

### Background Sync (iOS)

For iOS, enable background fetch:

```json
{
  "expo": {
    "ios": {
      "backgroundModes": ["fetch"]
    }
  }
}
```

## Backend Integration

Health data is stored in the `health_metrics` table:

```sql
CREATE TABLE health_metrics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    metric_type VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10, 2) NOT NULL,
    metric_unit VARCHAR(50),
    recorded_at TIMESTAMP NOT NULL,
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Privacy and Security

### Data Privacy

- All health data is encrypted in transit (HTTPS)
- Health data is only accessible by the authenticated user
- Users can delete their health data at any time
- The app only requests necessary permissions

### Compliance

- **HIPAA**: Health data handling follows HIPAA guidelines
- **GDPR**: Users have right to access and delete their data
- **Apple Review**: Follows Apple's HealthKit review guidelines

### Best Practices

1. Only request permissions you actually need
2. Clearly explain why you need health data access
3. Allow users to opt-out of health data sync
4. Provide data deletion options
5. Never share health data with third parties
6. Use secure connections for all API calls

## Testing

### iOS Simulator

HealthKit is available on iOS Simulator (iOS 13+):
1. Open Health app on simulator
2. Add sample health data
3. Test your app's health data reading

### Physical Device

For production testing:
1. Install app on physical iOS device
2. Grant HealthKit permissions
3. Use real health data from Apple Health
4. Verify data syncs correctly to backend

## Troubleshooting

### "HealthKit is not available on this device"

Solution: HealthKit is only available on iOS devices and simulator. It's not available on Mac Catalyst.

### "Authorization not determined"

Solution: Request permissions before accessing health data:
```javascript
AppleHealthKit.initHealthKit(permissions, callback);
```

### "No data available"

Solution:
- Check that Health app has data for the requested type
- Verify the date range in your query
- Ensure the user granted read permissions

### Data not syncing to backend

Solution:
- Check network connectivity
- Verify authentication token is valid
- Check backend API endpoint is accessible
- Review error logs in console

## Health Connect (Android) Specific Issues

### "Health Connect app not installed"

Solution: Direct users to install Health Connect from Google Play Store:
```javascript
const isAvailable = await HealthConnect.isAvailable();
if (!isAvailable) {
  // Show instructions to install Health Connect
}
```

### Permissions not granted

Solution: Some Android versions require explicit permission:
```javascript
await HealthConnect.requestPermission(permissions);
```

## Additional Resources

- [Apple HealthKit Documentation](https://developer.apple.com/documentation/healthkit)
- [Google Health Connect Documentation](https://developer.android.com/health-and-fitness/guides/health-connect)
- [Expo Health Connect](https://docs.expo.dev/versions/latest/sdk/health-connect/)
- [React Native Health](https://github.com/agencyenterprise/react-native-health)

## App Store Review Guidelines

When submitting to App Store:

1. Clearly explain health data usage in privacy policy
2. Don't use HealthKit data for advertising
3. Don't sell or share health data
4. Implement proper consent flows
5. Provide data deletion options

## Support

For health integration issues:
1. Check device compatibility
2. Verify permissions are granted
3. Test with sample data first
4. Review console logs for errors
5. Contact support with specific error messages

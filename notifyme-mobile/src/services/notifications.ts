import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

let messaging: any = null;
if (Platform.OS !== 'web') {
  try {
    messaging = require('@react-native-firebase/messaging').default;
  } catch (e) {
    console.log("Firebase messaging not available", e);
  }
}

// Configure how notifications should behave when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(userId: string) {
  let token;

  if (Platform.OS === 'android' && messaging) {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#8b5cf6',
    });
    
    // For CallKeep / high priority data messages on Android we use FCM directly
    await messaging().registerDeviceForRemoteMessages();
    const fcmToken = await messaging().getToken();
    
    if (fcmToken) {
      console.log("FCM Token:", fcmToken);
      try {
        await api.post(`/auth/push-token`, { token: fcmToken, platform: 'android' });
      } catch(e) {
        console.log("Failed to register FCM token");
      }
    }
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    try {
      // Standard Expo Push Token (mostly for iOS standard pushes or non-FCM needs)
      const projectId = "your-expo-project-id"; // In a real app this is retrieved from Constants.expoConfig
      token = await Notifications.getExpoPushTokenAsync({ projectId });
      console.log("Expo Push Token:", token.data);
      
      // Send token to backend
      await api.post(`/auth/push-token`, { token: token.data, platform: Platform.OS });
    } catch (e) {
      console.log("Error getting Expo push token:", e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

// Background handler for Firebase Messaging (Android Incoming Calls)
if (Platform.OS !== 'web' && messaging) {
  messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
    console.log('Message handled in the background!', remoteMessage);
    
    if (remoteMessage.data?.type === 'call_event') {
      // This is where we would trigger CallKeep to show the incoming call screen
      // e.g. RNCallKeep.displayIncomingCall(...)
    }
  });
}


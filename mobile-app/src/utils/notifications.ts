import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Storage } from './storage';
import { API_URL } from '../config/api';

async function ensureNotificationHandler() {
  const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';
  if (Platform.OS === 'android' && isExpoGo) return;
  const Notifications = await import('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function registerForPushNotificationsAsync() {
  let token;
  const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';
  if (Platform.OS === 'android' && isExpoGo) {
    return null;
  }
  const Notifications = await import('expo-notifications');
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return null;
    }
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({});
      token = tokenData.data;
    } catch (e) {
      token = null;
    }
  } else {
    token = null;
  }
  return token || null;
}

export async function simulatePanicNotification() {
  const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';
  const Notifications = await import('expo-notifications');
  await ensureNotificationHandler();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🚨 EMERGENCY ALERT',
      body: 'Panic Button Activated! Security and Response Team have been notified.',
      data: { type: 'panic' },
      sound: 'default',
    },
    trigger: null,
  });
}

export async function scheduleLocalNotification(title: string, body: string) {
  const Notifications = await import('expo-notifications');
  await ensureNotificationHandler();
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
    },
    trigger: null,
  });
}

export async function updateUserPushToken(token: string) {
  try {
    const userToken = await Storage.getToken();
    const user = await Storage.getUser();
    let userId = user?.id;
    if (!userId) {
      const meResponse = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (!meResponse.ok) return;
      try {
        const meData = await meResponse.json();
        userId = meData.id;
        await Storage.saveUser(meData);
      } catch (e) {
        return;
      }
    }
    if (!userId) return;
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        push_token: token,
      }),
    });
    if (!response.ok) {
    } else {
    }
  } catch (error) {
  }
}

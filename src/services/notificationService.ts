import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from './api';

// Lazy-load expo-notifications — it crashes on import in Expo Go (SDK 53+)
let Notifications: typeof import('expo-notifications') | null = null;

async function getNotificationsModule() {
  if (Notifications) return Notifications;
  try {
    Notifications = await import('expo-notifications');
    // Configure foreground notification display
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    return Notifications;
  } catch (error) {
    console.warn(
      'expo-notifications is not available (are you running in Expo Go?):',
      error,
    );
    return null;
  }
}

class NotificationService {
  /**
   * Request permissions and get the Expo push token.
   * Returns null in Expo Go, on emulators, or if permission is denied.
   */
  async registerForPushNotifications(): Promise<string | null> {
    const notif = await getNotificationsModule();
    if (!notif) return null;

    if (!Device.isDevice) {
      console.warn('Push notifications require a physical device');
      return null;
    }

    const { status: existingStatus } = await notif.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await notif.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Push notification permission not granted');
      return null;
    }

    // Android requires a notification channel
    if (Platform.OS === 'android') {
      await notif.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: notif.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4F46E5',
      });
    }

    // Resolve project ID from EAS config or env var
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

    if (!projectId) {
      console.warn(
        'No EAS projectId found — push token registration skipped. ' +
          'Set EXPO_PUBLIC_EAS_PROJECT_ID or configure EAS in app.json.',
      );
      return null;
    }

    const tokenData = await notif.getExpoPushTokenAsync({ projectId });
    return tokenData.data;
  }

  /** Save push token on the backend */
  async registerTokenWithBackend(token: string, userId: string): Promise<void> {
    await api.post('/notifications/register-token', {
      token,
      userId,
      platform: Platform.OS,
    });
  }

  /** Remove push token from the backend */
  async unregisterToken(token: string, userId: string): Promise<void> {
    await api.post('/notifications/unregister-token', {
      token,
      userId,
    });
  }

  /** Fetch notification preferences from backend */
  async getPreferences(
    userId: string,
  ): Promise<{ pushEnabled: boolean; emailEnabled: boolean }> {
    const response = await api.get(`/notifications/preferences/${userId}`);
    return response.data;
  }

  /** Update notification preferences on the backend */
  async updatePreferences(
    userId: string,
    prefs: { pushEnabled?: boolean; emailEnabled?: boolean },
  ): Promise<void> {
    await api.put(`/notifications/preferences/${userId}`, prefs);
  }

  /** Listen for notifications received while the app is in the foreground */
  async addNotificationReceivedListener(callback: (notification: any) => void) {
    const notif = await getNotificationsModule();
    if (!notif) return { remove: () => {} };
    return notif.addNotificationReceivedListener(callback);
  }

  /** Listen for the user tapping a notification */
  async addNotificationResponseListener(callback: (response: any) => void) {
    const notif = await getNotificationsModule();
    if (!notif) return { remove: () => {} };
    return notif.addNotificationResponseReceivedListener(callback);
  }

  /** Schedule a local notification (e.g. study reminders) */
  async scheduleLocalNotification(
    content: any,
    trigger?: any,
  ): Promise<string | null> {
    const notif = await getNotificationsModule();
    if (!notif) return null;
    return notif.scheduleNotificationAsync({
      content,
      trigger: trigger ?? null,
    });
  }

  async setBadgeCount(count: number): Promise<void> {
    const notif = await getNotificationsModule();
    if (!notif) return;
    await notif.setBadgeCountAsync(count);
  }

  async getBadgeCount(): Promise<number> {
    const notif = await getNotificationsModule();
    if (!notif) return 0;
    return notif.getBadgeCountAsync();
  }
}

export const notificationService = new NotificationService();

import { create } from 'zustand';
import { notificationService } from '../services/notificationService';

interface NotificationState {
  pushToken: string | null;
  pushEnabled: boolean;
  emailEnabled: boolean;
  isInitialized: boolean;

  /** Call once after the user is authenticated */
  initialize: (userId: string) => Promise<void>;
  togglePushNotifications: (userId: string, enabled: boolean) => Promise<void>;
  toggleEmailNotifications: (userId: string, enabled: boolean) => Promise<void>;
  /** Reset state on sign-out */
  cleanup: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  pushToken: null,
  pushEnabled: true,
  emailEnabled: true,
  isInitialized: false,

  initialize: async (userId: string) => {
    if (get().isInitialized) return;

    try {
      // Load persisted preferences from backend
      try {
        const prefs = await notificationService.getPreferences(userId);
        set({
          pushEnabled: prefs.pushEnabled,
          emailEnabled: prefs.emailEnabled,
        });
      } catch {
        // Use defaults when backend is unreachable
      }

      // Register for push notifications if enabled
      if (get().pushEnabled) {
        const token = await notificationService.registerForPushNotifications();
        if (token) {
          await notificationService.registerTokenWithBackend(token, userId);
          set({ pushToken: token });
        }
      }
    } catch (error) {
      console.error('Notification init failed:', error);
    } finally {
      set({ isInitialized: true });
    }
  },

  togglePushNotifications: async (userId: string, enabled: boolean) => {
    const previous = get().pushEnabled;
    set({ pushEnabled: enabled });

    try {
      await notificationService.updatePreferences(userId, {
        pushEnabled: enabled,
      });

      if (enabled) {
        const token = await notificationService.registerForPushNotifications();
        if (token) {
          await notificationService.registerTokenWithBackend(token, userId);
          set({ pushToken: token });
        }
      } else {
        const { pushToken } = get();
        if (pushToken) {
          await notificationService.unregisterToken(pushToken, userId);
          set({ pushToken: null });
        }
      }
    } catch (error) {
      console.error('Failed to toggle push notifications:', error);
      set({ pushEnabled: previous }); // revert on failure
    }
  },

  toggleEmailNotifications: async (userId: string, enabled: boolean) => {
    const previous = get().emailEnabled;
    set({ emailEnabled: enabled });

    try {
      await notificationService.updatePreferences(userId, {
        emailEnabled: enabled,
      });
    } catch (error) {
      console.error('Failed to toggle email notifications:', error);
      set({ emailEnabled: previous });
    }
  },

  cleanup: () => {
    set({
      pushToken: null,
      pushEnabled: true,
      emailEnabled: true,
      isInitialized: false,
    });
  },
}));

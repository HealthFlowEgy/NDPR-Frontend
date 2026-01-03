/**
 * HealthFlow Mobile App - Notification Service
 * 
 * Handles push notifications for signing requests and credential updates.
 * 
 * Note: Requires Firebase/APNs configuration for production.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { PushNotification } from '../types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Notification channel for Android
const SIGNING_CHANNEL_ID = 'signing-requests';

class NotificationService {
  private expoPushToken: string | null = null;

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    // Create Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(SIGNING_CHANNEL_ID, {
        name: 'Signing Requests',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3498db',
        sound: 'default',
      });
    }

    // Request permission and get token
    await this.registerForPushNotifications();
  }

  /**
   * Register for push notifications
   */
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return null;
    }

    // Check existing permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission not granted');
      return null;
    }

    // Get Expo push token
    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'healthflow-mobile-app', // Replace with your EAS project ID
      });
      this.expoPushToken = token.data;
      console.log('Expo Push Token:', this.expoPushToken);
      return this.expoPushToken;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }

  /**
   * Get current push token
   */
  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Add notification received listener
   */
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Add notification response listener (when user taps notification)
   */
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, unknown>,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    return Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        ...(Platform.OS === 'android' && {
          channelId: SIGNING_CHANNEL_ID,
        }),
      },
      trigger: trigger || null, // null means immediate
    });
  }

  /**
   * Show signing request notification
   */
  async showSigningRequestNotification(
    requestId: string,
    documentType: string,
    requesterName: string,
    isUrgent = false
  ): Promise<string> {
    return this.scheduleLocalNotification(
      isUrgent ? '🔴 Urgent Signing Request' : '📝 New Signing Request',
      `${requesterName} is requesting your signature on a ${documentType.replace('_', ' ')}.`,
      {
        type: 'signing_request',
        requestId,
        documentType,
        requesterName,
        isUrgent,
      }
    );
  }

  /**
   * Show credential issued notification
   */
  async showCredentialIssuedNotification(
    credentialType: string,
    issuerName: string
  ): Promise<string> {
    return this.scheduleLocalNotification(
      '🎉 New Credential Issued',
      `${issuerName} has issued you a new ${credentialType} credential.`,
      {
        type: 'credential_issued',
        credentialType,
        issuerName,
      }
    );
  }

  /**
   * Show credential expiring notification
   */
  async showCredentialExpiringNotification(
    credentialType: string,
    daysRemaining: number
  ): Promise<string> {
    return this.scheduleLocalNotification(
      '⏰ Credential Expiring Soon',
      `Your ${credentialType} credential will expire in ${daysRemaining} days.`,
      {
        type: 'credential_expiring',
        credentialType,
        daysRemaining,
      }
    );
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    return Notifications.getBadgeCountAsync();
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllScheduledNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Parse notification data
   */
  parseNotificationData(notification: Notifications.Notification): PushNotification | null {
    const data = notification.request.content.data;
    
    if (!data || !data.type) {
      return null;
    }

    return {
      id: notification.request.identifier,
      type: data.type as PushNotification['type'],
      title: notification.request.content.title || '',
      body: notification.request.content.body || '',
      data,
      read: false,
      created_at: new Date().toISOString(),
    };
  }
}

export default new NotificationService();

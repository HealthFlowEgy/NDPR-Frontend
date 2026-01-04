/**
 * HealthFlow Mobile App - Notification Service
 * 
 * Handles push notifications for signing requests and credential updates.
 * Note: Requires Firebase/APNs configuration for production.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { PushNotification } from '../types';

const SIGNING_CHANNEL_ID = 'signing-requests';

class NotificationService {
  private expoPushToken: string | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(SIGNING_CHANNEL_ID, {
          name: 'Signing Requests',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#3498db',
          sound: 'default',
        });
      }

      await this.registerForPushNotifications();
      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize notifications:', error);
    }
  }

  async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return null;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permission not granted');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: '1def6c0c-9145-45c0-9c0b-6b1698a676a7',
      });
      this.expoPushToken = token.data;
      return this.expoPushToken;
    } catch (error) {
      console.warn('Failed to get push token:', error);
      return null;
    }
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, unknown>,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      return await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
          ...(Platform.OS === 'android' && { channelId: SIGNING_CHANNEL_ID }),
        },
        trigger: trigger || null,
      });
    } catch (error) {
      console.warn('Failed to schedule notification:', error);
      return '';
    }
  }

  async showSigningRequestNotification(
    requestId: string,
    documentType: string,
    requesterName: string,
    isUrgent = false
  ): Promise<string> {
    const title = isUrgent ? 'Urgent Signing Request' : 'New Signing Request';
    const body = `${requesterName} is requesting your signature on a ${documentType.replace('_', ' ')}.`;
    return this.scheduleLocalNotification(title, body, {
      type: 'signing_request',
      requestId,
      documentType,
      requesterName,
      isUrgent,
    });
  }

  async showCredentialIssuedNotification(
    credentialType: string,
    issuerName: string
  ): Promise<string> {
    return this.scheduleLocalNotification(
      'New Credential Issued',
      `${issuerName} has issued you a new ${credentialType} credential.`,
      { type: 'credential_issued', credentialType, issuerName }
    );
  }

  async showCredentialExpiringNotification(
    credentialType: string,
    daysRemaining: number
  ): Promise<string> {
    return this.scheduleLocalNotification(
      'Credential Expiring Soon',
      `Your ${credentialType} credential will expire in ${daysRemaining} days.`,
      { type: 'credential_expiring', credentialType, daysRemaining }
    );
  }

  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.warn('Failed to clear notifications:', error);
    }
  }

  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.warn('Failed to set badge count:', error);
    }
  }

  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.warn('Failed to get badge count:', error);
      return 0;
    }
  }

  async cancelAllScheduledNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.warn('Failed to cancel notifications:', error);
    }
  }

  parseNotificationData(notification: Notifications.Notification): PushNotification | null {
    try {
      const data = notification.request.content.data;
      if (!data || !data.type) return null;

      return {
        id: notification.request.identifier,
        type: data.type as PushNotification['type'],
        title: notification.request.content.title || '',
        body: notification.request.content.body || '',
        data,
        read: false,
        created_at: new Date().toISOString(),
      };
    } catch (error) {
      console.warn('Failed to parse notification:', error);
      return null;
    }
  }
}

export default new NotificationService();

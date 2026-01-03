import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { KeycloakService } from 'keycloak-angular';
import { environment } from '../../environments/environment';

/**
 * Notification interface following Sunbird RC eLocker patterns
 */
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  read: boolean;
}

/**
 * Real-time Notification Service
 * Following Sunbird RC notification service integration best practices
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private socket: Socket | null = null;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();
  public unreadCount$: Observable<number> = this.unreadCountSubject.asObservable();
  public isConnected$: Observable<boolean> = this.connectionStatusSubject.asObservable();

  constructor(private keycloak: KeycloakService) {
    this.initializeSocket();
  }

  /**
   * Initialize WebSocket connection
   */
  private async initializeSocket(): Promise<void> {
    try {
      const token = await this.keycloak.getToken();
      
      this.socket = io(environment.socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize notification socket:', error);
      // Connect without auth for public access
      this.socket = io(environment.socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true
      });
      this.setupEventListeners();
    }
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection established
    this.socket.on('connect', () => {
      console.log('Connected to notification server');
      this.connectionStatusSubject.next(true);
    });

    // Receive notification
    this.socket.on('notification', (notification: Omit<Notification, 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        read: false,
        timestamp: new Date(notification.timestamp)
      };

      const currentNotifications = this.notificationsSubject.getValue();
      this.notificationsSubject.next([newNotification, ...currentNotifications].slice(0, 100));
      this.unreadCountSubject.next(this.unreadCountSubject.getValue() + 1);

      // Show browser notification for high priority
      if (notification.priority === 'high') {
        this.showBrowserNotification(notification);
      }
    });

    // Connection lost
    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from notification server:', reason);
      this.connectionStatusSubject.next(false);
    });

    // Connection error
    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
      this.connectionStatusSubject.next(false);
    });
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(notification: Omit<Notification, 'read'>): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/assets/logo.png',
        tag: notification.id
      });
    }
  }

  /**
   * Request browser notification permission
   */
  public async requestPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }

  /**
   * Mark notification as read
   */
  public markAsRead(notificationId: string): void {
    const notifications = this.notificationsSubject.getValue();
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification && !notification.read) {
      const updated = notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      this.notificationsSubject.next(updated);
      this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.getValue() - 1));

      // Acknowledge to server
      this.socket?.emit('notification:ack', notificationId);
    }
  }

  /**
   * Mark all notifications as read
   */
  public markAllAsRead(): void {
    const notifications = this.notificationsSubject.getValue();
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    
    this.notificationsSubject.next(notifications.map(n => ({ ...n, read: true })));
    this.unreadCountSubject.next(0);

    // Acknowledge all to server
    unreadIds.forEach(id => this.socket?.emit('notification:ack', id));
  }

  /**
   * Clear all notifications
   */
  public clearAll(): void {
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
  }

  /**
   * Subscribe to entity updates
   */
  public subscribeToEntity(entityType: string, entityId: string): void {
    this.socket?.emit('subscribe:entity', { entityType, entityId });
  }

  /**
   * Unsubscribe from entity updates
   */
  public unsubscribeFromEntity(entityType: string, entityId: string): void {
    this.socket?.emit('unsubscribe:entity', { entityType, entityId });
  }

  /**
   * Get current notifications
   */
  public getNotifications(): Notification[] {
    return this.notificationsSubject.getValue();
  }

  /**
   * Get unread count
   */
  public getUnreadCount(): number {
    return this.unreadCountSubject.getValue();
  }

  /**
   * Check connection status
   */
  public isConnected(): boolean {
    return this.connectionStatusSubject.getValue();
  }

  /**
   * Cleanup on destroy
   */
  ngOnDestroy(): void {
    this.socket?.close();
  }
}

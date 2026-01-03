import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { keycloak } from '../authProvider';

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
 * Custom hook for real-time notifications
 * Following Sunbird RC notification service integration best practices
 */
export const useNotifications = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Initialize socket connection
  useEffect(() => {
    if (!keycloak.token) return;

    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'wss://api.healthflow.tech/ws';
    
    const newSocket = io(socketUrl, {
      auth: { token: keycloak.token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    // Connection established
    newSocket.on('connect', () => {
      console.log('Connected to notification server');
      setIsConnected(true);
      reconnectAttempts.current = 0;
    });

    // Receive notification
    newSocket.on('notification', (notification: Omit<Notification, 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        read: false,
        timestamp: new Date(notification.timestamp)
      };

      setNotifications((prev) => [newNotification, ...prev].slice(0, 100)); // Keep last 100
      setUnreadCount((prev) => prev + 1);

      // Show browser notification if permitted and priority is high
      if (notification.priority === 'high' && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png',
          tag: notification.id
        });
      }
    });

    // Connection lost
    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from notification server:', reason);
      setIsConnected(false);
    });

    // Reconnection attempt
    newSocket.on('reconnect_attempt', (attempt) => {
      console.log(`Reconnection attempt ${attempt}`);
      reconnectAttempts.current = attempt;
    });

    // Reconnection failed
    newSocket.on('reconnect_failed', () => {
      console.error('Failed to reconnect to notification server');
    });

    // Connection error
    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, [keycloak.token]);

  // Handle token refresh
  useEffect(() => {
    if (!socket || !keycloak.token) return;

    // Update socket auth when token changes
    socket.auth = { token: keycloak.token };
    
    if (!socket.connected) {
      socket.connect();
    }
  }, [socket, keycloak.token]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    // Acknowledge to server
    socket?.emit('notification:ack', notificationId);
  }, [socket]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    // Acknowledge all to server
    notifications.filter(n => !n.read).forEach(n => {
      socket?.emit('notification:ack', n.id);
    });
  }, [socket, notifications]);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Subscribe to entity updates
  const subscribeToEntity = useCallback((entityType: string, entityId: string) => {
    socket?.emit('subscribe:entity', { entityType, entityId });
  }, [socket]);

  // Unsubscribe from entity updates
  const unsubscribeFromEntity = useCallback((entityType: string, entityId: string) => {
    socket?.emit('unsubscribe:entity', { entityType, entityId });
  }, [socket]);

  // Request browser notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearAll,
    subscribeToEntity,
    unsubscribeFromEntity,
    requestPermission
  };
};

export default useNotifications;

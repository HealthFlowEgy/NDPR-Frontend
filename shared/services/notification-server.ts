/**
 * HealthFlow Real-time Notification Server
 * Following Sunbird RC best practices for notification service integration
 * 
 * This service provides WebSocket-based real-time notifications for:
 * - Registration status updates
 * - Credential issuance notifications
 * - System alerts
 * - Approval workflow updates
 */

import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

// Notification types following Sunbird RC eLocker patterns
export enum NotificationType {
  REGISTRATION_SUBMITTED = 'registration_submitted',
  REGISTRATION_APPROVED = 'registration_approved',
  REGISTRATION_REJECTED = 'registration_rejected',
  CREDENTIAL_ISSUED = 'credential_issued',
  CREDENTIAL_REVOKED = 'credential_revoked',
  DOCUMENT_UPLOADED = 'document_uploaded',
  DOCUMENT_VERIFIED = 'document_verified',
  SYSTEM_ALERT = 'system_alert',
  PROFILE_UPDATED = 'profile_updated'
}

export interface NotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export interface NotificationTarget {
  userId?: string;
  role?: string;
  entityType?: string;
  entityId?: string;
  broadcast?: boolean;
}

interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    roles: string[];
    entityType?: string;
    entityId?: string;
  };
}

export class NotificationServer {
  private io: Server;

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: [
          'https://admin.healthflow.tech',
          'https://enroll.healthflow.tech',
          'https://dashboard.healthflow.tech',
          'https://search.healthflow.tech',
          'http://localhost:3000',
          'http://localhost:4200',
          'http://localhost:4201',
          'http://localhost:4202'
        ],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Setup authentication middleware
   * Validates JWT token from Keycloak
   */
  private setupMiddleware(): void {
    this.io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;
      
      // Allow anonymous connections for public search portal
      if (!token) {
        socket.data = {
          userId: 'anonymous',
          roles: ['public_user']
        };
        return next();
      }

      try {
        // In production, validate token with Keycloak
        // For now, decode the JWT payload
        const decoded = this.decodeToken(token);
        socket.data = {
          userId: decoded.sub || 'unknown',
          roles: decoded.realm_access?.roles || [],
          entityType: decoded.entityType,
          entityId: decoded.entityId
        };
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });
  }

  /**
   * Decode JWT token (simplified - use proper validation in production)
   */
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(Buffer.from(payload, 'base64').toString());
    } catch {
      throw new Error('Invalid token format');
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User connected: ${socket.data.userId}`);

      // Join user-specific room
      socket.join(`user:${socket.data.userId}`);

      // Join role-based rooms
      socket.data.roles.forEach((role: string) => {
        socket.join(`role:${role}`);
      });

      // Handle subscription to entity updates
      socket.on('subscribe:entity', (data: { entityType: string; entityId: string }) => {
        const room = `entity:${data.entityType}:${data.entityId}`;
        socket.join(room);
        console.log(`User ${socket.data.userId} subscribed to ${room}`);
      });

      // Handle unsubscription from entity updates
      socket.on('unsubscribe:entity', (data: { entityType: string; entityId: string }) => {
        const room = `entity:${data.entityType}:${data.entityId}`;
        socket.leave(room);
        console.log(`User ${socket.data.userId} unsubscribed from ${room}`);
      });

      // Handle acknowledgment of notification receipt
      socket.on('notification:ack', (notificationId: string) => {
        console.log(`Notification ${notificationId} acknowledged by ${socket.data.userId}`);
        // Store acknowledgment in database for audit
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`User ${socket.data.userId} disconnected: ${reason}`);
      });

      // Send welcome notification
      socket.emit('notification', {
        id: `welcome-${Date.now()}`,
        type: NotificationType.SYSTEM_ALERT,
        title: 'Connected',
        message: 'Real-time notifications enabled',
        timestamp: new Date(),
        priority: 'low'
      });
    });
  }

  /**
   * Send notification to specific targets
   */
  public sendNotification(target: NotificationTarget, notification: NotificationPayload): void {
    // Ensure notification has required fields
    const fullNotification: NotificationPayload = {
      ...notification,
      id: notification.id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: notification.timestamp || new Date()
    };

    // Send to specific user
    if (target.userId) {
      this.io.to(`user:${target.userId}`).emit('notification', fullNotification);
    }

    // Send to users with specific role
    if (target.role) {
      this.io.to(`role:${target.role}`).emit('notification', fullNotification);
    }

    // Send to entity subscribers
    if (target.entityType && target.entityId) {
      this.io.to(`entity:${target.entityType}:${target.entityId}`).emit('notification', fullNotification);
    }

    // Broadcast to all connected clients
    if (target.broadcast) {
      this.io.emit('notification', fullNotification);
    }

    console.log(`Notification sent: ${fullNotification.type} - ${fullNotification.title}`);
  }

  /**
   * Send registration status notification
   */
  public sendRegistrationNotification(
    userId: string,
    status: 'submitted' | 'approved' | 'rejected',
    professionalType: string,
    registrationNumber?: string,
    reason?: string
  ): void {
    const typeMap = {
      submitted: NotificationType.REGISTRATION_SUBMITTED,
      approved: NotificationType.REGISTRATION_APPROVED,
      rejected: NotificationType.REGISTRATION_REJECTED
    };

    const titleMap = {
      submitted: 'Registration Submitted',
      approved: 'Registration Approved',
      rejected: 'Registration Rejected'
    };

    const messageMap = {
      submitted: `Your ${professionalType} registration has been submitted and is pending review.`,
      approved: `Congratulations! Your ${professionalType} registration has been approved. Registration Number: ${registrationNumber}`,
      rejected: `Your ${professionalType} registration has been rejected. Reason: ${reason || 'Not specified'}`
    };

    this.sendNotification(
      { userId },
      {
        id: `reg-${Date.now()}`,
        type: typeMap[status],
        title: titleMap[status],
        message: messageMap[status],
        timestamp: new Date(),
        priority: status === 'approved' ? 'high' : 'medium',
        data: {
          professionalType,
          registrationNumber,
          reason
        },
        actionUrl: status === 'approved' ? '/dashboard' : '/enrollment'
      }
    );

    // Also notify admins/registrars for new submissions
    if (status === 'submitted') {
      this.sendNotification(
        { role: 'registrar' },
        {
          id: `admin-reg-${Date.now()}`,
          type: NotificationType.REGISTRATION_SUBMITTED,
          title: 'New Registration',
          message: `A new ${professionalType} registration requires review.`,
          timestamp: new Date(),
          priority: 'medium',
          actionUrl: '/admin/pending'
        }
      );
    }
  }

  /**
   * Send credential issuance notification
   */
  public sendCredentialNotification(
    userId: string,
    credentialType: string,
    credentialId: string
  ): void {
    this.sendNotification(
      { userId },
      {
        id: `cred-${Date.now()}`,
        type: NotificationType.CREDENTIAL_ISSUED,
        title: 'Credential Issued',
        message: `Your ${credentialType} credential has been issued and is available in your digital wallet.`,
        timestamp: new Date(),
        priority: 'high',
        data: {
          credentialType,
          credentialId
        },
        actionUrl: '/wallet'
      }
    );
  }

  /**
   * Get connected users count
   */
  public getConnectedUsersCount(): number {
    return this.io.sockets.sockets.size;
  }

  /**
   * Get users in a specific room
   */
  public async getUsersInRoom(room: string): Promise<string[]> {
    const sockets = await this.io.in(room).fetchSockets();
    return sockets.map(s => (s as any).data.userId);
  }
}

export default NotificationServer;

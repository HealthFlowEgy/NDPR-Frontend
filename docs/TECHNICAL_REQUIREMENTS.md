# HealthFlow Portals - Technical Requirements Document

**Document Version:** 1.0  
**Author:** Manus AI  
**Date:** January 3, 2026  
**Status:** Final

---

## Executive Summary

This document provides comprehensive technical requirements and best practices for the development team to implement enhancements to the HealthFlow Healthcare Professional Registry portals. The enhancements are organized into five major areas: Keycloak Single Sign-On (SSO) Integration, Real-time Notifications, Document Management, Mobile Application Development, and Analytics Dashboard. Each section includes detailed implementation guidelines, code examples, and references to industry best practices.

---

## Table of Contents

1. [Keycloak Single Sign-On (SSO) Integration](#1-keycloak-single-sign-on-sso-integration)
2. [Real-time Notifications](#2-real-time-notifications)
3. [Document Management](#3-document-management)
4. [Mobile Application Development](#4-mobile-application-development)
5. [Analytics Dashboard](#5-analytics-dashboard)
6. [Implementation Roadmap](#6-implementation-roadmap)
7. [References](#7-references)

---

## 1. Keycloak Single Sign-On (SSO) Integration

### 1.1 Overview

Keycloak is an open-source Identity and Access Management (IAM) solution that provides Single Sign-On (SSO), user federation, and identity brokering capabilities. The HealthFlow portals will integrate with the existing Keycloak instance at `https://keycloak.healthflow.tech` to provide a unified authentication experience across all four portals.

### 1.2 Architecture

The SSO architecture follows the OAuth 2.0 Authorization Code flow with PKCE (Proof Key for Code Exchange) for enhanced security. The diagram below illustrates the authentication flow:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Browser  │────▶│  HealthFlow     │────▶│   Keycloak      │
│                 │◀────│  Portal         │◀────│   Server        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │  1. Access Portal     │                       │
        │──────────────────────▶│                       │
        │                       │  2. Redirect to KC    │
        │                       │──────────────────────▶│
        │  3. Login Page        │                       │
        │◀──────────────────────────────────────────────│
        │  4. User Credentials  │                       │
        │──────────────────────────────────────────────▶│
        │                       │  5. Auth Code         │
        │                       │◀──────────────────────│
        │                       │  6. Exchange for Token│
        │                       │──────────────────────▶│
        │                       │  7. Access Token      │
        │                       │◀──────────────────────│
        │  8. Authenticated     │                       │
        │◀──────────────────────│                       │
```

### 1.3 Keycloak Configuration

The following configuration must be applied to the Keycloak server:

**Realm Configuration:**

| Setting | Value | Description |
|---------|-------|-------------|
| Realm Name | `HealthFlow` | Isolated realm for HealthFlow users |
| Login Theme | `healthflow` | Custom branded login page |
| Token Lifespan | 5 minutes | Access token validity period |
| Refresh Token Lifespan | 30 days | Refresh token validity for "remember me" |
| SSL Required | `all` | Enforce HTTPS for all connections |

**Client Configuration:**

| Client ID | Portal | Access Type | Valid Redirect URIs |
|-----------|--------|-------------|---------------------|
| `admin-portal` | Admin Dashboard | confidential | `https://admin.healthflow.tech/*` |
| `enrollment-portal` | Enrollment Portal | public | `https://enroll.healthflow.tech/*` |
| `professional-dashboard` | Professional Dashboard | confidential | `https://dashboard.healthflow.tech/*` |
| `public-search` | Public Search Portal | public | `https://search.healthflow.tech/*` |

**Role Configuration:**

| Role | Description | Assigned Portals |
|------|-------------|------------------|
| `system_admin` | Full system access, can manage all entities and users | Admin Dashboard |
| `registrar` | Can approve/reject registrations, view reports | Admin Dashboard |
| `healthcare_professional` | Can manage own profile, credentials, and wallet | Professional Dashboard |
| `public_user` | Can search and verify credentials | Public Search Portal |

### 1.4 React Admin Integration (Admin Dashboard)

The Admin Dashboard uses React Admin framework. The `ra-keycloak` package provides seamless integration with Keycloak for authentication and authorization [1].

**Installation:**

```bash
npm install ra-keycloak keycloak-js
```

**Implementation:**

```typescript
// src/authProvider.ts
import Keycloak from 'keycloak-js';
import { keycloakAuthProvider } from 'ra-keycloak';

const keycloakConfig = {
    url: 'https://keycloak.healthflow.tech',
    realm: 'HealthFlow',
    clientId: 'admin-portal'
};

const keycloak = new Keycloak(keycloakConfig);

export const initKeycloak = () => keycloak.init({
    onLoad: 'login-required',
    checkLoginIframe: false,
    pkceMethod: 'S256'
});

export const authProvider = keycloakAuthProvider(keycloak, {
    onPermissions: (decoded) => {
        // Map Keycloak roles to React Admin permissions
        const roles = decoded.realm_access?.roles || [];
        return {
            isAdmin: roles.includes('system_admin'),
            isRegistrar: roles.includes('registrar'),
            canManageDoctors: roles.includes('system_admin') || roles.includes('registrar'),
            canManageNurses: roles.includes('system_admin') || roles.includes('registrar'),
            canApproveRegistrations: roles.includes('system_admin') || roles.includes('registrar')
        };
    }
});

export { keycloak };
```

```typescript
// src/App.tsx
import React, { useEffect, useState } from 'react';
import { Admin, Resource, CustomRoutes } from 'react-admin';
import { authProvider, initKeycloak, keycloak } from './authProvider';
import { sunbirdRcDataProvider } from './sunbirdRcDataProvider';

// Resources
import { DoctorList, DoctorCreate, DoctorEdit, DoctorShow } from './resources/doctors';
import { NurseList, NurseCreate, NurseEdit, NurseShow } from './resources/nurses';
// ... other resources

const App: React.FC = () => {
    const [keycloakReady, setKeycloakReady] = useState(false);

    useEffect(() => {
        initKeycloak()
            .then((authenticated) => {
                if (authenticated) {
                    setKeycloakReady(true);
                }
            })
            .catch(console.error);
    }, []);

    if (!keycloakReady) {
        return <div>Loading authentication...</div>;
    }

    return (
        <Admin
            authProvider={authProvider}
            dataProvider={sunbirdRcDataProvider}
            title="HealthFlow Admin"
        >
            {(permissions) => (
                <>
                    {permissions.canManageDoctors && (
                        <Resource
                            name="Doctor"
                            list={DoctorList}
                            create={DoctorCreate}
                            edit={DoctorEdit}
                            show={DoctorShow}
                        />
                    )}
                    {permissions.canManageNurses && (
                        <Resource
                            name="Nurse"
                            list={NurseList}
                            create={NurseCreate}
                            edit={NurseEdit}
                            show={NurseShow}
                        />
                    )}
                    {/* ... other resources */}
                </>
            )}
        </Admin>
    );
};

export default App;
```

### 1.5 Angular Integration (Enrollment, Professional, Public Portals)

The Angular portals will use the `keycloak-angular` library for Keycloak integration [2].

**Installation:**

```bash
npm install keycloak-angular keycloak-js
```

**Implementation:**

```typescript
// src/app/init/keycloak-init.factory.ts
import { KeycloakService } from 'keycloak-angular';
import { environment } from '../../environments/environment';

export function initializeKeycloak(keycloak: KeycloakService): () => Promise<boolean> {
    return () =>
        keycloak.init({
            config: {
                url: environment.keycloakUrl,
                realm: environment.keycloakRealm,
                clientId: environment.keycloakClientId
            },
            initOptions: {
                onLoad: 'check-sso',
                silentCheckSsoRedirectUri:
                    window.location.origin + '/assets/silent-check-sso.html',
                checkLoginIframe: false,
                pkceMethod: 'S256'
            },
            loadUserProfileAtStartUp: true,
            enableBearerInterceptor: true,
            bearerExcludedUrls: ['/assets', '/public']
        });
}
```

```typescript
// src/app/app.module.ts
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeKeycloak } from './init/keycloak-init.factory';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        KeycloakAngularModule
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: initializeKeycloak,
            multi: true,
            deps: [KeycloakService]
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
```

```typescript
// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard extends KeycloakAuthGuard {
    constructor(
        protected override readonly router: Router,
        protected readonly keycloak: KeycloakService
    ) {
        super(router, keycloak);
    }

    async isAccessAllowed(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean | UrlTree> {
        if (!this.authenticated) {
            await this.keycloak.login({
                redirectUri: window.location.origin + state.url
            });
            return false;
        }

        const requiredRoles = route.data['roles'];
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        return requiredRoles.some((role: string) => this.roles.includes(role));
    }
}
```

### 1.6 Best Practices

The following best practices should be followed when implementing Keycloak SSO:

| Practice | Description |
|----------|-------------|
| **Use PKCE** | Always use Proof Key for Code Exchange (PKCE) for public clients to prevent authorization code interception attacks. |
| **Short Token Lifespan** | Configure access tokens with a short lifespan (5-15 minutes) and use refresh tokens for session management. |
| **Secure Cookie Storage** | Store tokens in secure, HTTP-only cookies when possible to prevent XSS attacks. |
| **Role-Based Access Control** | Implement fine-grained RBAC on both frontend and backend to ensure users only access authorized resources. |
| **Token Validation** | Always validate tokens on the backend before processing requests, checking signature, expiration, and issuer. |
| **Logout Handling** | Implement proper logout handling that clears local tokens and invalidates the Keycloak session. |

---

## 2. Real-time Notifications

### 2.1 Overview

Real-time notifications enhance user experience by providing instant updates on important events such as registration approvals, credential issuance, and system alerts. The implementation will use WebSockets with Socket.IO for bidirectional communication between the server and clients.

### 2.2 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     HealthFlow Backend                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  Registry   │───▶│   Event     │───▶│  Socket.IO  │         │
│  │  Service    │    │   Queue     │    │   Server    │         │
│  └─────────────┘    └─────────────┘    └──────┬──────┘         │
└──────────────────────────────────────────────┼─────────────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
              ┌─────▼─────┐              ┌─────▼─────┐              ┌─────▼─────┐
              │   Admin   │              │Professional│              │  Mobile   │
              │ Dashboard │              │ Dashboard  │              │    App    │
              └───────────┘              └───────────┘              └───────────┘
```

### 2.3 Backend Implementation (Node.js with Socket.IO)

```typescript
// src/socket/notification.server.ts
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../auth/keycloak.service';
import { NotificationService } from '../services/notification.service';

interface NotificationPayload {
    type: 'registration_approved' | 'registration_rejected' | 'credential_issued' | 'system_alert';
    title: string;
    message: string;
    data?: Record<string, any>;
    timestamp: Date;
}

export class NotificationServer {
    private io: Server;
    private notificationService: NotificationService;

    constructor(httpServer: HttpServer) {
        this.io = new Server(httpServer, {
            cors: {
                origin: [
                    'https://admin.healthflow.tech',
                    'https://dashboard.healthflow.tech',
                    'https://enroll.healthflow.tech'
                ],
                credentials: true
            },
            transports: ['websocket', 'polling']
        });

        this.notificationService = new NotificationService();
        this.setupMiddleware();
        this.setupEventHandlers();
    }

    private setupMiddleware(): void {
        this.io.use(async (socket, next) => {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication required'));
            }

            try {
                const decoded = await verifyToken(token);
                socket.data.user = decoded;
                socket.data.userId = decoded.sub;
                socket.data.roles = decoded.realm_access?.roles || [];
                next();
            } catch (error) {
                next(new Error('Invalid token'));
            }
        });
    }

    private setupEventHandlers(): void {
        this.io.on('connection', (socket: Socket) => {
            console.log(`User connected: ${socket.data.userId}`);

            // Join user-specific room for targeted notifications
            socket.join(`user:${socket.data.userId}`);

            // Join role-based rooms
            socket.data.roles.forEach((role: string) => {
                socket.join(`role:${role}`);
            });

            // Handle subscription to entity updates
            socket.on('subscribe:entity', (entityType: string, entityId: string) => {
                socket.join(`entity:${entityType}:${entityId}`);
            });

            // Handle unsubscription
            socket.on('unsubscribe:entity', (entityType: string, entityId: string) => {
                socket.leave(`entity:${entityType}:${entityId}`);
            });

            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.data.userId}`);
            });
        });
    }

    // Public method to send notifications
    public sendNotification(
        target: { userId?: string; role?: string; entityType?: string; entityId?: string },
        notification: NotificationPayload
    ): void {
        if (target.userId) {
            this.io.to(`user:${target.userId}`).emit('notification', notification);
        }
        if (target.role) {
            this.io.to(`role:${target.role}`).emit('notification', notification);
        }
        if (target.entityType && target.entityId) {
            this.io.to(`entity:${target.entityType}:${target.entityId}`).emit('notification', notification);
        }

        // Persist notification for offline users
        this.notificationService.saveNotification(target, notification);
    }
}
```

### 2.4 Frontend Implementation (React)

```typescript
// src/hooks/useNotifications.ts
import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useKeycloak } from '@react-keycloak/web';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    timestamp: Date;
    read: boolean;
}

export const useNotifications = () => {
    const { keycloak } = useKeycloak();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!keycloak.token) return;

        const newSocket = io(process.env.REACT_APP_SOCKET_URL!, {
            auth: { token: keycloak.token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        newSocket.on('connect', () => {
            console.log('Connected to notification server');
        });

        newSocket.on('notification', (notification: Notification) => {
            setNotifications((prev) => [
                { ...notification, id: Date.now().toString(), read: false },
                ...prev
            ]);
            setUnreadCount((prev) => prev + 1);

            // Show browser notification if permitted
            if (Notification.permission === 'granted') {
                new Notification(notification.title, {
                    body: notification.message,
                    icon: '/logo.png'
                });
            }
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from notification server');
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [keycloak.token]);

    const markAsRead = useCallback((notificationId: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
    }, []);

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        isConnected: socket?.connected ?? false
    };
};
```

### 2.5 Frontend Implementation (Angular)

```typescript
// src/app/services/notification.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { KeycloakService } from 'keycloak-angular';
import { environment } from '../../environments/environment';

export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    timestamp: Date;
    read: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService implements OnDestroy {
    private socket: Socket | null = null;
    private notificationsSubject = new BehaviorSubject<Notification[]>([]);
    private unreadCountSubject = new BehaviorSubject<number>(0);

    public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();
    public unreadCount$: Observable<number> = this.unreadCountSubject.asObservable();

    constructor(private keycloak: KeycloakService) {
        this.initializeSocket();
    }

    private async initializeSocket(): Promise<void> {
        const token = await this.keycloak.getToken();
        if (!token) return;

        this.socket = io(environment.socketUrl, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        this.socket.on('notification', (notification: Omit<Notification, 'id' | 'read'>) => {
            const newNotification: Notification = {
                ...notification,
                id: Date.now().toString(),
                read: false
            };

            const currentNotifications = this.notificationsSubject.getValue();
            this.notificationsSubject.next([newNotification, ...currentNotifications]);
            this.unreadCountSubject.next(this.unreadCountSubject.getValue() + 1);
        });
    }

    public markAsRead(notificationId: string): void {
        const notifications = this.notificationsSubject.getValue();
        const updated = notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
        );
        this.notificationsSubject.next(updated);
        this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.getValue() - 1));
    }

    public markAllAsRead(): void {
        const notifications = this.notificationsSubject.getValue();
        this.notificationsSubject.next(notifications.map((n) => ({ ...n, read: true })));
        this.unreadCountSubject.next(0);
    }

    ngOnDestroy(): void {
        this.socket?.close();
    }
}
```

### 2.6 Best Practices

| Practice | Description |
|----------|-------------|
| **Reconnection Logic** | Implement automatic reconnection with exponential backoff to handle network interruptions gracefully. |
| **Message Queuing** | Use a message queue (Redis, RabbitMQ) to buffer notifications for offline users and ensure delivery when they reconnect. |
| **Room-based Broadcasting** | Use Socket.IO rooms to efficiently broadcast notifications to specific user groups (by role, entity subscription). |
| **Token Refresh** | Handle token expiration by refreshing the Keycloak token and re-authenticating the socket connection. |
| **Fallback Mechanism** | Implement polling as a fallback for environments where WebSockets are blocked. |

---

## 3. Document Management

### 3.1 Overview

The document management system enables healthcare professionals to securely upload, manage, and digitally sign their credentials and supporting documents during the enrollment process.

### 3.2 Features

| Feature | Description |
|---------|-------------|
| **Drag-and-Drop Upload** | Intuitive file upload interface with drag-and-drop support |
| **Document Preview** | In-browser preview for PDFs and images before submission |
| **File Validation** | Client-side and server-side validation for file type, size, and content |
| **Virus Scanning** | Automated malware scanning for all uploaded files |
| **Digital Signatures** | Integration with digital signature services for document authentication |
| **Version Control** | Track document versions and maintain history |

### 3.3 Implementation (Angular)

```typescript
// src/app/components/document-upload/document-upload.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface UploadedDocument {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    uploadProgress: number;
    status: 'uploading' | 'completed' | 'error';
}

@Component({
    selector: 'app-document-upload',
    template: `
        <div
            class="upload-zone"
            [class.drag-over]="isDragOver"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
        >
            <mat-icon>cloud_upload</mat-icon>
            <p>Drag and drop files here or</p>
            <button mat-raised-button color="primary" (click)="fileInput.click()">
                Browse Files
            </button>
            <input
                #fileInput
                type="file"
                multiple
                [accept]="acceptedTypes"
                (change)="onFileSelected($event)"
                hidden
            />
            <p class="hint">Accepted: PDF, JPG, PNG (Max 10MB each)</p>
        </div>

        <div class="uploaded-files" *ngIf="documents.length > 0">
            <div class="document-item" *ngFor="let doc of documents">
                <mat-icon>{{ getFileIcon(doc.type) }}</mat-icon>
                <div class="document-info">
                    <span class="name">{{ doc.name }}</span>
                    <span class="size">{{ formatSize(doc.size) }}</span>
                </div>
                <mat-progress-bar
                    *ngIf="doc.status === 'uploading'"
                    mode="determinate"
                    [value]="doc.uploadProgress"
                ></mat-progress-bar>
                <button mat-icon-button (click)="previewDocument(doc)" *ngIf="doc.status === 'completed'">
                    <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="removeDocument(doc)">
                    <mat-icon>delete</mat-icon>
                </button>
            </div>
        </div>
    `,
    styleUrls: ['./document-upload.component.scss']
})
export class DocumentUploadComponent {
    @Output() documentsChanged = new EventEmitter<UploadedDocument[]>();

    documents: UploadedDocument[] = [];
    isDragOver = false;
    acceptedTypes = '.pdf,.jpg,.jpeg,.png';
    maxFileSize = 10 * 1024 * 1024; // 10MB

    constructor(private http: HttpClient) {}

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = true;
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;

        const files = event.dataTransfer?.files;
        if (files) {
            this.handleFiles(Array.from(files));
        }
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            this.handleFiles(Array.from(input.files));
        }
    }

    private handleFiles(files: File[]): void {
        for (const file of files) {
            if (!this.validateFile(file)) continue;

            const document: UploadedDocument = {
                id: this.generateId(),
                name: file.name,
                type: file.type,
                size: file.size,
                url: '',
                uploadProgress: 0,
                status: 'uploading'
            };

            this.documents.push(document);
            this.uploadFile(file, document);
        }
    }

    private validateFile(file: File): boolean {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            alert(`File type not allowed: ${file.name}`);
            return false;
        }
        if (file.size > this.maxFileSize) {
            alert(`File too large: ${file.name} (max 10MB)`);
            return false;
        }
        return true;
    }

    private uploadFile(file: File, document: UploadedDocument): void {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', 'enrollment');

        this.http
            .post(`${environment.apiUrl}/documents/upload`, formData, {
                reportProgress: true,
                observe: 'events'
            })
            .subscribe({
                next: (event) => {
                    if (event.type === HttpEventType.UploadProgress && event.total) {
                        document.uploadProgress = Math.round((100 * event.loaded) / event.total);
                    } else if (event.type === HttpEventType.Response) {
                        document.status = 'completed';
                        document.url = (event.body as any).url;
                        this.documentsChanged.emit(this.documents);
                    }
                },
                error: () => {
                    document.status = 'error';
                }
            });
    }

    previewDocument(document: UploadedDocument): void {
        window.open(document.url, '_blank');
    }

    removeDocument(document: UploadedDocument): void {
        this.documents = this.documents.filter((d) => d.id !== document.id);
        this.documentsChanged.emit(this.documents);
    }

    getFileIcon(type: string): string {
        if (type === 'application/pdf') return 'picture_as_pdf';
        if (type.startsWith('image/')) return 'image';
        return 'insert_drive_file';
    }

    formatSize(bytes: number): string {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    private generateId(): string {
        return Math.random().toString(36).substring(2, 15);
    }
}
```

### 3.4 Backend Document Service

```typescript
// src/services/document.service.ts
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';

@Injectable()
export class DocumentService {
    private s3Client: S3Client;
    private bucketName: string;

    constructor() {
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
            }
        });
        this.bucketName = process.env.S3_BUCKET_NAME!;
    }

    async uploadDocument(
        file: Express.Multer.File,
        userId: string,
        documentType: string
    ): Promise<{ id: string; url: string }> {
        const documentId = crypto.randomUUID();
        const key = `documents/${userId}/${documentType}/${documentId}-${file.originalname}`;

        await this.s3Client.send(
            new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                Metadata: {
                    userId,
                    documentType,
                    originalName: file.originalname,
                    uploadedAt: new Date().toISOString()
                }
            })
        );

        // Generate a signed URL for secure access
        const signedUrl = await this.getSignedUrl(key);

        return {
            id: documentId,
            url: signedUrl
        };
    }

    async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key
        });

        return getSignedUrl(this.s3Client, command, { expiresIn });
    }
}
```

### 3.5 Best Practices

| Practice | Description |
|----------|-------------|
| **Client-side Validation** | Validate file type, size, and format on the client before uploading to provide immediate feedback. |
| **Server-side Validation** | Re-validate all files on the server to prevent malicious uploads that bypass client validation. |
| **Virus Scanning** | Integrate with a virus scanning service (e.g., ClamAV) to scan all uploaded files before storage. |
| **Signed URLs** | Use time-limited signed URLs for document access to prevent unauthorized sharing. |
| **Encryption** | Encrypt documents at rest using server-side encryption (SSE-S3 or SSE-KMS). |
| **Audit Logging** | Log all document operations (upload, view, download, delete) for compliance and auditing. |

---

## 4. Mobile Application Development

### 4.1 Overview

The HealthFlow mobile application provides healthcare professionals with a convenient way to manage their digital identity and credentials on the go, while enabling the public to verify credentials using QR code scanning.

### 4.2 Technology Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| **Framework** | React Native with Expo | Cross-platform development for iOS and Android with rapid iteration |
| **State Management** | Redux Toolkit | Predictable state management with excellent TypeScript support |
| **Navigation** | React Navigation | Standard navigation library for React Native |
| **QR Scanning** | react-native-vision-camera | High-performance camera with real-time QR code scanning [1] |
| **Secure Storage** | expo-secure-store | Encrypted storage using device Keychain/Keystore [2] |
| **Push Notifications** | expo-notifications | Cross-platform push notification support |

### 4.3 Project Structure

```
healthflow-mobile/
├── src/
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── index.tsx          # Home/Dashboard
│   │   │   ├── wallet.tsx         # Digital Wallet
│   │   │   ├── scanner.tsx        # QR Scanner
│   │   │   └── profile.tsx        # User Profile
│   │   ├── _layout.tsx
│   │   └── login.tsx
│   ├── components/
│   │   ├── CredentialCard.tsx
│   │   ├── QRScanner.tsx
│   │   └── VerificationResult.tsx
│   ├── services/
│   │   ├── api.service.ts
│   │   ├── auth.service.ts
│   │   └── credential.service.ts
│   ├── store/
│   │   ├── slices/
│   │   │   ├── auth.slice.ts
│   │   │   ├── credentials.slice.ts
│   │   │   └── notifications.slice.ts
│   │   └── store.ts
│   └── utils/
│       ├── secure-storage.ts
│       └── qr-parser.ts
├── app.json
├── package.json
└── tsconfig.json
```

### 4.4 Implementation Examples

**QR Code Scanner Component:**

```typescript
// src/components/QRScanner.tsx
import React, { useCallback, useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import { verifyCredential } from '../services/credential.service';

interface QRScannerProps {
    onScanComplete: (result: VerificationResult) => void;
}

interface VerificationResult {
    isValid: boolean;
    professional?: {
        name: string;
        type: string;
        registrationNumber: string;
        status: string;
        credentials: string[];
    };
    error?: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScanComplete }) => {
    const device = useCameraDevice('back');
    const [isScanning, setIsScanning] = useState(true);
    const [flashEnabled, setFlashEnabled] = useState(false);

    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: async (codes) => {
            if (!isScanning || codes.length === 0) return;

            setIsScanning(false);
            const qrData = codes[0].value;

            try {
                const result = await verifyCredential(qrData);
                onScanComplete(result);
            } catch (error) {
                onScanComplete({
                    isValid: false,
                    error: 'Failed to verify credential. Please try again.'
                });
            }
        }
    });

    if (!device) {
        return (
            <View style={styles.container}>
                <Text>Camera not available</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={isScanning}
                codeScanner={codeScanner}
                torch={flashEnabled ? 'on' : 'off'}
            />
            <View style={styles.overlay}>
                <View style={styles.scanArea} />
            </View>
            <View style={styles.controls}>
                <Pressable
                    style={styles.flashButton}
                    onPress={() => setFlashEnabled(!flashEnabled)}
                >
                    <Text style={styles.buttonText}>
                        {flashEnabled ? 'Flash Off' : 'Flash On'}
                    </Text>
                </Pressable>
                {!isScanning && (
                    <Pressable
                        style={styles.rescanButton}
                        onPress={() => setIsScanning(true)}
                    >
                        <Text style={styles.buttonText}>Scan Again</Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black'
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center'
    },
    scanArea: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#00C853',
        borderRadius: 16,
        backgroundColor: 'transparent'
    },
    controls: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20
    },
    flashButton: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8
    },
    rescanButton: {
        backgroundColor: '#1976D2',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold'
    }
});
```

**Secure Storage Service:**

```typescript
// src/utils/secure-storage.ts
import * as SecureStore from 'expo-secure-store';

const KEYS = {
    ACCESS_TOKEN: 'healthflow_access_token',
    REFRESH_TOKEN: 'healthflow_refresh_token',
    USER_PROFILE: 'healthflow_user_profile',
    CREDENTIALS_CACHE: 'healthflow_credentials_cache'
};

export const secureStorage = {
    async setAccessToken(token: string): Promise<void> {
        await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, token);
    },

    async getAccessToken(): Promise<string | null> {
        return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
    },

    async setRefreshToken(token: string): Promise<void> {
        await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token);
    },

    async getRefreshToken(): Promise<string | null> {
        return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
    },

    async setUserProfile(profile: object): Promise<void> {
        await SecureStore.setItemAsync(KEYS.USER_PROFILE, JSON.stringify(profile));
    },

    async getUserProfile(): Promise<object | null> {
        const data = await SecureStore.getItemAsync(KEYS.USER_PROFILE);
        return data ? JSON.parse(data) : null;
    },

    async cacheCredentials(credentials: object[]): Promise<void> {
        await SecureStore.setItemAsync(KEYS.CREDENTIALS_CACHE, JSON.stringify(credentials));
    },

    async getCachedCredentials(): Promise<object[] | null> {
        const data = await SecureStore.getItemAsync(KEYS.CREDENTIALS_CACHE);
        return data ? JSON.parse(data) : null;
    },

    async clearAll(): Promise<void> {
        await Promise.all([
            SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
            SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
            SecureStore.deleteItemAsync(KEYS.USER_PROFILE),
            SecureStore.deleteItemAsync(KEYS.CREDENTIALS_CACHE)
        ]);
    }
};
```

### 4.5 Best Practices

| Practice | Description |
|----------|-------------|
| **Secure Storage** | Always use the device's secure storage (Keychain/Keystore) for sensitive data like tokens and credentials. Never store sensitive data in AsyncStorage. |
| **Offline Support** | Cache credentials locally to allow professionals to present their credentials even without internet connectivity. |
| **Biometric Authentication** | Implement biometric authentication (Face ID, Touch ID, Fingerprint) for accessing the digital wallet. |
| **Certificate Pinning** | Implement SSL certificate pinning to prevent man-in-the-middle attacks. |
| **Code Obfuscation** | Use code obfuscation tools (e.g., ProGuard, Hermes) to protect the app from reverse engineering. |
| **App Integrity** | Implement app integrity checks to detect rooted/jailbroken devices and tampering. |

---

## 5. Analytics Dashboard

### 5.1 Overview

The analytics dashboard provides administrators and registrars with insights into registry data, including registration trends, geographic distribution, and verification statistics.

### 5.2 Key Metrics

| Metric | Description | Visualization |
|--------|-------------|---------------|
| **Registration Trends** | Number of new registrations over time | Line chart |
| **Professional Distribution** | Breakdown by professional type | Pie chart |
| **Geographic Distribution** | Distribution across regions | Map/Choropleth |
| **Verification Statistics** | Number of verifications performed | Bar chart |
| **Approval Rates** | Percentage of approved vs rejected registrations | Gauge chart |
| **Credential Expiration** | Upcoming credential expirations | Table |

### 5.3 Implementation (React)

```typescript
// src/components/analytics/RegistrationTrendsChart.tsx
import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface TrendData {
    date: string;
    doctors: number;
    nurses: number;
    pharmacists: number;
    physiotherapists: number;
    dentists: number;
}

interface RegistrationTrendsChartProps {
    data: TrendData[];
    title?: string;
}

const COLORS = {
    doctors: '#1976D2',
    nurses: '#C9A227',
    pharmacists: '#388E3C',
    physiotherapists: '#7B1FA2',
    dentists: '#00ACC1'
};

export const RegistrationTrendsChart: React.FC<RegistrationTrendsChartProps> = ({
    data,
    title = 'Registration Trends'
}) => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
                <Box sx={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="doctors"
                                name="Doctors"
                                stroke={COLORS.doctors}
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="nurses"
                                name="Nurses"
                                stroke={COLORS.nurses}
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="pharmacists"
                                name="Pharmacists"
                                stroke={COLORS.pharmacists}
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="physiotherapists"
                                name="Physiotherapists"
                                stroke={COLORS.physiotherapists}
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="dentists"
                                name="Dentists"
                                stroke={COLORS.dentists}
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
};
```

```typescript
// src/components/analytics/ProfessionalDistributionChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface DistributionData {
    name: string;
    value: number;
    color: string;
}

interface ProfessionalDistributionChartProps {
    data: DistributionData[];
    title?: string;
}

export const ProfessionalDistributionChart: React.FC<ProfessionalDistributionChartProps> = ({
    data,
    title = 'Professional Distribution'
}) => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
                <Box sx={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={150}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
};
```

### 5.4 Backend Analytics API

```typescript
// src/controllers/analytics.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AnalyticsService } from '../services/analytics.service';

@Controller('analytics')
@UseGuards(AuthGuard, RolesGuard)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    @Get('registration-trends')
    @Roles('system_admin', 'registrar')
    async getRegistrationTrends(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('granularity') granularity: 'day' | 'week' | 'month' = 'day'
    ) {
        return this.analyticsService.getRegistrationTrends(startDate, endDate, granularity);
    }

    @Get('professional-distribution')
    @Roles('system_admin', 'registrar')
    async getProfessionalDistribution() {
        return this.analyticsService.getProfessionalDistribution();
    }

    @Get('geographic-distribution')
    @Roles('system_admin', 'registrar')
    async getGeographicDistribution() {
        return this.analyticsService.getGeographicDistribution();
    }

    @Get('verification-stats')
    @Roles('system_admin', 'registrar')
    async getVerificationStats(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string
    ) {
        return this.analyticsService.getVerificationStats(startDate, endDate);
    }

    @Get('expiring-credentials')
    @Roles('system_admin', 'registrar')
    async getExpiringCredentials(@Query('days') days: number = 30) {
        return this.analyticsService.getExpiringCredentials(days);
    }
}
```

### 5.5 Best Practices

| Practice | Description |
|----------|-------------|
| **Data Aggregation** | Pre-aggregate data on the backend to reduce query complexity and improve dashboard performance. |
| **Caching** | Implement caching for analytics queries with appropriate TTL to reduce database load. |
| **Pagination** | Use pagination for large datasets (e.g., expiring credentials table) to improve load times. |
| **Export Functionality** | Provide options to export charts and data in multiple formats (CSV, PDF, Excel). |
| **Responsive Design** | Ensure charts are responsive and readable on different screen sizes. |
| **Data Privacy** | Aggregate and anonymize data to protect individual privacy while providing useful insights. |

---

## 6. Implementation Roadmap

The following roadmap outlines the recommended implementation order for the enhancements:

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 1: Authentication** | 2 weeks | Keycloak SSO integration across all portals |
| **Phase 2: Real-time Features** | 2 weeks | WebSocket server, notification system |
| **Phase 3: Document Management** | 2 weeks | Drag-and-drop upload, document preview, virus scanning |
| **Phase 4: Analytics Dashboard** | 2 weeks | Charts, metrics, export functionality |
| **Phase 5: Mobile App** | 4 weeks | React Native app with QR scanning, digital wallet |
| **Phase 6: Testing & Deployment** | 2 weeks | End-to-end testing, security audit, production deployment |

**Total Estimated Duration:** 14 weeks

---

## 7. References

[1] React Native VisionCamera. (n.d.). *QR/Barcode Scanning*. Retrieved from https://react-native-vision-camera.com/docs/guides/code-scanning

[2] Expo. (n.d.). *SecureStore*. Retrieved from https://docs.expo.dev/versions/latest/sdk/secure-store/

[3] Marmelab. (n.d.). *ra-keycloak: An auth provider for react-admin*. Retrieved from https://github.com/marmelab/ra-keycloak

[4] Keycloak. (n.d.). *Keycloak Documentation*. Retrieved from https://www.keycloak.org/documentation

[5] Socket.IO. (n.d.). *Socket.IO Documentation*. Retrieved from https://socket.io/docs/v4/

[6] Sunbird RC. (n.d.). *Frontend Setup Guide*. Retrieved from https://docs.sunbirdrc.dev/use/developers-guide/setup-the-frontend

---

**Document End**

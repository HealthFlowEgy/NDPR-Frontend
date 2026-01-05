import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <img src="assets/healthflow-logo.png" alt="HealthFlow" class="logo">
          <span class="brand">HealthFlow</span>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Overview</span>
          </a>
          <a mat-list-item routerLink="/wallet" routerLinkActive="active">
            <mat-icon matListItemIcon>account_balance_wallet</mat-icon>
            <span matListItemTitle>Digital Wallet</span>
          </a>
          <a mat-list-item routerLink="/credentials" routerLinkActive="active">
            <mat-icon matListItemIcon>verified</mat-icon>
            <span matListItemTitle>Credentials</span>
          </a>
          <a mat-list-item routerLink="/signing" routerLinkActive="active">
            <mat-icon matListItemIcon>draw</mat-icon>
            <span matListItemTitle>Document Signing</span>
          </a>
          <a mat-list-item routerLink="/identity" routerLinkActive="active">
            <mat-icon matListItemIcon>fingerprint</mat-icon>
            <span matListItemTitle>Digital Identity</span>
          </a>
          <a mat-list-item routerLink="/settings" routerLinkActive="active">
            <mat-icon matListItemIcon>settings</mat-icon>
            <span matListItemTitle>Settings</span>
          </a>
        </mat-nav-list>
        <div class="sidenav-footer">
          <button mat-button (click)="logout()">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </div>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar class="toolbar">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-title">Professional Dashboard</span>
          <span class="spacer"></span>
          <button mat-icon-button [matBadge]="notificationCount" matBadgeColor="warn" matBadgeSize="small">
            <mat-icon>notifications</mat-icon>
          </button>
          <button mat-button [matMenuTriggerFor]="userMenu" class="user-button">
            <div class="user-avatar">{{ userInitials }}</div>
            <span>{{ userName }}</span>
            <mat-icon>arrow_drop_down</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item routerLink="/identity">
              <mat-icon>fingerprint</mat-icon>
              <span>Digital Identity</span>
            </button>
            <button mat-menu-item routerLink="/settings">
              <mat-icon>person</mat-icon>
              <span>Profile</span>
            </button>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </mat-toolbar>
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }
    .sidenav {
      width: 260px;
      background: #1e3a5f;
      color: white;
    }
    .sidenav-header {
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .logo {
      height: 40px;
    }
    .brand {
      font-size: 20px;
      font-weight: 600;
    }
    mat-nav-list a {
      color: rgba(255,255,255,0.8);
      margin: 4px 8px;
      border-radius: 8px;
    }
    mat-nav-list a:hover {
      background: rgba(255,255,255,0.1);
    }
    mat-nav-list a.active {
      background: rgba(201, 162, 39, 0.3);
      color: #c9a227;
    }
    .sidenav-footer {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 16px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    .sidenav-footer button {
      color: rgba(255,255,255,0.8);
      width: 100%;
      justify-content: flex-start;
    }
    .toolbar {
      background: white;
      color: #1e3a5f;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .toolbar-title {
      margin-left: 16px;
      font-weight: 500;
    }
    .spacer {
      flex: 1;
    }
    .user-button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #c9a227;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 12px;
    }
    .main-content {
      padding: 24px;
      background: #f5f7fa;
      min-height: calc(100vh - 64px);
    }
  `]
})
export class AppComponent implements OnInit {
  userName = '';
  userInitials = '';
  notificationCount = 3;

  constructor(private keycloak: KeycloakService) {}

  async ngOnInit() {
    try {
      const profile = await this.keycloak.loadUserProfile();
      this.userName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'User';
      this.userInitials = this.userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    } catch (e) {
      this.userName = 'User';
      this.userInitials = 'U';
    }
  }

  logout() {
    this.keycloak.logout(window.location.origin);
  }
}

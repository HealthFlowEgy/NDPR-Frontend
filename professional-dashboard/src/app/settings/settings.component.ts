import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatDividerModule
  ],
  template: `
    <div class="settings-container">
      <h1>Settings</h1>

      <mat-card class="settings-section">
        <mat-card-header>
          <mat-icon mat-card-avatar>person</mat-icon>
          <mat-card-title>Profile Information</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>First Name</mat-label>
              <input matInput [(ngModel)]="profile.firstName">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Last Name</mat-label>
              <input matInput [(ngModel)]="profile.lastName">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput [(ngModel)]="profile.email" type="email">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Phone</mat-label>
              <input matInput [(ngModel)]="profile.phone">
            </mat-form-field>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary">Save Changes</button>
        </mat-card-actions>
      </mat-card>

      <mat-card class="settings-section">
        <mat-card-header>
          <mat-icon mat-card-avatar>notifications</mat-icon>
          <mat-card-title>Notifications</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="toggle-list">
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-label">Push Notifications</span>
                <span class="toggle-desc">Receive push notifications for signing requests</span>
              </div>
              <mat-slide-toggle [(ngModel)]="settings.pushNotifications"></mat-slide-toggle>
            </div>
            <mat-divider></mat-divider>
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-label">Email Notifications</span>
                <span class="toggle-desc">Receive email alerts for important updates</span>
              </div>
              <mat-slide-toggle [(ngModel)]="settings.emailNotifications"></mat-slide-toggle>
            </div>
            <mat-divider></mat-divider>
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-label">SMS Alerts</span>
                <span class="toggle-desc">Receive SMS for urgent signing requests</span>
              </div>
              <mat-slide-toggle [(ngModel)]="settings.smsAlerts"></mat-slide-toggle>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="settings-section">
        <mat-card-header>
          <mat-icon mat-card-avatar>security</mat-icon>
          <mat-card-title>Security</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="toggle-list">
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-label">Biometric Authentication</span>
                <span class="toggle-desc">Use fingerprint or face ID for signing</span>
              </div>
              <mat-slide-toggle [(ngModel)]="settings.biometricAuth"></mat-slide-toggle>
            </div>
            <mat-divider></mat-divider>
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-label">Two-Factor Authentication</span>
                <span class="toggle-desc">Add extra security to your account</span>
              </div>
              <mat-slide-toggle [(ngModel)]="settings.twoFactor"></mat-slide-toggle>
            </div>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-stroked-button color="primary">Change Password</button>
        </mat-card-actions>
      </mat-card>

      <mat-card class="settings-section danger">
        <mat-card-header>
          <mat-icon mat-card-avatar>warning</mat-icon>
          <mat-card-title>Danger Zone</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Permanently delete your account and all associated data.</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-stroked-button color="warn">Delete Account</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      color: #1e3a5f;
      margin-bottom: 24px;
    }
    .settings-section {
      margin-bottom: 24px;
      border-radius: 12px;
    }
    .settings-section.danger {
      border: 1px solid #ffcdd2;
    }
    mat-card-header mat-icon {
      background: #e3f2fd;
      color: #1976d2;
      padding: 8px;
      border-radius: 8px;
    }
    .danger mat-card-header mat-icon {
      background: #ffebee;
      color: #c62828;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      padding-top: 16px;
    }
    .toggle-list {
      padding-top: 8px;
    }
    .toggle-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
    }
    .toggle-info {
      display: flex;
      flex-direction: column;
    }
    .toggle-label {
      font-weight: 500;
      color: #333;
    }
    .toggle-desc {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }
    mat-card-actions {
      padding: 16px;
    }
  `]
})
export class SettingsComponent implements OnInit {
  profile = {
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  };

  settings = {
    pushNotifications: true,
    emailNotifications: true,
    smsAlerts: false,
    biometricAuth: true,
    twoFactor: false
  };

  constructor(private keycloak: KeycloakService) {}

  async ngOnInit() {
    try {
      const userProfile = await this.keycloak.loadUserProfile();
      this.profile.firstName = userProfile.firstName || '';
      this.profile.lastName = userProfile.lastName || '';
      this.profile.email = userProfile.email || '';
    } catch (e) {
      console.error('Failed to load profile', e);
    }
  }
}

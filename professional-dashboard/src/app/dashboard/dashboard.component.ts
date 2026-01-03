import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="dashboard">
      <div class="welcome-section">
        <div class="welcome-content">
          <h1>Welcome back, {{ userName }}!</h1>
          <p>Your professional profile is {{ profileCompletion }}% complete</p>
          <mat-progress-bar mode="determinate" [value]="profileCompletion"></mat-progress-bar>
        </div>
      </div>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon class="stat-icon credentials">verified</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ stats.activeCredentials }}</span>
              <span class="stat-label">Active Credentials</span>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon class="stat-icon attestations">fact_check</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ stats.attestations }}</span>
              <span class="stat-label">Attestations</span>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon class="stat-icon shares">share</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ stats.profileShares }}</span>
              <span class="stat-label">Profile Shares</span>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon class="stat-icon verifications">check_circle</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ stats.verifications }}</span>
              <span class="stat-label">Verifications</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="actions-section">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <button mat-raised-button color="primary" routerLink="/settings">
            <mat-icon>person</mat-icon>
            Update Profile
          </button>
          <button mat-raised-button routerLink="/credentials">
            <mat-icon>download</mat-icon>
            Download Credentials
          </button>
          <button mat-raised-button routerLink="/wallet">
            <mat-icon>share</mat-icon>
            Share Profile
          </button>
          <button mat-raised-button routerLink="/signing">
            <mat-icon>draw</mat-icon>
            Sign Documents
          </button>
        </div>
      </div>

      <div class="activity-section">
        <h2>Recent Activity</h2>
        <mat-card>
          <mat-card-content>
            <div class="activity-list">
              @for (activity of recentActivity; track activity.id) {
                <div class="activity-item">
                  <mat-icon [class]="activity.type">{{ activity.icon }}</mat-icon>
                  <div class="activity-info">
                    <span class="activity-title">{{ activity.title }}</span>
                    <span class="activity-date">{{ activity.date }}</span>
                  </div>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1200px;
      margin: 0 auto;
    }
    .welcome-section {
      background: linear-gradient(135deg, #1e3a5f, #2b5a8a);
      color: white;
      padding: 32px;
      border-radius: 16px;
      margin-bottom: 24px;
    }
    .welcome-content h1 {
      margin: 0 0 8px;
      font-size: 28px;
    }
    .welcome-content p {
      margin: 0 0 16px;
      opacity: 0.9;
    }
    mat-progress-bar {
      height: 8px;
      border-radius: 4px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
    }
    .stat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      padding: 12px;
      border-radius: 12px;
    }
    .stat-icon.credentials { background: #e3f2fd; color: #1976d2; }
    .stat-icon.attestations { background: #f3e5f5; color: #7b1fa2; }
    .stat-icon.shares { background: #e8f5e9; color: #388e3c; }
    .stat-icon.verifications { background: #fff3e0; color: #f57c00; }
    .stat-info {
      display: flex;
      flex-direction: column;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #1e3a5f;
    }
    .stat-label {
      color: #666;
      font-size: 14px;
    }
    .actions-section, .activity-section {
      margin-bottom: 24px;
    }
    .actions-section h2, .activity-section h2 {
      color: #1e3a5f;
      margin-bottom: 16px;
    }
    .actions-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .actions-grid button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .activity-list {
      display: flex;
      flex-direction: column;
    }
    .activity-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid #eee;
    }
    .activity-item:last-child {
      border-bottom: none;
    }
    .activity-item mat-icon {
      padding: 8px;
      border-radius: 8px;
    }
    .activity-item mat-icon.credential { background: #e3f2fd; color: #1976d2; }
    .activity-item mat-icon.verification { background: #e8f5e9; color: #388e3c; }
    .activity-item mat-icon.signing { background: #fff3e0; color: #f57c00; }
    .activity-info {
      display: flex;
      flex-direction: column;
    }
    .activity-title {
      font-weight: 500;
      color: #333;
    }
    .activity-date {
      font-size: 12px;
      color: #999;
    }
  `]
})
export class DashboardComponent implements OnInit {
  userName = 'Professional';
  profileCompletion = 85;
  
  stats = {
    activeCredentials: 3,
    attestations: 5,
    profileShares: 12,
    verifications: 28
  };

  recentActivity = [
    { id: 1, type: 'credential', icon: 'verified', title: 'Medical License renewed', date: '2 hours ago' },
    { id: 2, type: 'verification', icon: 'check_circle', title: 'Profile verified by Cairo Hospital', date: '1 day ago' },
    { id: 3, type: 'signing', icon: 'draw', title: 'Signed prescription document', date: '2 days ago' },
    { id: 4, type: 'credential', icon: 'verified', title: 'Specialty certification added', date: '1 week ago' }
  ];

  constructor(private keycloak: KeycloakService) {}

  async ngOnInit() {
    try {
      const profile = await this.keycloak.loadUserProfile();
      this.userName = `Dr. ${profile.firstName || ''} ${profile.lastName || ''}`.trim();
    } catch (e) {
      this.userName = 'Professional';
    }
  }
}

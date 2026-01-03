import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';

interface Credential {
  id: string;
  name: string;
  issuer: string;
  issuedDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'revoked';
  type: string;
}

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTabsModule, MatChipsModule],
  template: `
    <div class="wallet-container">
      <div class="wallet-header">
        <h1>Digital Wallet</h1>
        <p>Manage your verifiable credentials securely</p>
      </div>

      <mat-tab-group>
        <mat-tab label="All Credentials">
          <div class="credentials-grid">
            @for (cred of credentials; track cred.id) {
              <mat-card class="credential-card" [class]="cred.status">
                <div class="card-header">
                  <mat-icon class="type-icon">{{ getTypeIcon(cred.type) }}</mat-icon>
                  <mat-chip [class]="cred.status">{{ cred.status | titlecase }}</mat-chip>
                </div>
                <mat-card-content>
                  <h3>{{ cred.name }}</h3>
                  <p class="issuer">{{ cred.issuer }}</p>
                  <div class="dates">
                    <span><mat-icon>event</mat-icon> Issued: {{ cred.issuedDate }}</span>
                    <span><mat-icon>event_busy</mat-icon> Expires: {{ cred.expiryDate }}</span>
                  </div>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-button color="primary">
                    <mat-icon>visibility</mat-icon> View
                  </button>
                  <button mat-button>
                    <mat-icon>share</mat-icon> Share
                  </button>
                  <button mat-button>
                    <mat-icon>qr_code</mat-icon> QR
                  </button>
                </mat-card-actions>
              </mat-card>
            }
          </div>
        </mat-tab>
        <mat-tab label="Active">
          <div class="credentials-grid">
            @for (cred of activeCredentials; track cred.id) {
              <mat-card class="credential-card active">
                <div class="card-header">
                  <mat-icon class="type-icon">{{ getTypeIcon(cred.type) }}</mat-icon>
                  <mat-chip class="active">Active</mat-chip>
                </div>
                <mat-card-content>
                  <h3>{{ cred.name }}</h3>
                  <p class="issuer">{{ cred.issuer }}</p>
                </mat-card-content>
              </mat-card>
            }
          </div>
        </mat-tab>
        <mat-tab label="Expired">
          <div class="empty-state" *ngIf="expiredCredentials.length === 0">
            <mat-icon>check_circle</mat-icon>
            <p>No expired credentials</p>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .wallet-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .wallet-header {
      margin-bottom: 24px;
    }
    .wallet-header h1 {
      color: #1e3a5f;
      margin: 0;
    }
    .wallet-header p {
      color: #666;
      margin: 8px 0 0;
    }
    .credentials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
      padding: 20px 0;
    }
    .credential-card {
      border-radius: 16px;
      overflow: hidden;
    }
    .credential-card.active {
      border-left: 4px solid #4caf50;
    }
    .credential-card.expired {
      border-left: 4px solid #f44336;
      opacity: 0.7;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 16px 0;
    }
    .type-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #1e3a5f;
    }
    mat-chip.active {
      background: #e8f5e9 !important;
      color: #2e7d32 !important;
    }
    mat-chip.expired {
      background: #ffebee !important;
      color: #c62828 !important;
    }
    mat-card-content h3 {
      color: #1e3a5f;
      margin: 8px 0;
    }
    .issuer {
      color: #666;
      font-size: 14px;
    }
    .dates {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 12px;
      font-size: 12px;
      color: #888;
    }
    .dates span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .dates mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    mat-card-actions {
      padding: 8px 16px 16px;
    }
    .empty-state {
      text-align: center;
      padding: 60px;
      color: #666;
    }
    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #4caf50;
    }
  `]
})
export class WalletComponent {
  credentials: Credential[] = [
    {
      id: '1',
      name: 'Medical License',
      issuer: 'Egyptian Medical Syndicate',
      issuedDate: '2024-01-15',
      expiryDate: '2026-12-31',
      status: 'active',
      type: 'license'
    },
    {
      id: '2',
      name: 'Cardiology Certification',
      issuer: 'Egyptian Board of Medical Specialties',
      issuedDate: '2023-06-20',
      expiryDate: '2028-06-20',
      status: 'active',
      type: 'certification'
    },
    {
      id: '3',
      name: 'Hospital Privileges',
      issuer: 'Cairo University Hospital',
      issuedDate: '2024-03-01',
      expiryDate: '2025-03-01',
      status: 'active',
      type: 'privilege'
    }
  ];

  get activeCredentials() {
    return this.credentials.filter(c => c.status === 'active');
  }

  get expiredCredentials() {
    return this.credentials.filter(c => c.status === 'expired');
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'license': 'badge',
      'certification': 'workspace_premium',
      'privilege': 'local_hospital'
    };
    return icons[type] || 'verified';
  }
}

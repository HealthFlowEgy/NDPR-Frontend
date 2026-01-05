import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { KeycloakService } from 'keycloak-angular';
import { environment } from '../../environments/environment';

interface Credential {
  id: string;
  name: string;
  issuer: string;
  issuedDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'revoked' | 'pending';
  type: string;
  fields: { key: string; value: string }[];
  osid?: string;
}

interface RegistryEntity {
  osid: string;
  fullName?: string;
  email?: string;
  specialization?: string;
  qualification?: string;
  syndicateNumber?: string;
  nationalId?: string;
  yearsOfExperience?: string;
  status?: string;
  licenseNumber?: string;
  registrationNumber?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatTabsModule, 
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="wallet-container">
      <div class="wallet-header">
        <div class="header-content">
          <h1>Digital Wallet</h1>
          <p>Manage your verifiable credentials securely</p>
        </div>
        <button mat-raised-button color="primary" (click)="refreshCredentials()">
          <mat-icon>refresh</mat-icon>
          Refresh
        </button>
      </div>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading your credentials...</p>
      </div>

      <div class="error-container" *ngIf="error && !loading">
        <mat-icon>error_outline</mat-icon>
        <h3>Unable to load credentials</h3>
        <p>{{ error }}</p>
        <button mat-raised-button color="primary" (click)="refreshCredentials()">
          Try Again
        </button>
      </div>

      <mat-tab-group *ngIf="!loading && !error">
        <mat-tab label="All Credentials ({{ credentials.length }})">
          <div class="credentials-grid" *ngIf="credentials.length > 0">
            @for (cred of credentials; track cred.id) {
              <mat-card class="credential-card" [class]="cred.status">
                <div class="card-header">
                  <mat-icon class="type-icon">{{ getTypeIcon(cred.type) }}</mat-icon>
                  <mat-chip [class]="cred.status">{{ cred.status | titlecase }}</mat-chip>
                </div>
                <mat-card-content>
                  <h3>{{ cred.name }}</h3>
                  <p class="issuer">{{ cred.issuer }}</p>
                  <div class="credential-fields">
                    @for (field of cred.fields.slice(0, 4); track field.key) {
                      <div class="field">
                        <span class="field-label">{{ formatFieldLabel(field.key) }}</span>
                        <span class="field-value">{{ field.value }}</span>
                      </div>
                    }
                  </div>
                  <div class="dates" *ngIf="cred.issuedDate">
                    <span><mat-icon>event</mat-icon> Issued: {{ cred.issuedDate }}</span>
                    <span *ngIf="cred.expiryDate"><mat-icon>event_busy</mat-icon> Expires: {{ cred.expiryDate }}</span>
                  </div>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-button color="primary" (click)="viewCredential(cred)">
                    <mat-icon>visibility</mat-icon> View
                  </button>
                  <button mat-button (click)="shareCredential(cred)">
                    <mat-icon>share</mat-icon> Share
                  </button>
                  <button mat-button (click)="showQRCode(cred)">
                    <mat-icon>qr_code</mat-icon> QR
                  </button>
                </mat-card-actions>
              </mat-card>
            }
          </div>
          <div class="empty-state" *ngIf="credentials.length === 0">
            <mat-icon>folder_open</mat-icon>
            <h3>No credentials found</h3>
            <p>Your verifiable credentials will appear here once issued.</p>
          </div>
        </mat-tab>
        <mat-tab label="Active ({{ activeCredentials.length }})">
          <div class="credentials-grid" *ngIf="activeCredentials.length > 0">
            @for (cred of activeCredentials; track cred.id) {
              <mat-card class="credential-card active">
                <div class="card-header">
                  <mat-icon class="type-icon">{{ getTypeIcon(cred.type) }}</mat-icon>
                  <mat-chip class="active">Active</mat-chip>
                </div>
                <mat-card-content>
                  <h3>{{ cred.name }}</h3>
                  <p class="issuer">{{ cred.issuer }}</p>
                  <div class="credential-fields">
                    @for (field of cred.fields.slice(0, 3); track field.key) {
                      <div class="field">
                        <span class="field-label">{{ formatFieldLabel(field.key) }}</span>
                        <span class="field-value">{{ field.value }}</span>
                      </div>
                    }
                  </div>
                </mat-card-content>
              </mat-card>
            }
          </div>
          <div class="empty-state" *ngIf="activeCredentials.length === 0">
            <mat-icon>check_circle</mat-icon>
            <p>No active credentials</p>
          </div>
        </mat-tab>
        <mat-tab label="Pending ({{ pendingCredentials.length }})">
          <div class="credentials-grid" *ngIf="pendingCredentials.length > 0">
            @for (cred of pendingCredentials; track cred.id) {
              <mat-card class="credential-card pending">
                <div class="card-header">
                  <mat-icon class="type-icon">{{ getTypeIcon(cred.type) }}</mat-icon>
                  <mat-chip class="pending">Pending</mat-chip>
                </div>
                <mat-card-content>
                  <h3>{{ cred.name }}</h3>
                  <p class="issuer">{{ cred.issuer }}</p>
                </mat-card-content>
              </mat-card>
            }
          </div>
          <div class="empty-state" *ngIf="pendingCredentials.length === 0">
            <mat-icon>hourglass_empty</mat-icon>
            <p>No pending credentials</p>
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
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    .header-content h1 {
      color: #1e3a5f;
      margin: 0;
    }
    .header-content p {
      color: #666;
      margin: 8px 0 0;
    }
    .loading-container, .error-container {
      text-align: center;
      padding: 60px;
      color: #666;
    }
    .loading-container mat-spinner {
      margin: 0 auto 20px;
    }
    .error-container mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #f44336;
    }
    .error-container h3 {
      color: #1e3a5f;
      margin: 16px 0 8px;
    }
    .credentials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      padding: 20px 0;
    }
    .credential-card {
      border-radius: 16px;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .credential-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }
    .credential-card.active {
      border-left: 4px solid #4caf50;
    }
    .credential-card.pending {
      border-left: 4px solid #ff9800;
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
    mat-chip.pending {
      background: #fff3e0 !important;
      color: #e65100 !important;
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
      margin-bottom: 12px;
    }
    .credential-fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin: 12px 0;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 8px;
    }
    .field {
      display: flex;
      flex-direction: column;
    }
    .field-label {
      font-size: 11px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .field-value {
      font-size: 14px;
      color: #1e3a5f;
      font-weight: 500;
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
      color: #ccc;
    }
    .empty-state h3 {
      color: #1e3a5f;
      margin: 16px 0 8px;
    }
  `]
})
export class WalletComponent implements OnInit {
  credentials: Credential[] = [];
  loading = true;
  error: string | null = null;
  entityType = 'Doctor';

  constructor(
    private http: HttpClient,
    private keycloak: KeycloakService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    await this.loadEntityType();
    this.loadCredentials();
  }

  async loadEntityType() {
    try {
      const profile = await this.keycloak.loadUserProfile();
      const attributes = (profile as any).attributes;
      if (attributes && attributes.entity && attributes.entity.length > 0) {
        this.entityType = attributes.entity[0];
      }
    } catch (e) {
      console.log('Could not load entity type from profile, using default:', this.entityType);
    }
  }

  async loadCredentials() {
    this.loading = true;
    this.error = null;

    try {
      // Use the api.healthflow.tech proxy which handles CORS
      const apiUrl = `https://api.healthflow.tech/api/v1/${this.entityType}`;
      console.log('Fetching credentials from:', apiUrl);
      
      this.http.get<RegistryEntity[]>(apiUrl)
        .subscribe({
          next: (data) => {
            console.log('Credentials loaded:', data);
            this.credentials = this.transformToCredentials(data);
            this.loading = false;
          },
          error: (err) => {
            console.error('Error loading credentials:', err);
            this.error = `Failed to load credentials: ${err.message || err.statusText || 'Unknown error'}`;
            this.loading = false;
          }
        });
    } catch (e: any) {
      console.error('Error in loadCredentials:', e);
      this.error = `Error: ${e.message || 'Unknown error'}`;
      this.loading = false;
    }
  }

  transformToCredentials(entities: RegistryEntity[]): Credential[] {
    return entities.map((entity, index) => {
      const fields: { key: string; value: string }[] = [];
      const excludedFields = ['osid', 'osOwner', '_osState', '_osCreatedAt', '_osUpdatedAt'];
      
      for (const [key, value] of Object.entries(entity)) {
        if (!excludedFields.includes(key) && value && typeof value !== 'object') {
          fields.push({ key, value: String(value) });
        }
      }

      const status = this.determineStatus(entity.status);
      
      return {
        id: entity.osid || String(index),
        name: `${this.entityType} Registration`,
        issuer: 'Egyptian Healthcare Professional Registry',
        issuedDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        status,
        type: this.entityType.toLowerCase(),
        fields,
        osid: entity.osid
      };
    });
  }

  determineStatus(status?: string): 'active' | 'expired' | 'revoked' | 'pending' {
    if (!status) return 'pending';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'active' || lowerStatus === 'approved') return 'active';
    if (lowerStatus === 'expired') return 'expired';
    if (lowerStatus === 'revoked' || lowerStatus === 'rejected') return 'revoked';
    return 'pending';
  }

  get activeCredentials() {
    return this.credentials.filter(c => c.status === 'active');
  }

  get pendingCredentials() {
    return this.credentials.filter(c => c.status === 'pending');
  }

  get expiredCredentials() {
    return this.credentials.filter(c => c.status === 'expired');
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'doctor': 'medical_services',
      'nurse': 'healing',
      'pharmacist': 'medication',
      'license': 'badge',
      'certification': 'workspace_premium',
      'privilege': 'local_hospital'
    };
    return icons[type.toLowerCase()] || 'verified';
  }

  formatFieldLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  refreshCredentials() {
    this.loadCredentials();
    this.snackBar.open('Refreshing credentials...', 'Close', { duration: 2000 });
  }

  viewCredential(cred: Credential) {
    this.snackBar.open(`Viewing ${cred.name}`, 'Close', { duration: 2000 });
    // TODO: Open detail dialog
  }

  shareCredential(cred: Credential) {
    this.snackBar.open('Share functionality coming soon', 'Close', { duration: 2000 });
  }

  showQRCode(cred: Credential) {
    this.snackBar.open('QR Code functionality coming soon', 'Close', { duration: 2000 });
  }
}

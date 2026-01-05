import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CredentialsService, Credential, CredentialVerification } from '../services/credentials.service';

@Component({
  selector: 'app-credentials',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatTableModule, 
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="credentials-container">
      <div class="page-header">
        <h1>My Credentials</h1>
        <button mat-raised-button color="primary" (click)="requestNewCredential()">
          <mat-icon>add</mat-icon>
          Request New Credential
        </button>
      </div>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading credentials...</p>
      </div>

      <mat-card *ngIf="!loading">
        <mat-card-content>
          <div *ngIf="credentials.length === 0" class="empty-state">
            <mat-icon>badge</mat-icon>
            <h3>No Credentials Found</h3>
            <p>You don't have any verifiable credentials yet. Request one to get started.</p>
          </div>

          <table mat-table [dataSource]="credentials" class="credentials-table" *ngIf="credentials.length > 0">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Credential</th>
              <td mat-cell *matCellDef="let cred">
                <div class="cred-name">
                  <mat-icon>{{ getCredentialIcon(cred) }}</mat-icon>
                  <span>{{ getCredentialName(cred) }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="issuer">
              <th mat-header-cell *matHeaderCellDef>Issuer</th>
              <td mat-cell *matCellDef="let cred">{{ getIssuerName(cred.issuer) }}</td>
            </ng-container>

            <ng-container matColumnDef="issued">
              <th mat-header-cell *matHeaderCellDef>Issued</th>
              <td mat-cell *matCellDef="let cred">{{ formatDate(cred.issuanceDate) }}</td>
            </ng-container>

            <ng-container matColumnDef="expires">
              <th mat-header-cell *matHeaderCellDef>Expires</th>
              <td mat-cell *matCellDef="let cred">{{ formatDate(cred.expirationDate) }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let cred">
                <mat-chip [class]="getStatusClass(cred)">{{ getStatusText(cred) }}</mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let cred">
                <button mat-icon-button color="primary" matTooltip="View Details" (click)="viewCredential(cred)">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Verify" (click)="verifyCredential(cred)" [disabled]="verifying[cred.id]">
                  <mat-icon *ngIf="!verifying[cred.id]">verified</mat-icon>
                  <mat-spinner *ngIf="verifying[cred.id]" diameter="20"></mat-spinner>
                </button>
                <button mat-icon-button matTooltip="Download" (click)="downloadCredential(cred)">
                  <mat-icon>download</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Share" (click)="shareCredential(cred)">
                  <mat-icon>share</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <!-- Verification Results Card -->
      <mat-card *ngIf="verificationResult" class="verification-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon [class]="verificationResult.status === 'ISSUED' ? 'success' : 'error'">
              {{ verificationResult.status === 'ISSUED' ? 'check_circle' : 'error' }}
            </mat-icon>
            Verification Result
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="verification-checks">
            <div *ngFor="let check of verificationResult.checks" class="check-item">
              <div class="check-row">
                <span>Active:</span>
                <mat-icon [class]="check.active === 'OK' ? 'success' : 'error'">
                  {{ check.active === 'OK' ? 'check' : 'close' }}
                </mat-icon>
              </div>
              <div class="check-row">
                <span>Not Revoked:</span>
                <mat-icon [class]="check.revoked === 'OK' ? 'success' : 'error'">
                  {{ check.revoked === 'OK' ? 'check' : 'close' }}
                </mat-icon>
              </div>
              <div class="check-row">
                <span>Not Expired:</span>
                <mat-icon [class]="check.expired === 'OK' ? 'success' : 'error'">
                  {{ check.expired === 'OK' ? 'check' : 'close' }}
                </mat-icon>
              </div>
              <div class="check-row">
                <span>Valid Proof:</span>
                <mat-icon [class]="check.proof === 'OK' ? 'success' : 'error'">
                  {{ check.proof === 'OK' ? 'check' : 'close' }}
                </mat-icon>
              </div>
            </div>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button (click)="verificationResult = null">Close</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .credentials-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .page-header h1 {
      color: #1e3a5f;
      margin: 0;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      color: #666;
    }
    .empty-state {
      text-align: center;
      padding: 48px;
      color: #666;
    }
    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
    }
    .credentials-table {
      width: 100%;
    }
    .cred-name {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .cred-name mat-icon {
      color: #1e3a5f;
    }
    mat-chip.active, mat-chip.issued {
      background: #e8f5e9 !important;
      color: #2e7d32 !important;
    }
    mat-chip.pending {
      background: #fff3e0 !important;
      color: #ef6c00 !important;
    }
    mat-chip.expired, mat-chip.revoked {
      background: #ffebee !important;
      color: #c62828 !important;
    }
    .verification-card {
      margin-top: 24px;
    }
    .verification-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .verification-checks {
      padding: 16px 0;
    }
    .check-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .check-row:last-child {
      border-bottom: none;
    }
    mat-icon.success {
      color: #2e7d32;
    }
    mat-icon.error {
      color: #c62828;
    }
  `]
})
export class CredentialsComponent implements OnInit {
  private credentialsService = inject(CredentialsService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  displayedColumns = ['name', 'issuer', 'issued', 'expires', 'status', 'actions'];
  credentials: Credential[] = [];
  loading = true;
  verifying: { [key: string]: boolean } = {};
  verificationResult: CredentialVerification | null = null;

  async ngOnInit() {
    await this.loadCredentials();
  }

  async loadCredentials() {
    this.loading = true;
    try {
      const credentials$ = await this.credentialsService.getCredentials();
      credentials$.subscribe({
        next: (creds) => {
          this.credentials = creds;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading credentials:', err);
          this.loading = false;
          this.snackBar.open('Failed to load credentials', 'Close', { duration: 3000 });
        }
      });
    } catch (err) {
      console.error('Error:', err);
      this.loading = false;
    }
  }

  getCredentialIcon(cred: Credential): string {
    const type = cred.type.find(t => t !== 'VerifiableCredential') || 'VerifiableCredential';
    const iconMap: { [key: string]: string } = {
      'MedicalLicenseCredential': 'badge',
      'DoctorCredential': 'medical_services',
      'NurseCredential': 'healing',
      'PharmacistCredential': 'medication',
      'FacilityCredential': 'local_hospital',
      'VerifiableCredential': 'verified'
    };
    return iconMap[type] || 'verified';
  }

  getCredentialName(cred: Credential): string {
    const type = cred.type.find(t => t !== 'VerifiableCredential') || 'Verifiable Credential';
    return type.replace(/Credential$/, '').replace(/([A-Z])/g, ' $1').trim();
  }

  getIssuerName(issuer: string): string {
    if (issuer.startsWith('did:')) {
      return 'HealthFlow Authority';
    }
    return issuer;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  }

  getStatusClass(cred: Credential): string {
    if (cred.status) {
      return cred.status.toLowerCase();
    }
    const now = new Date();
    const expiry = new Date(cred.expirationDate);
    if (expiry < now) return 'expired';
    return 'active';
  }

  getStatusText(cred: Credential): string {
    if (cred.status) {
      return cred.status;
    }
    const now = new Date();
    const expiry = new Date(cred.expirationDate);
    if (expiry < now) return 'Expired';
    return 'Active';
  }

  async verifyCredential(cred: Credential) {
    this.verifying[cred.id] = true;
    this.verificationResult = null;
    
    try {
      const result$ = await this.credentialsService.verifyCredential(cred.id);
      result$.subscribe({
        next: (result) => {
          this.verifying[cred.id] = false;
          if (result) {
            this.verificationResult = result;
            this.snackBar.open(
              result.status === 'ISSUED' ? 'Credential verified successfully!' : 'Credential verification failed',
              'Close',
              { duration: 3000 }
            );
          }
        },
        error: (err) => {
          this.verifying[cred.id] = false;
          this.snackBar.open('Verification failed', 'Close', { duration: 3000 });
        }
      });
    } catch (err) {
      this.verifying[cred.id] = false;
      this.snackBar.open('Verification failed', 'Close', { duration: 3000 });
    }
  }

  viewCredential(cred: Credential) {
    console.log('View credential:', cred);
    // TODO: Open dialog with full credential details
  }

  downloadCredential(cred: Credential) {
    const blob = new Blob([JSON.stringify(cred, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credential-${cred.id.split(':').pop()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.snackBar.open('Credential downloaded', 'Close', { duration: 2000 });
  }

  shareCredential(cred: Credential) {
    // TODO: Implement sharing functionality
    this.snackBar.open('Sharing coming soon', 'Close', { duration: 2000 });
  }

  requestNewCredential() {
    // TODO: Open dialog to request new credential
    this.snackBar.open('Request credential feature coming soon', 'Close', { duration: 2000 });
  }
}

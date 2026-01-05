import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { environment } from '../../environments/environment';
import { CredentialsService, Credential, CredentialVerification } from '../services/credentials.service';
import { IdentityService } from '../services/identity.service';

@Component({
  selector: 'app-credentials',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatTableModule, 
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="credentials-container">
      <div class="page-header">
        <h1>My Credentials</h1>
        <button mat-raised-button color="primary" (click)="showRequestForm = true" *ngIf="!showRequestForm">
          <mat-icon>add</mat-icon>
          Request New Credential
        </button>
      </div>

      <!-- Request New Credential Form -->
      <mat-card *ngIf="showRequestForm" class="request-form-card">
        <mat-card-header>
          <mat-card-title>Request New Credential</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p class="form-description">
            Request a verifiable credential based on your registered professional information.
            This credential will be digitally signed and can be verified by third parties.
          </p>
          
          <div class="form-fields">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Credential Type</mat-label>
              <mat-select [(ngModel)]="requestForm.credentialType">
                <mat-option value="MedicalLicenseCredential">Medical License Credential</mat-option>
                <mat-option value="DoctorCredential">Doctor Credential</mat-option>
                <mat-option value="NurseCredential">Nurse Credential</mat-option>
                <mat-option value="PharmacistCredential">Pharmacist Credential</mat-option>
                <mat-option value="DentistCredential">Dentist Credential</mat-option>
                <mat-option value="PhysiotherapistCredential">Physiotherapist Credential</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Professional Name</mat-label>
              <input matInput [(ngModel)]="requestForm.professionalName" placeholder="Dr. John Smith">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>License Number</mat-label>
              <input matInput [(ngModel)]="requestForm.licenseNumber" placeholder="MED-2024-12345">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Specialty</mat-label>
              <input matInput [(ngModel)]="requestForm.specialty" placeholder="Cardiology">
            </mat-form-field>
          </div>

          <div *ngIf="!userDid" class="did-warning">
            <mat-icon>warning</mat-icon>
            <span>You need a Digital Identity (DID) to receive credentials. 
              <a routerLink="/identity">Generate one here</a>
            </span>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button (click)="showRequestForm = false">Cancel</button>
          <button mat-raised-button color="primary" 
                  (click)="submitCredentialRequest()" 
                  [disabled]="issuingCredential || !userDid">
            <mat-spinner *ngIf="issuingCredential" diameter="20"></mat-spinner>
            <span *ngIf="!issuingCredential">Submit Request</span>
          </button>
        </mat-card-actions>
      </mat-card>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading credentials...</p>
      </div>

      <mat-card *ngIf="!loading && !showRequestForm">
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

      <!-- Credential Detail View -->
      <mat-card *ngIf="selectedCredential" class="credential-detail-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>{{ getCredentialIcon(selectedCredential) }}</mat-icon>
            {{ getCredentialName(selectedCredential) }}
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="detail-section">
            <h4>Credential Information</h4>
            <div class="detail-row">
              <span class="label">ID:</span>
              <span class="value">{{ selectedCredential.id }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Issuer:</span>
              <span class="value">{{ selectedCredential.issuer }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Issued:</span>
              <span class="value">{{ formatDate(selectedCredential.issuanceDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Expires:</span>
              <span class="value">{{ formatDate(selectedCredential.expirationDate) }}</span>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>Subject Information</h4>
            <div *ngFor="let key of getSubjectKeys(selectedCredential)" class="detail-row">
              <span class="label">{{ formatKey(key) }}:</span>
              <span class="value">{{ selectedCredential.credentialSubject[key] }}</span>
            </div>
          </div>

          <div class="detail-section" *ngIf="selectedCredential.proof">
            <h4>Proof</h4>
            <div class="detail-row">
              <span class="label">Type:</span>
              <span class="value">{{ selectedCredential.proof.type }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Created:</span>
              <span class="value">{{ formatDate(selectedCredential.proof.created) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Verification Method:</span>
              <span class="value code">{{ selectedCredential.proof.verificationMethod }}</span>
            </div>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button (click)="selectedCredential = null">Close</button>
          <button mat-raised-button color="primary" (click)="downloadCredential(selectedCredential)">
            <mat-icon>download</mat-icon> Download
          </button>
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
    .verification-card, .credential-detail-card {
      margin-top: 24px;
    }
    .verification-card mat-card-title, .credential-detail-card mat-card-title {
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
    .request-form-card {
      margin-bottom: 24px;
    }
    .form-description {
      color: #666;
      margin-bottom: 24px;
    }
    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .full-width {
      width: 100%;
    }
    .did-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background: #fff3e0;
      border-radius: 8px;
      margin-top: 16px;
      color: #ef6c00;
    }
    .did-warning a {
      color: #1e3a5f;
      font-weight: 500;
    }
    .detail-section {
      margin-bottom: 24px;
    }
    .detail-section h4 {
      color: #1e3a5f;
      margin-bottom: 12px;
      border-bottom: 1px solid #eee;
      padding-bottom: 8px;
    }
    .detail-row {
      display: flex;
      padding: 8px 0;
    }
    .detail-row .label {
      font-weight: 500;
      width: 180px;
      color: #666;
    }
    .detail-row .value {
      flex: 1;
      word-break: break-all;
    }
    .detail-row .value.code {
      font-family: monospace;
      font-size: 12px;
      background: #f5f5f5;
      padding: 4px 8px;
      border-radius: 4px;
    }
  `]
})
export class CredentialsComponent implements OnInit {
  private credentialsService = inject(CredentialsService);
  private identityService = inject(IdentityService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private http = inject(HttpClient);
  private keycloak = inject(KeycloakService);

  displayedColumns = ['name', 'issuer', 'issued', 'expires', 'status', 'actions'];
  credentials: Credential[] = [];
  loading = true;
  verifying: { [key: string]: boolean } = {};
  verificationResult: CredentialVerification | null = null;
  selectedCredential: Credential | null = null;
  
  // Request form
  showRequestForm = false;
  issuingCredential = false;
  userDid: string | null = null;
  requestForm = {
    credentialType: 'MedicalLicenseCredential',
    professionalName: '',
    licenseNumber: '',
    specialty: ''
  };

  async ngOnInit() {
    await this.loadCredentials();
    await this.loadUserDid();
  }

  async loadUserDid() {
    try {
      // Check if user has a DID stored in localStorage
      const storedDid = localStorage.getItem('userDid');
      if (storedDid) {
        this.userDid = storedDid;
      }
    } catch (err) {
      console.error('Error loading user DID:', err);
    }
  }

  async loadCredentials() {
    this.loading = true;
    try {
      // Try to load from credentials service
      const credentials$ = await this.credentialsService.getCredentials();
      credentials$.subscribe({
        next: (creds) => {
          this.credentials = creds;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading credentials:', err);
          // Try to load from localStorage as fallback
          const storedCreds = localStorage.getItem('userCredentials');
          if (storedCreds) {
            this.credentials = JSON.parse(storedCreds);
          }
          this.loading = false;
        }
      });
    } catch (err) {
      console.error('Error:', err);
      this.loading = false;
    }
  }

  async submitCredentialRequest() {
    if (!this.userDid) {
      this.snackBar.open('Please generate a Digital Identity first', 'Go to Identity', { duration: 5000 });
      return;
    }

    this.issuingCredential = true;
    
    try {
      // Generate issuer DID
      const issuerDid$ = await this.identityService.generateDID('Ed25519');
      issuerDid$.subscribe({
        next: async (issuerDid: any) => {
          if (!issuerDid) {
            this.snackBar.open('Failed to generate issuer DID', 'Close', { duration: 3000 });
            this.issuingCredential = false;
            return;
          }

          const now = new Date();
          const expiryDate = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
          
          const credentialRequest = {
            credential: {
              '@context': [
                'https://www.w3.org/2018/credentials/v1',
                'https://registry.healthflow.tech/context/healthflow-v1.jsonld'
              ],
              type: ['VerifiableCredential', this.requestForm.credentialType],
              issuer: issuerDid.id,
              issuanceDate: now.toISOString(),
              expirationDate: expiryDate.toISOString(),
              credentialSubject: {
                id: this.userDid || '',
                professionalName: this.requestForm.professionalName,
                licenseNumber: this.requestForm.licenseNumber,
                specialty: this.requestForm.specialty
              }
            },
            credentialSchemaId: 'did:schema:healthflow:MedicalLicenseCredential',
            credentialSchemaVersion: '1.0.0'
          };

          const credential$ = await this.credentialsService.issueCredential(credentialRequest);
          credential$.subscribe({
            next: (credential) => {
              if (credential) {
                this.credentials.push(credential);
                // Store in localStorage as backup
                localStorage.setItem('userCredentials', JSON.stringify(this.credentials));
                this.snackBar.open('Credential issued successfully!', 'Close', { duration: 3000 });
                this.showRequestForm = false;
                this.resetRequestForm();
              } else {
                this.snackBar.open('Failed to issue credential', 'Close', { duration: 3000 });
              }
              this.issuingCredential = false;
            },
error: (err: any) => {
          console.error('Error issuing credential:', err);
              this.snackBar.open('Failed to issue credential: ' + (err.message || 'Unknown error'), 'Close', { duration: 5000 });
              this.issuingCredential = false;
            }
          });
        },
        error: (err: any) => {
          console.error('Error generating issuer DID:', err);
          this.snackBar.open('Failed to generate issuer DID', 'Close', { duration: 3000 });
          this.issuingCredential = false;
        }
      });
    } catch (err) {
      console.error('Error:', err);
      this.snackBar.open('An error occurred', 'Close', { duration: 3000 });
      this.issuingCredential = false;
    }
  }

  resetRequestForm() {
    this.requestForm = {
      credentialType: 'MedicalLicenseCredential',
      professionalName: '',
      licenseNumber: '',
      specialty: ''
    };
  }

  getCredentialIcon(cred: Credential): string {
    const type = cred.type.find(t => t !== 'VerifiableCredential') || 'VerifiableCredential';
    const iconMap: { [key: string]: string } = {
      'MedicalLicenseCredential': 'badge',
      'DoctorCredential': 'medical_services',
      'NurseCredential': 'healing',
      'PharmacistCredential': 'medication',
      'DentistCredential': 'dentistry',
      'PhysiotherapistCredential': 'accessibility',
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

  getSubjectKeys(cred: Credential): string[] {
    return Object.keys(cred.credentialSubject).filter(k => k !== 'id');
  }

  formatKey(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
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
    this.selectedCredential = cred;
  }

  downloadCredential(cred: Credential) {
    const blob = new Blob([JSON.stringify(cred, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credential-${cred.id.split(':').pop() || 'download'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.snackBar.open('Credential downloaded', 'Close', { duration: 2000 });
  }

  shareCredential(cred: Credential) {
    // Copy credential ID to clipboard
    navigator.clipboard.writeText(cred.id).then(() => {
      this.snackBar.open('Credential ID copied to clipboard', 'Close', { duration: 2000 });
    }).catch(() => {
      this.snackBar.open('Failed to copy', 'Close', { duration: 2000 });
    });
  }
}

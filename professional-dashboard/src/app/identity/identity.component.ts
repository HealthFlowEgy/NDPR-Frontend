import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { IdentityService, DIDDocument } from '../services/identity.service';

@Component({
  selector: 'app-identity',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatExpansionModule,
    MatChipsModule
  ],
  template: `
    <div class="identity-container">
      <div class="page-header">
        <h1>Digital Identity</h1>
        <p>Manage your Decentralized Identifiers (DIDs) for secure credential management</p>
      </div>

      <mat-card class="info-card">
        <mat-card-content>
          <div class="info-row">
            <mat-icon>info</mat-icon>
            <div>
              <h4>What is a DID?</h4>
              <p>A Decentralized Identifier (DID) is a globally unique identifier that enables verifiable, 
              decentralized digital identity. Your DID is used to sign and verify credentials.</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading identity information...</p>
      </div>

      <div *ngIf="!loading">
        <!-- Current DID -->
        <mat-card *ngIf="currentDID" class="did-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>fingerprint</mat-icon>
            <mat-card-title>Your Digital Identity</mat-card-title>
            <mat-card-subtitle>Active DID</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="did-display">
              <code>{{ currentDID.id }}</code>
              <button mat-icon-button matTooltip="Copy DID" (click)="copyDID(currentDID.id)">
                <mat-icon>content_copy</mat-icon>
              </button>
            </div>

            <mat-expansion-panel class="details-panel">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon>key</mat-icon>
                  Verification Methods
                </mat-panel-title>
              </mat-expansion-panel-header>
              <div class="verification-methods">
                <div *ngFor="let method of currentDID.verificationMethod" class="method-item">
                  <div class="method-header">
                    <mat-chip>{{ method.type }}</mat-chip>
                    <span class="method-id">{{ method.id }}</span>
                  </div>
                  <div class="method-details" *ngIf="method.publicKeyMultibase">
                    <strong>Public Key:</strong>
                    <code>{{ method.publicKeyMultibase | slice:0:40 }}...</code>
                  </div>
                </div>
              </div>
            </mat-expansion-panel>

            <mat-expansion-panel class="details-panel">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon>security</mat-icon>
                  Capabilities
                </mat-panel-title>
              </mat-expansion-panel-header>
              <div class="capabilities">
                <div class="capability-item">
                  <mat-icon>check_circle</mat-icon>
                  <span>Authentication</span>
                </div>
                <div class="capability-item">
                  <mat-icon>check_circle</mat-icon>
                  <span>Assertion (Signing)</span>
                </div>
              </div>
            </mat-expansion-panel>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" (click)="viewFullDID()">
              <mat-icon>code</mat-icon>
              View Full DID Document
            </button>
            <button mat-button (click)="downloadDID()">
              <mat-icon>download</mat-icon>
              Download
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- No DID -->
        <mat-card *ngIf="!currentDID" class="no-did-card">
          <mat-card-content>
            <div class="empty-state">
              <mat-icon>fingerprint</mat-icon>
              <h3>No Digital Identity Found</h3>
              <p>Generate a new DID to start using verifiable credentials</p>
              <button mat-raised-button color="primary" 
                      (click)="generateDID()" 
                      [disabled]="generating">
                <mat-icon *ngIf="!generating">add</mat-icon>
                <mat-spinner *ngIf="generating" diameter="20"></mat-spinner>
                Generate New DID
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Service Status -->
        <mat-card class="status-card">
          <mat-card-header>
            <mat-card-title>Service Status</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="status-row">
              <span>Identity Service</span>
              <mat-chip [class]="serviceStatus.identity ? 'online' : 'offline'">
                {{ serviceStatus.identity ? 'Online' : 'Offline' }}
              </mat-chip>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .identity-container {
      max-width: 800px;
      margin: 0 auto;
    }
    .page-header {
      margin-bottom: 24px;
    }
    .page-header h1 {
      color: #1e3a5f;
      margin: 0;
    }
    .page-header p {
      color: #666;
      margin: 8px 0 0;
    }
    .info-card {
      margin-bottom: 24px;
      background: #e3f2fd;
    }
    .info-row {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }
    .info-row mat-icon {
      color: #1976d2;
    }
    .info-row h4 {
      margin: 0 0 8px;
      color: #1e3a5f;
    }
    .info-row p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      color: #666;
    }
    .did-card {
      margin-bottom: 24px;
    }
    .did-card mat-card-avatar {
      background: #1e3a5f;
      color: white;
    }
    .did-display {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      margin: 16px 0;
    }
    .did-display code {
      flex: 1;
      font-family: monospace;
      font-size: 14px;
      word-break: break-all;
    }
    .details-panel {
      margin-top: 16px;
    }
    .details-panel mat-panel-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .verification-methods {
      padding: 16px 0;
    }
    .method-item {
      padding: 12px;
      background: #f9f9f9;
      border-radius: 8px;
      margin-bottom: 8px;
    }
    .method-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    .method-id {
      font-size: 12px;
      color: #666;
      word-break: break-all;
    }
    .method-details {
      font-size: 13px;
    }
    .method-details code {
      font-family: monospace;
      background: #eee;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .capabilities {
      padding: 16px 0;
    }
    .capability-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
    }
    .capability-item mat-icon {
      color: #2e7d32;
    }
    .no-did-card .empty-state {
      text-align: center;
      padding: 48px;
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
    .empty-state p {
      color: #666;
      margin-bottom: 24px;
    }
    .status-card {
      margin-top: 24px;
    }
    .status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }
    mat-chip.online {
      background: #e8f5e9 !important;
      color: #2e7d32 !important;
    }
    mat-chip.offline {
      background: #ffebee !important;
      color: #c62828 !important;
    }
  `]
})
export class IdentityComponent implements OnInit {
  private identityService = inject(IdentityService);
  private snackBar = inject(MatSnackBar);

  currentDID: DIDDocument | null = null;
  loading = true;
  generating = false;
  serviceStatus = {
    identity: false
  };

  async ngOnInit() {
    await this.checkServiceStatus();
    await this.loadIdentity();
  }

  async checkServiceStatus() {
    this.identityService.checkHealth().subscribe({
      next: (result) => {
        this.serviceStatus.identity = result?.status === 'ok';
      },
      error: () => {
        this.serviceStatus.identity = false;
      }
    });
  }

  async loadIdentity() {
    this.loading = true;
    // In a real app, we would load the user's existing DID from storage or registry
    // For now, we'll just check if the service is available
    this.loading = false;
  }

  async generateDID() {
    this.generating = true;
    try {
      const did$ = await this.identityService.generateDID('Ed25519');
      did$.subscribe({
        next: (dids) => {
          this.generating = false;
          if (dids && dids.length > 0) {
            this.currentDID = dids[0];
            this.snackBar.open('DID generated successfully!', 'Close', { duration: 3000 });
          } else {
            this.snackBar.open('Failed to generate DID', 'Close', { duration: 3000 });
          }
        },
        error: (err) => {
          this.generating = false;
          console.error('Error generating DID:', err);
          this.snackBar.open('Failed to generate DID', 'Close', { duration: 3000 });
        }
      });
    } catch (err) {
      this.generating = false;
      this.snackBar.open('Failed to generate DID', 'Close', { duration: 3000 });
    }
  }

  copyDID(did: string) {
    navigator.clipboard.writeText(did);
    this.snackBar.open('DID copied to clipboard', 'Close', { duration: 2000 });
  }

  viewFullDID() {
    if (this.currentDID) {
      console.log('Full DID Document:', this.currentDID);
      // TODO: Open dialog with full DID document
    }
  }

  downloadDID() {
    if (this.currentDID) {
      const blob = new Blob([JSON.stringify(this.currentDID, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `did-${this.currentDID.id.split(':').pop()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.snackBar.open('DID document downloaded', 'Close', { duration: 2000 });
    }
  }
}

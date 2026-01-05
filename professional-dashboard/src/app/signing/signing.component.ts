import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SigningService, SigningRequest, SigningHistory, SigningStats } from '../services/signing.service';

@Component({
  selector: 'app-signing',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatTabsModule, 
    MatChipsModule, 
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="signing-container">
      <div class="page-header">
        <h1>Document Signing</h1>
        <p>Review and sign documents remotely using your digital identity</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-row" *ngIf="stats">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value">{{ stats.total_pending }}</div>
            <div class="stat-label">Pending</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value success">{{ stats.total_signed }}</div>
            <div class="stat-label">Signed</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value warn">{{ stats.total_rejected }}</div>
            <div class="stat-label">Rejected</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value">{{ stats.total_requests }}</div>
            <div class="stat-label">Total</div>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading signing requests...</p>
      </div>

      <mat-tab-group *ngIf="!loading">
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>pending_actions</mat-icon>
            Pending ({{ pendingRequests.length }})
          </ng-template>
          <div class="requests-list">
            @for (request of pendingRequests; track request.id) {
              <mat-card class="request-card">
                <mat-card-content>
                  <div class="request-header">
                    <mat-icon class="doc-icon">description</mat-icon>
                    <div class="request-info">
                      <h3>{{ request.document_type }}</h3>
                      <p>Requested by: {{ request.requester_name }}</p>
                      <p *ngIf="request.requester_organization" class="org">{{ request.requester_organization }}</p>
                      <span class="time">{{ formatTimeAgo(request.created_at) }}</span>
                    </div>
                    <mat-chip class="pending">Pending</mat-chip>
                  </div>
                  <div class="request-details">
                    <span><mat-icon>schedule</mat-icon> Expires: {{ formatTimeRemaining(request.expires_at) }}</span>
                    <span *ngIf="request.purpose"><mat-icon>info</mat-icon> {{ request.purpose }}</span>
                  </div>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-button color="primary" (click)="previewRequest(request)">
                    <mat-icon>visibility</mat-icon> Preview
                  </button>
                  <button mat-raised-button color="primary" 
                          (click)="approveRequest(request)" 
                          [disabled]="processing[request.id]">
                    <mat-icon *ngIf="!processing[request.id]">check</mat-icon>
                    <mat-spinner *ngIf="processing[request.id]" diameter="20"></mat-spinner>
                    Sign
                  </button>
                  <button mat-button color="warn" 
                          (click)="rejectRequest(request)"
                          [disabled]="processing[request.id]">
                    <mat-icon>close</mat-icon> Reject
                  </button>
                </mat-card-actions>
              </mat-card>
            }
            @if (pendingRequests.length === 0) {
              <div class="empty-state">
                <mat-icon>inbox</mat-icon>
                <p>No pending signing requests</p>
              </div>
            }
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>history</mat-icon>
            History
          </ng-template>
          <div class="requests-list">
            @for (item of historyItems; track item.id) {
              <mat-card class="request-card">
                <mat-card-content>
                  <div class="request-header">
                    <mat-icon class="doc-icon">description</mat-icon>
                    <div class="request-info">
                      <h3>{{ item.document_type }}</h3>
                      <p>{{ item.requester_name }}</p>
                      <span class="time">{{ formatDate(item.action_timestamp) }}</span>
                    </div>
                    <mat-chip [class]="item.action">{{ item.action | titlecase }}</mat-chip>
                  </div>
                  <div class="request-details" *ngIf="item.biometric_verified">
                    <span><mat-icon>fingerprint</mat-icon> Biometric verified</span>
                  </div>
                </mat-card-content>
              </mat-card>
            }
            @if (historyItems.length === 0) {
              <div class="empty-state">
                <mat-icon>history</mat-icon>
                <p>No signing history yet</p>
              </div>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .signing-container {
      max-width: 900px;
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
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      text-align: center;
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #1e3a5f;
    }
    .stat-value.success {
      color: #2e7d32;
    }
    .stat-value.warn {
      color: #ef6c00;
    }
    .stat-label {
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
    .requests-list {
      padding: 20px 0;
    }
    .request-card {
      margin-bottom: 16px;
      border-radius: 12px;
    }
    .request-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }
    .doc-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #1e3a5f;
    }
    .request-info {
      flex: 1;
    }
    .request-info h3 {
      margin: 0;
      color: #1e3a5f;
    }
    .request-info p {
      margin: 4px 0;
      color: #666;
      font-size: 14px;
    }
    .request-info .org {
      color: #999;
      font-size: 12px;
    }
    .time {
      font-size: 12px;
      color: #999;
    }
    .request-details {
      display: flex;
      gap: 24px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #eee;
      font-size: 14px;
      color: #666;
    }
    .request-details span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .request-details mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    mat-chip.pending {
      background: #fff3e0 !important;
      color: #ef6c00 !important;
    }
    mat-chip.approved {
      background: #e8f5e9 !important;
      color: #2e7d32 !important;
    }
    mat-chip.rejected {
      background: #ffebee !important;
      color: #c62828 !important;
    }
    mat-card-actions {
      display: flex;
      gap: 8px;
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
    @media (max-width: 600px) {
      .stats-row {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class SigningComponent implements OnInit {
  private signingService = inject(SigningService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  pendingRequests: SigningRequest[] = [];
  historyItems: SigningHistory[] = [];
  stats: SigningStats | null = null;
  loading = true;
  processing: { [key: string]: boolean } = {};

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      // Load stats
      const stats$ = await this.signingService.getSigningStats();
      stats$.subscribe(stats => this.stats = stats);

      // Load pending requests
      const pending$ = await this.signingService.getPendingRequests();
      pending$.subscribe(requests => this.pendingRequests = requests);

      // Load history
      const history$ = await this.signingService.getSigningHistory();
      history$.subscribe(result => {
        this.historyItems = result.history;
        this.loading = false;
      });
    } catch (err) {
      console.error('Error loading data:', err);
      this.loading = false;
      this.snackBar.open('Failed to load signing data', 'Close', { duration: 3000 });
    }
  }

  formatTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  formatTimeRemaining(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString();
  }

  previewRequest(request: SigningRequest) {
    console.log('Preview request:', request);
    // TODO: Open dialog with document preview
    this.snackBar.open('Document preview coming soon', 'Close', { duration: 2000 });
  }

  async approveRequest(request: SigningRequest) {
    this.processing[request.id] = true;
    
    try {
      // In production, this would trigger biometric authentication
      const deviceInfo = navigator.userAgent;
      const biometricVerified = false; // Would be true after biometric auth
      
      const result$ = await this.signingService.approveSigningRequest(
        request.id, 
        deviceInfo, 
        biometricVerified
      );
      
      result$.subscribe({
        next: (result) => {
          this.processing[request.id] = false;
          if (result) {
            this.snackBar.open('Document signed successfully!', 'Close', { duration: 3000 });
            this.loadData(); // Refresh data
          } else {
            this.snackBar.open('Failed to sign document', 'Close', { duration: 3000 });
          }
        },
        error: (err) => {
          this.processing[request.id] = false;
          this.snackBar.open('Failed to sign document', 'Close', { duration: 3000 });
        }
      });
    } catch (err) {
      this.processing[request.id] = false;
      this.snackBar.open('Failed to sign document', 'Close', { duration: 3000 });
    }
  }

  async rejectRequest(request: SigningRequest) {
    this.processing[request.id] = true;
    
    try {
      const result$ = await this.signingService.rejectSigningRequest(
        request.id,
        'Rejected by professional',
        navigator.userAgent
      );
      
      result$.subscribe({
        next: (result) => {
          this.processing[request.id] = false;
          if (result) {
            this.snackBar.open('Request rejected', 'Close', { duration: 3000 });
            this.loadData(); // Refresh data
          } else {
            this.snackBar.open('Failed to reject request', 'Close', { duration: 3000 });
          }
        },
        error: (err) => {
          this.processing[request.id] = false;
          this.snackBar.open('Failed to reject request', 'Close', { duration: 3000 });
        }
      });
    } catch (err) {
      this.processing[request.id] = false;
      this.snackBar.open('Failed to reject request', 'Close', { duration: 3000 });
    }
  }
}

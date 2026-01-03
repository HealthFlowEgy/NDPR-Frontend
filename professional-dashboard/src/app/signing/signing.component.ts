import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';

interface SigningRequest {
  id: string;
  documentName: string;
  requester: string;
  requestedAt: string;
  expiresAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  documentType: string;
}

@Component({
  selector: 'app-signing',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTabsModule, MatChipsModule, MatDialogModule],
  template: `
    <div class="signing-container">
      <div class="page-header">
        <h1>Document Signing</h1>
        <p>Review and sign documents remotely using your digital identity</p>
      </div>

      <mat-tab-group>
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
                      <h3>{{ request.documentName }}</h3>
                      <p>Requested by: {{ request.requester }}</p>
                      <span class="time">{{ request.requestedAt }}</span>
                    </div>
                    <mat-chip class="pending">Pending</mat-chip>
                  </div>
                  <div class="request-details">
                    <span><mat-icon>schedule</mat-icon> Expires: {{ request.expiresAt }}</span>
                    <span><mat-icon>category</mat-icon> {{ request.documentType }}</span>
                  </div>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-button color="primary">
                    <mat-icon>visibility</mat-icon> Preview
                  </button>
                  <button mat-raised-button color="primary" (click)="approveRequest(request)">
                    <mat-icon>check</mat-icon> Sign
                  </button>
                  <button mat-button color="warn" (click)="rejectRequest(request)">
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
            @for (request of historyRequests; track request.id) {
              <mat-card class="request-card">
                <mat-card-content>
                  <div class="request-header">
                    <mat-icon class="doc-icon">description</mat-icon>
                    <div class="request-info">
                      <h3>{{ request.documentName }}</h3>
                      <p>{{ request.requester }}</p>
                    </div>
                    <mat-chip [class]="request.status">{{ request.status | titlecase }}</mat-chip>
                  </div>
                </mat-card-content>
              </mat-card>
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
  `]
})
export class SigningComponent {
  pendingRequests: SigningRequest[] = [
    {
      id: '1',
      documentName: 'Medical Certificate - Patient #12345',
      requester: 'Cairo Hospital',
      requestedAt: '10 minutes ago',
      expiresAt: '14 minutes remaining',
      status: 'pending',
      documentType: 'Medical Certificate'
    },
    {
      id: '2',
      documentName: 'Prescription - Amoxicillin 500mg',
      requester: 'El Ezaby Pharmacy',
      requestedAt: '25 minutes ago',
      expiresAt: '5 minutes remaining',
      status: 'pending',
      documentType: 'Prescription'
    }
  ];

  historyRequests: SigningRequest[] = [
    {
      id: '3',
      documentName: 'Lab Results Verification',
      requester: 'Al Mokhtabar Labs',
      requestedAt: 'Yesterday',
      expiresAt: '',
      status: 'approved',
      documentType: 'Lab Results'
    },
    {
      id: '4',
      documentName: 'Insurance Claim Form',
      requester: 'AXA Insurance',
      requestedAt: '2 days ago',
      expiresAt: '',
      status: 'approved',
      documentType: 'Insurance'
    },
    {
      id: '5',
      documentName: 'Referral Letter',
      requester: 'Unknown Clinic',
      requestedAt: '3 days ago',
      expiresAt: '',
      status: 'rejected',
      documentType: 'Referral'
    }
  ];

  approveRequest(request: SigningRequest) {
    console.log('Approving request:', request.id);
    // Would trigger biometric auth and signing flow
  }

  rejectRequest(request: SigningRequest) {
    console.log('Rejecting request:', request.id);
  }
}

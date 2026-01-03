import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-credentials',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatChipsModule],
  template: `
    <div class="credentials-container">
      <div class="page-header">
        <h1>My Credentials</h1>
        <button mat-raised-button color="primary">
          <mat-icon>add</mat-icon>
          Request New Credential
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="credentials" class="credentials-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Credential</th>
              <td mat-cell *matCellDef="let cred">
                <div class="cred-name">
                  <mat-icon>{{ cred.icon }}</mat-icon>
                  <span>{{ cred.name }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="issuer">
              <th mat-header-cell *matHeaderCellDef>Issuer</th>
              <td mat-cell *matCellDef="let cred">{{ cred.issuer }}</td>
            </ng-container>

            <ng-container matColumnDef="issued">
              <th mat-header-cell *matHeaderCellDef>Issued</th>
              <td mat-cell *matCellDef="let cred">{{ cred.issued }}</td>
            </ng-container>

            <ng-container matColumnDef="expires">
              <th mat-header-cell *matHeaderCellDef>Expires</th>
              <td mat-cell *matCellDef="let cred">{{ cred.expires }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let cred">
                <mat-chip [class]="cred.status">{{ cred.status | titlecase }}</mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let cred">
                <button mat-icon-button color="primary" matTooltip="View">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Download">
                  <mat-icon>download</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Share">
                  <mat-icon>share</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
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
    mat-chip.active {
      background: #e8f5e9 !important;
      color: #2e7d32 !important;
    }
    mat-chip.pending {
      background: #fff3e0 !important;
      color: #ef6c00 !important;
    }
    mat-chip.expired {
      background: #ffebee !important;
      color: #c62828 !important;
    }
  `]
})
export class CredentialsComponent {
  displayedColumns = ['name', 'issuer', 'issued', 'expires', 'status', 'actions'];
  
  credentials = [
    { name: 'Medical License', icon: 'badge', issuer: 'Egyptian Medical Syndicate', issued: '2024-01-15', expires: '2026-12-31', status: 'active' },
    { name: 'Cardiology Certification', icon: 'workspace_premium', issuer: 'Egyptian Board', issued: '2023-06-20', expires: '2028-06-20', status: 'active' },
    { name: 'Hospital Privileges', icon: 'local_hospital', issuer: 'Cairo University Hospital', issued: '2024-03-01', expires: '2025-03-01', status: 'active' },
    { name: 'CPR Certification', icon: 'favorite', issuer: 'Red Crescent', issued: '2023-09-15', expires: '2025-09-15', status: 'active' }
  ];
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { RegistryService, Professional, SearchFilters } from '../services/registry.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatBadgeModule
  ],
  template: `
    <div class="search-container">
      <!-- Header -->
      <div class="search-header">
        <h1>HealthFlow Professional Registry</h1>
        <p>Search and verify healthcare professionals in the national registry</p>
      </div>

      <!-- Search Box -->
      <mat-card class="search-card">
        <mat-card-content>
          <div class="search-row">
            <mat-form-field appearance="outline" class="search-input">
              <mat-label>Search by name or registration number</mat-label>
              <input matInput [(ngModel)]="searchQuery" (keyup.enter)="search()" placeholder="Enter name or registration number...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="search()" [disabled]="loading">
              <mat-icon>search</mat-icon>
              Search
            </button>
          </div>

          <!-- Filters -->
          <div class="filters-row">
            <mat-form-field appearance="outline">
              <mat-label>Professional Type</mat-label>
              <mat-select [(ngModel)]="filters.type" (selectionChange)="search()">
                <mat-option *ngFor="let type of professionalTypes" [value]="type.value">
                  {{ type.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Specialization</mat-label>
              <mat-select [(ngModel)]="filters.specialization" (selectionChange)="search()">
                <mat-option *ngFor="let spec of specializations" [value]="spec.value">
                  {{ spec.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Location</mat-label>
              <mat-select [(ngModel)]="filters.location" (selectionChange)="search()">
                <mat-option *ngFor="let loc of locations" [value]="loc.value">
                  {{ loc.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="filters.status" (selectionChange)="search()">
                <mat-option *ngFor="let stat of statuses" [value]="stat.value">
                  {{ stat.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-button (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              Clear Filters
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Results Count -->
      <div class="results-info" *ngIf="!loading">
        <span *ngIf="totalCount > 0">Found {{ totalCount }} professional(s)</span>
        <span *ngIf="totalCount === 0 && hasSearched">No professionals found matching your criteria</span>
      </div>

      <!-- Loading -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Searching registry...</p>
      </div>

      <!-- Results Grid -->
      <div class="results-grid" *ngIf="!loading && professionals.length > 0">
        <mat-card *ngFor="let professional of professionals" class="professional-card" (click)="viewDetails(professional)">
          <mat-card-header>
            <div mat-card-avatar class="avatar" [style.background-color]="getTypeColor(professional.type)">
              {{ getInitials(professional.name) }}
            </div>
            <mat-card-title>{{ professional.name }}</mat-card-title>
            <mat-card-subtitle>
              <mat-chip [style.background-color]="getTypeColor(professional.type)" class="type-chip">
                {{ professional.type }}
              </mat-chip>
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="info-row">
              <mat-icon>medical_services</mat-icon>
              <span>{{ professional.specialization }}</span>
            </div>
            <div class="info-row">
              <mat-icon>badge</mat-icon>
              <span>{{ professional.registrationNumber }}</span>
            </div>
            <div class="info-row">
              <mat-icon>location_on</mat-icon>
              <span>{{ professional.location }}</span>
            </div>
            <div class="info-row">
              <mat-icon>business</mat-icon>
              <span>{{ professional.facility }}</span>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <span class="status-badge" [class]="professional.status.toLowerCase()">
              {{ professional.status }}
            </span>
            <button mat-button color="primary" (click)="verifyProfessional(professional); $event.stopPropagation()">
              <mat-icon>verified</mat-icon>
              Verify
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Empty State -->
      <mat-card class="empty-state" *ngIf="!loading && professionals.length === 0 && hasSearched">
        <mat-card-content>
          <mat-icon>search_off</mat-icon>
          <h3>No Results Found</h3>
          <p>Try adjusting your search criteria or clearing filters</p>
          <button mat-raised-button color="primary" (click)="clearFilters()">
            Clear All Filters
          </button>
        </mat-card-content>
      </mat-card>

      <!-- Initial State -->
      <mat-card class="initial-state" *ngIf="!loading && !hasSearched">
        <mat-card-content>
          <mat-icon>person_search</mat-icon>
          <h3>Search the Professional Registry</h3>
          <p>Enter a name, registration number, or use filters to find healthcare professionals</p>
        </mat-card-content>
      </mat-card>

      <!-- Pagination -->
      <div class="pagination" *ngIf="totalCount > pageSize">
        <button mat-button [disabled]="currentPage === 0" (click)="previousPage()">
          <mat-icon>chevron_left</mat-icon>
          Previous
        </button>
        <span>Page {{ currentPage + 1 }} of {{ totalPages }}</span>
        <button mat-button [disabled]="currentPage >= totalPages - 1" (click)="nextPage()">
          Next
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>

      <!-- Details Modal -->
      <div class="modal-overlay" *ngIf="showDetailsModal" (click)="closeModal()">
        <mat-card class="modal-card" (click)="$event.stopPropagation()">
          <mat-card-header>
            <div mat-card-avatar class="avatar large" [style.background-color]="getTypeColor(selectedProfessional!.type)">
              {{ getInitials(selectedProfessional!.name) }}
            </div>
            <mat-card-title>{{ selectedProfessional!.name }}</mat-card-title>
            <mat-card-subtitle>{{ selectedProfessional!.type }} - {{ selectedProfessional!.specialization }}</mat-card-subtitle>
            <button mat-icon-button class="close-btn" (click)="closeModal()">
              <mat-icon>close</mat-icon>
            </button>
          </mat-card-header>
          <mat-card-content>
            <div class="details-grid">
              <div class="detail-item">
                <label>Registration Number</label>
                <span>{{ selectedProfessional!.registrationNumber }}</span>
              </div>
              <div class="detail-item">
                <label>Status</label>
                <span class="status-badge" [class]="selectedProfessional!.status.toLowerCase()">
                  {{ selectedProfessional!.status }}
                </span>
              </div>
              <div class="detail-item">
                <label>Location</label>
                <span>{{ selectedProfessional!.location }}</span>
              </div>
              <div class="detail-item">
                <label>Facility</label>
                <span>{{ selectedProfessional!.facility }}</span>
              </div>
              <div class="detail-item">
                <label>License Expiry</label>
                <span>{{ selectedProfessional!.licenseExpiry }}</span>
              </div>
              <div class="detail-item" *ngIf="selectedProfessional!.email">
                <label>Email</label>
                <span>{{ selectedProfessional!.email }}</span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="verifyProfessional(selectedProfessional!)">
              <mat-icon>verified</mat-icon>
              Verify Credentials
            </button>
            <button mat-button (click)="closeModal()">Close</button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Verification Modal -->
      <div class="modal-overlay" *ngIf="showVerifyModal" (click)="closeVerifyModal()">
        <mat-card class="modal-card verify-modal" (click)="$event.stopPropagation()">
          <mat-card-header>
            <mat-icon mat-card-avatar class="verify-icon">verified</mat-icon>
            <mat-card-title>Verification Result</mat-card-title>
            <mat-card-subtitle>{{ verificationTimestamp }}</mat-card-subtitle>
            <button mat-icon-button class="close-btn" (click)="closeVerifyModal()">
              <mat-icon>close</mat-icon>
            </button>
          </mat-card-header>
          <mat-card-content>
            <div class="verification-result">
              <div class="verified-badge">
                <mat-icon>check_circle</mat-icon>
                <span>VERIFIED</span>
              </div>
              <p>{{ selectedProfessional!.name }} is a registered {{ selectedProfessional!.type }} in the HealthFlow National Registry.</p>
              
              <div class="verification-details">
                <div class="detail-row">
                  <span class="label">Registration Number:</span>
                  <span class="value">{{ selectedProfessional!.registrationNumber }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Status:</span>
                  <span class="value status-badge active">{{ selectedProfessional!.status }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">License Valid Until:</span>
                  <span class="value">{{ selectedProfessional!.licenseExpiry }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Verification ID:</span>
                  <span class="value">VER-{{ selectedProfessional!.osid?.substring(0, 8) || 'N/A' }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="downloadVerification()">
              <mat-icon>download</mat-icon>
              Download Proof
            </button>
            <button mat-button (click)="closeVerifyModal()">Close</button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }
    .search-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .search-header h1 {
      color: #1e3a5f;
      margin: 0 0 8px;
      font-size: 2.5rem;
    }
    .search-header p {
      color: #666;
      font-size: 1.1rem;
    }
    .search-card {
      margin-bottom: 24px;
    }
    .search-row {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }
    .search-input {
      flex: 1;
    }
    .filters-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-top: 16px;
    }
    .filters-row mat-form-field {
      min-width: 150px;
    }
    .results-info {
      margin-bottom: 16px;
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
    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }
    .professional-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .professional-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }
    .avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 16px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
    .avatar.large {
      width: 56px;
      height: 56px;
      font-size: 20px;
    }
    .type-chip {
      color: white !important;
      font-size: 11px;
    }
    .info-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
      color: #666;
      font-size: 14px;
    }
    .info-row mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #999;
    }
    mat-card-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .status-badge.active {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .status-badge.pending {
      background: #fff3e0;
      color: #ef6c00;
    }
    .status-badge.suspended {
      background: #ffebee;
      color: #c62828;
    }
    .empty-state, .initial-state {
      text-align: center;
      padding: 48px;
    }
    .empty-state mat-icon, .initial-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
    }
    .empty-state h3, .initial-state h3 {
      color: #1e3a5f;
      margin: 16px 0 8px;
    }
    .empty-state p, .initial-state p {
      color: #666;
      margin-bottom: 24px;
    }
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 24px;
    }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-card {
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
    }
    .close-btn {
      position: absolute;
      top: 8px;
      right: 8px;
    }
    .details-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-top: 16px;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .detail-item label {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
    }
    .detail-item span {
      font-size: 14px;
      color: #333;
    }
    .verify-modal .verify-icon {
      background: #4caf50;
      color: white;
    }
    .verification-result {
      text-align: center;
      padding: 24px 0;
    }
    .verified-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #2e7d32;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 16px;
    }
    .verified-badge mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
    .verification-details {
      text-align: left;
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-top: 16px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-row .label {
      color: #666;
    }
    .detail-row .value {
      font-weight: 500;
    }
  `]
})
export class SearchComponent implements OnInit {
  private registryService = inject(RegistryService);
  private snackBar = inject(MatSnackBar);

  searchQuery = '';
  loading = false;
  hasSearched = false;
  
  filters: SearchFilters = {
    type: '',
    specialization: '',
    location: '',
    status: ''
  };

  // All 5 professional types
  professionalTypes = [
    { value: '', label: 'All Types' },
    { value: 'Doctor', label: 'Doctor' },
    { value: 'Nurse', label: 'Nurse' },
    { value: 'Pharmacist', label: 'Pharmacist' },
    { value: 'Dentist', label: 'Dentist' },
    { value: 'Physiotherapist', label: 'Physiotherapist' }
  ];

  specializations = [
    { value: '', label: 'All' },
    { value: 'Cardiology', label: 'Cardiology' },
    { value: 'Pediatrics', label: 'Pediatrics' },
    { value: 'Orthopedics', label: 'Orthopedics' },
    { value: 'Neurology', label: 'Neurology' },
    { value: 'General Practice', label: 'General Practice' },
    { value: 'Dental Surgery', label: 'Dental Surgery' },
    { value: 'Physical Therapy', label: 'Physical Therapy' }
  ];

  locations = [
    { value: '', label: 'All' },
    { value: 'Cairo', label: 'Cairo' },
    { value: 'Alexandria', label: 'Alexandria' },
    { value: 'Giza', label: 'Giza' },
    { value: 'Luxor', label: 'Luxor' },
    { value: 'Aswan', label: 'Aswan' }
  ];

  statuses = [
    { value: '', label: 'All' },
    { value: 'Active', label: 'Active' },
    { value: 'Pending', label: 'Pending' }
  ];

  professionals: Professional[] = [];
  totalCount = 0;
  selectedProfessional: Professional | null = null;
  showDetailsModal = false;
  showVerifyModal = false;
  verificationTimestamp = '';

  pageSize = 12;
  currentPage = 0;

  ngOnInit() {
    // Initial load - show all professionals
    this.search();
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  search(): void {
    this.loading = true;
    this.hasSearched = true;
    this.currentPage = 0;

    const searchFilters: SearchFilters = {
      ...this.filters,
      query: this.searchQuery || undefined
    };

    this.registryService.searchProfessionals(searchFilters, 0, this.pageSize).subscribe({
      next: (response) => {
        this.professionals = response.data;
        this.totalCount = response.totalCount;
        this.loading = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.snackBar.open('Error searching registry. Please try again.', 'Close', { duration: 3000 });
        this.professionals = [];
        this.totalCount = 0;
        this.loading = false;
      }
    });
  }

  clearFilters(): void {
    this.filters = { type: '', specialization: '', location: '', status: '' };
    this.searchQuery = '';
    this.search();
  }

  viewDetails(professional: Professional): void {
    this.selectedProfessional = professional;
    this.showDetailsModal = true;
  }

  closeModal(): void {
    this.showDetailsModal = false;
    this.selectedProfessional = null;
  }

  verifyProfessional(professional: Professional): void {
    this.selectedProfessional = professional;
    this.showDetailsModal = false;
    this.verificationTimestamp = new Date().toLocaleString();
    setTimeout(() => {
      this.showVerifyModal = true;
    }, 300);
  }

  closeVerifyModal(): void {
    this.showVerifyModal = false;
  }

  downloadVerification(): void {
    if (!this.selectedProfessional) return;

    const verificationData = {
      verificationId: `VER-${this.selectedProfessional.osid?.substring(0, 8) || 'N/A'}`,
      timestamp: this.verificationTimestamp,
      professional: {
        name: this.selectedProfessional.name,
        type: this.selectedProfessional.type,
        registrationNumber: this.selectedProfessional.registrationNumber,
        status: this.selectedProfessional.status,
        licenseExpiry: this.selectedProfessional.licenseExpiry
      },
      result: 'VERIFIED',
      registry: 'HealthFlow National Professional Registry'
    };

    const blob = new Blob([JSON.stringify(verificationData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verification-${this.selectedProfessional.registrationNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.snackBar.open('Verification proof downloaded', 'Close', { duration: 3000 });
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadPage();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadPage();
    }
  }

  private loadPage(): void {
    this.loading = true;
    const offset = this.currentPage * this.pageSize;

    const searchFilters: SearchFilters = {
      ...this.filters,
      query: this.searchQuery || undefined
    };

    this.registryService.searchProfessionals(searchFilters, offset, this.pageSize).subscribe({
      next: (response) => {
        this.professionals = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Load page error:', error);
        this.loading = false;
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      'Doctor': '#1e3a5f',
      'Nurse': '#4caf50',
      'Pharmacist': '#9c27b0',
      'Dentist': '#00bcd4',
      'Physiotherapist': '#ff9800'
    };
    return colors[type] || '#666';
  }
}

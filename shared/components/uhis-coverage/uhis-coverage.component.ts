import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * UHIS Coverage Display Component
 * 
 * Displays patient's Universal Health Insurance System coverage status:
 * - Enrollment status (active, pending, cancelled)
 * - Coverage tier (A, B, C, D) with copay percentage
 * - Coverage period
 * - Covered services
 */
@Component({
  selector: 'app-uhis-coverage',
  template: `
    <div class="coverage-container" [class.rtl]="isRtl">
      <!-- Header -->
      <div class="coverage-header" [class]="'status-' + (coverage?.status || 'unknown')">
        <div class="header-content">
          <div class="uhis-logo">
            <img src="/assets/images/uhis-logo.png" alt="UHIS" *ngIf="showLogo" />
            <span class="logo-text" *ngIf="!showLogo">UHIS</span>
          </div>
          <div class="status-badge">
            <span class="status-text">
              {{ isRtl ? getStatusAr(coverage?.status) : getStatusEn(coverage?.status) }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Loading State -->
      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <span>{{ isRtl ? 'جاري التحقق...' : 'Verifying coverage...' }}</span>
      </div>
      
      <!-- Error State -->
      <div class="error" *ngIf="error">
        <span class="error-icon">⚠</span>
        <span>{{ isRtl ? errorMessageAr : errorMessage }}</span>
        <button (click)="retry()" class="retry-btn">
          {{ isRtl ? 'إعادة المحاولة' : 'Retry' }}
        </button>
      </div>
      
      <!-- Coverage Details -->
      <div class="coverage-body" *ngIf="coverage && !loading && !error">
        <!-- Tier Display -->
        <div class="tier-section">
          <div class="tier-badge" [class]="'tier-' + coverage.tier">
            <span class="tier-letter">{{ coverage.tier }}</span>
            <span class="tier-label">{{ isRtl ? 'الفئة' : 'Tier' }}</span>
          </div>
          <div class="copay-info">
            <span class="copay-percentage">{{ getCopayPercentage(coverage.tier) }}%</span>
            <span class="copay-label">{{ isRtl ? 'نسبة المشاركة' : 'Copay' }}</span>
          </div>
        </div>
        
        <!-- Coverage Period -->
        <div class="info-section">
          <div class="info-row">
            <span class="info-label">
              <i class="icon icon-calendar"></i>
              {{ isRtl ? 'فترة التغطية' : 'Coverage Period' }}
            </span>
            <span class="info-value">
              {{ formatDate(coverage.periodStart) }} - {{ formatDate(coverage.periodEnd) }}
            </span>
          </div>
          
          <div class="info-row">
            <span class="info-label">
              <i class="icon icon-location"></i>
              {{ isRtl ? 'محافظة التسجيل' : 'Enrollment Governorate' }}
            </span>
            <span class="info-value">{{ coverage.governorate }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">
              <i class="icon icon-id"></i>
              {{ isRtl ? 'رقم التغطية' : 'Coverage ID' }}
            </span>
            <span class="info-value mono">{{ coverage.coverageId }}</span>
          </div>
        </div>
        
        <!-- Covered Services -->
        <div class="services-section" *ngIf="showServices">
          <h4>{{ isRtl ? 'الخدمات المغطاة' : 'Covered Services' }}</h4>
          <div class="services-grid">
            <div class="service-item" *ngFor="let service of coverage.coveredServices">
              <span class="service-icon">✓</span>
              <span class="service-name">{{ getServiceName(service) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Payor Information -->
        <div class="payor-section">
          <span class="payor-label">{{ isRtl ? 'جهة التأمين:' : 'Payor:' }}</span>
          <span class="payor-name">
            {{ isRtl ? 'الهيئة العامة للتأمين الصحي الشامل' : 'Universal Health Insurance Authority (UHIA)' }}
          </span>
        </div>
      </div>
      
      <!-- Not Enrolled State -->
      <div class="not-enrolled" *ngIf="!coverage && !loading && !error">
        <span class="not-enrolled-icon">ℹ</span>
        <h4>{{ isRtl ? 'غير مسجل في التأمين الصحي الشامل' : 'Not Enrolled in UHIS' }}</h4>
        <p>{{ isRtl ? 'هذا المريض غير مسجل حاليًا في نظام التأمين الصحي الشامل.' : 'This patient is not currently enrolled in the Universal Health Insurance System.' }}</p>
        <a [href]="enrollmentUrl" class="enroll-btn" *ngIf="showEnrollButton">
          {{ isRtl ? 'التسجيل الآن' : 'Enroll Now' }}
        </a>
      </div>
    </div>
  `,
  styles: [`
    .coverage-container {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      background: white;
      max-width: 400px;
    }
    
    .coverage-container.rtl {
      direction: rtl;
      text-align: right;
    }
    
    /* Header Styles */
    .coverage-header {
      padding: 1rem 1.5rem;
      color: white;
    }
    
    .status-active { background: linear-gradient(135deg, #28a745, #20c997); }
    .status-pending { background: linear-gradient(135deg, #ffc107, #fd7e14); }
    .status-cancelled { background: linear-gradient(135deg, #dc3545, #c82333); }
    .status-suspended { background: linear-gradient(135deg, #6c757d, #495057); }
    .status-unknown { background: linear-gradient(135deg, #6c757d, #495057); }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .uhis-logo img {
      height: 40px;
    }
    
    .logo-text {
      font-size: 1.5rem;
      font-weight: bold;
    }
    
    .status-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-weight: 500;
    }
    
    /* Loading State */
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      color: #666;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Error State */
    .error {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      color: #dc3545;
    }
    
    .error-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    
    .retry-btn {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    /* Body Styles */
    .coverage-body {
      padding: 1.5rem;
    }
    
    /* Tier Section */
    .tier-section {
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }
    
    .tier-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .tier-letter {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: bold;
      color: white;
    }
    
    .tier-A .tier-letter { background: #28a745; }
    .tier-B .tier-letter { background: #17a2b8; }
    .tier-C .tier-letter { background: #ffc107; color: #333; }
    .tier-D .tier-letter { background: #fd7e14; }
    
    .tier-label {
      margin-top: 0.5rem;
      color: #666;
      font-size: 0.875rem;
    }
    
    .copay-info {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .copay-percentage {
      font-size: 2rem;
      font-weight: bold;
      color: #333;
    }
    
    .copay-label {
      color: #666;
      font-size: 0.875rem;
    }
    
    /* Info Section */
    .info-section {
      margin-bottom: 1.5rem;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid #eee;
    }
    
    .info-row:last-child {
      border-bottom: none;
    }
    
    .info-label {
      color: #666;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .info-value {
      font-weight: 500;
      color: #333;
    }
    
    .info-value.mono {
      font-family: monospace;
      font-size: 0.875rem;
    }
    
    /* Services Section */
    .services-section {
      margin-bottom: 1.5rem;
    }
    
    .services-section h4 {
      margin-bottom: 1rem;
      color: #333;
    }
    
    .services-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }
    
    .service-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }
    
    .service-icon {
      color: #28a745;
    }
    
    /* Payor Section */
    .payor-section {
      padding-top: 1rem;
      border-top: 1px solid #eee;
      font-size: 0.875rem;
      color: #666;
    }
    
    .payor-name {
      font-weight: 500;
      color: #333;
    }
    
    /* Not Enrolled State */
    .not-enrolled {
      padding: 2rem;
      text-align: center;
    }
    
    .not-enrolled-icon {
      font-size: 3rem;
      color: #6c757d;
    }
    
    .not-enrolled h4 {
      margin: 1rem 0 0.5rem;
      color: #333;
    }
    
    .not-enrolled p {
      color: #666;
      margin-bottom: 1rem;
    }
    
    .enroll-btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 500;
    }
    
    .enroll-btn:hover {
      background: #0056b3;
    }
  `]
})
export class UhisCoverageComponent implements OnInit, OnChanges {
  @Input() patientHealthId: string = '';
  @Input() patientNationalId: string = '';
  @Input() isRtl = false;
  @Input() showLogo = true;
  @Input() showServices = true;
  @Input() showEnrollButton = true;
  @Input() enrollmentUrl = '/enrollment';
  @Input() apiUrl = '/api/v1/coverage';
  
  coverage: any = null;
  loading = false;
  error = false;
  errorMessage = '';
  errorMessageAr = '';
  
  private serviceNames: {[key: string]: {en: string, ar: string}} = {
    'primary_care': { en: 'Primary Care', ar: 'الرعاية الأولية' },
    'specialist_care': { en: 'Specialist Care', ar: 'رعاية التخصصات' },
    'emergency': { en: 'Emergency', ar: 'الطوارئ' },
    'hospitalization': { en: 'Hospitalization', ar: 'الإقامة بالمستشفى' },
    'surgery': { en: 'Surgery', ar: 'الجراحة' },
    'maternity': { en: 'Maternity', ar: 'رعاية الأمومة' },
    'pediatrics': { en: 'Pediatrics', ar: 'طب الأطفال' },
    'chronic_disease': { en: 'Chronic Disease', ar: 'الأمراض المزمنة' },
    'mental_health': { en: 'Mental Health', ar: 'الصحة النفسية' },
    'dental_basic': { en: 'Basic Dental', ar: 'طب الأسنان الأساسي' },
    'vision_basic': { en: 'Basic Vision', ar: 'العيون الأساسي' },
    'medications': { en: 'Medications', ar: 'الأدوية' },
    'laboratory': { en: 'Laboratory', ar: 'المعمل' },
    'radiology': { en: 'Radiology', ar: 'الأشعة' },
    'rehabilitation': { en: 'Rehabilitation', ar: 'إعادة التأهيل' }
  };
  
  constructor(private http: HttpClient) {}
  
  ngOnInit() {
    this.loadCoverage();
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['patientHealthId'] || changes['patientNationalId']) {
      this.loadCoverage();
    }
  }
  
  loadCoverage() {
    if (!this.patientHealthId && !this.patientNationalId) {
      return;
    }
    
    this.loading = true;
    this.error = false;
    
    const params: any = {};
    if (this.patientHealthId) {
      params.healthId = this.patientHealthId;
    } else if (this.patientNationalId) {
      params.nationalId = this.patientNationalId;
    }
    
    this.http.get(this.apiUrl, { params }).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.eligible) {
          this.coverage = response.coverage;
        } else {
          this.coverage = null;
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = 'Failed to verify coverage';
        this.errorMessageAr = 'فشل التحقق من التغطية';
      }
    });
  }
  
  retry() {
    this.loadCoverage();
  }
  
  getStatusEn(status: string): string {
    const statuses: {[key: string]: string} = {
      'active': 'Active',
      'pending': 'Pending',
      'cancelled': 'Cancelled',
      'suspended': 'Suspended'
    };
    return statuses[status] || 'Unknown';
  }
  
  getStatusAr(status: string): string {
    const statuses: {[key: string]: string} = {
      'active': 'نشط',
      'pending': 'قيد الانتظار',
      'cancelled': 'ملغي',
      'suspended': 'موقوف'
    };
    return statuses[status] || 'غير معروف';
  }
  
  getCopayPercentage(tier: string): number {
    const copays: {[key: string]: number} = {
      'A': 0,
      'B': 10,
      'C': 20,
      'D': 30
    };
    return copays[tier] || 30;
  }
  
  getServiceName(service: string): string {
    const svc = this.serviceNames[service];
    if (svc) {
      return this.isRtl ? svc.ar : svc.en;
    }
    return service;
  }
  
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(this.isRtl ? 'ar-EG' : 'en-EG');
  }
}

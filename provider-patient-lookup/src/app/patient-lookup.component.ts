import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

/**
 * Provider Patient Lookup Component
 * 
 * Allows healthcare providers to search for patients by:
 * - National ID
 * - Health ID
 * - Name (Arabic or English)
 * - Mobile Number
 * 
 * Displays patient details and UHIS coverage status
 */
@Component({
  selector: 'app-patient-lookup',
  template: `
    <div class="lookup-container" [class.rtl]="isRtl">
      <!-- Header -->
      <div class="lookup-header">
        <h1>{{ isRtl ? 'بحث عن مريض' : 'Patient Lookup' }}</h1>
        <p>{{ isRtl ? 'ابحث عن مريض باستخدام الرقم القومي أو الرقم الصحي أو الاسم' : 'Search for a patient by National ID, Health ID, or Name' }}</p>
      </div>
      
      <!-- Search Form -->
      <div class="search-section">
        <div class="search-type-tabs">
          <button 
            *ngFor="let type of searchTypes" 
            [class.active]="selectedSearchType === type.value"
            (click)="selectSearchType(type.value)"
          >
            {{ isRtl ? type.labelAr : type.labelEn }}
          </button>
        </div>
        
        <div class="search-input-wrapper">
          <!-- National ID Search -->
          <div *ngIf="selectedSearchType === 'nid'" class="input-group">
            <app-nid-input
              [(ngModel)]="searchQuery"
              [isRtl]="isRtl"
              [showExtractedData]="false"
              (validationChange)="onNidValidation($event)"
            ></app-nid-input>
            <button 
              class="btn btn-primary search-btn" 
              [disabled]="!isNidValid || isSearching"
              (click)="search()"
            >
              <span *ngIf="!isSearching">{{ isRtl ? 'بحث' : 'Search' }}</span>
              <span *ngIf="isSearching" class="spinner"></span>
            </button>
          </div>
          
          <!-- Health ID Search -->
          <div *ngIf="selectedSearchType === 'hid'" class="input-group">
            <input 
              type="text" 
              [(ngModel)]="searchQuery"
              [placeholder]="isRtl ? 'أدخل الرقم الصحي (HID-EG-XXXXXXXX)' : 'Enter Health ID (HID-EG-XXXXXXXX)'"
              pattern="HID-EG-\\d{8}"
              class="form-control"
            />
            <button 
              class="btn btn-primary search-btn" 
              [disabled]="!searchQuery || isSearching"
              (click)="search()"
            >
              {{ isRtl ? 'بحث' : 'Search' }}
            </button>
          </div>
          
          <!-- Name Search -->
          <div *ngIf="selectedSearchType === 'name'" class="input-group">
            <input 
              type="text" 
              [(ngModel)]="searchQuery"
              [placeholder]="isRtl ? 'أدخل اسم المريض' : 'Enter patient name'"
              class="form-control"
              [dir]="isRtl ? 'rtl' : 'ltr'"
            />
            <button 
              class="btn btn-primary search-btn" 
              [disabled]="!searchQuery || searchQuery.length < 3 || isSearching"
              (click)="search()"
            >
              {{ isRtl ? 'بحث' : 'Search' }}
            </button>
          </div>
          
          <!-- Mobile Search -->
          <div *ngIf="selectedSearchType === 'mobile'" class="input-group">
            <input 
              type="tel" 
              [(ngModel)]="searchQuery"
              [placeholder]="isRtl ? 'أدخل رقم الموبايل' : 'Enter mobile number'"
              pattern="(\\+20|0)?1[0125]\\d{8}"
              class="form-control"
              dir="ltr"
            />
            <button 
              class="btn btn-primary search-btn" 
              [disabled]="!searchQuery || isSearching"
              (click)="search()"
            >
              {{ isRtl ? 'بحث' : 'Search' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Search Results -->
      <div class="results-section" *ngIf="hasSearched">
        <!-- Loading -->
        <div class="loading" *ngIf="isSearching">
          <div class="spinner-large"></div>
          <p>{{ isRtl ? 'جاري البحث...' : 'Searching...' }}</p>
        </div>
        
        <!-- No Results -->
        <div class="no-results" *ngIf="!isSearching && patients.length === 0">
          <div class="no-results-icon">🔍</div>
          <h3>{{ isRtl ? 'لا توجد نتائج' : 'No Results Found' }}</h3>
          <p>{{ isRtl ? 'لم يتم العثور على مريض بهذه البيانات' : 'No patient found with these details' }}</p>
        </div>
        
        <!-- Results List -->
        <div class="results-list" *ngIf="!isSearching && patients.length > 0">
          <div class="results-count">
            {{ patients.length }} {{ isRtl ? 'نتيجة' : 'result(s)' }}
          </div>
          
          <div class="patient-card" *ngFor="let patient of patients" (click)="selectPatient(patient)">
            <div class="patient-photo">
              <img [src]="patient.photo || '/assets/images/default-avatar.png'" alt="Patient" />
            </div>
            <div class="patient-info">
              <h4>{{ patient.fullNameArabic }}</h4>
              <p class="patient-name-en">{{ patient.fullNameEnglish }}</p>
              <div class="patient-details">
                <span class="detail">
                  <i class="icon icon-id"></i>
                  {{ patient.healthId }}
                </span>
                <span class="detail">
                  <i class="icon icon-calendar"></i>
                  {{ patient.birthDate }}
                </span>
                <span class="detail">
                  <i class="icon icon-gender"></i>
                  {{ patient.gender === 'male' ? (isRtl ? 'ذكر' : 'Male') : (isRtl ? 'أنثى' : 'Female') }}
                </span>
              </div>
            </div>
            <div class="patient-uhis">
              <span class="uhis-badge" [class]="'status-' + patient.uhisStatus">
                {{ getUhisStatusLabel(patient.uhisStatus) }}
              </span>
              <span class="uhis-tier" *ngIf="patient.uhisTier">
                {{ isRtl ? 'الفئة' : 'Tier' }} {{ patient.uhisTier }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Selected Patient Details -->
      <div class="patient-details-panel" *ngIf="selectedPatient" [@slideIn]>
        <div class="panel-header">
          <h2>{{ isRtl ? 'بيانات المريض' : 'Patient Details' }}</h2>
          <button class="close-btn" (click)="closePatientDetails()">×</button>
        </div>
        
        <div class="panel-body">
          <!-- Patient Identity -->
          <div class="details-section">
            <h3>{{ isRtl ? 'البيانات الشخصية' : 'Identity' }}</h3>
            <div class="detail-row">
              <span class="label">{{ isRtl ? 'الرقم الصحي' : 'Health ID' }}:</span>
              <span class="value">{{ selectedPatient.healthId }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ isRtl ? 'الاسم' : 'Name' }}:</span>
              <span class="value">{{ selectedPatient.fullNameArabic }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ isRtl ? 'تاريخ الميلاد' : 'Birth Date' }}:</span>
              <span class="value">{{ selectedPatient.birthDate }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ isRtl ? 'النوع' : 'Gender' }}:</span>
              <span class="value">{{ selectedPatient.gender === 'male' ? (isRtl ? 'ذكر' : 'Male') : (isRtl ? 'أنثى' : 'Female') }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ isRtl ? 'المحافظة' : 'Governorate' }}:</span>
              <span class="value">{{ selectedPatient.currentGovernorate }}</span>
            </div>
          </div>
          
          <!-- Contact Info -->
          <div class="details-section">
            <h3>{{ isRtl ? 'بيانات الاتصال' : 'Contact' }}</h3>
            <div class="detail-row">
              <span class="label">{{ isRtl ? 'الموبايل' : 'Mobile' }}:</span>
              <span class="value">{{ selectedPatient.mobileNumber }}</span>
            </div>
            <div class="detail-row" *ngIf="selectedPatient.email">
              <span class="label">{{ isRtl ? 'البريد الإلكتروني' : 'Email' }}:</span>
              <span class="value">{{ selectedPatient.email }}</span>
            </div>
          </div>
          
          <!-- UHIS Coverage -->
          <div class="details-section">
            <h3>{{ isRtl ? 'التأمين الصحي' : 'Health Insurance' }}</h3>
            <app-uhis-coverage
              [patientHealthId]="selectedPatient.healthId"
              [isRtl]="isRtl"
              [showLogo]="true"
              [showServices]="false"
            ></app-uhis-coverage>
          </div>
          
          <!-- Actions -->
          <div class="panel-actions">
            <button class="btn btn-primary" (click)="viewFullRecord()">
              {{ isRtl ? 'عرض السجل الكامل' : 'View Full Record' }}
            </button>
            <button class="btn btn-secondary" (click)="checkEligibility()">
              {{ isRtl ? 'التحقق من الأهلية' : 'Check Eligibility' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./patient-lookup.component.scss']
})
export class PatientLookupComponent implements OnInit {
  isRtl = false;
  selectedSearchType = 'nid';
  searchQuery = '';
  isSearching = false;
  hasSearched = false;
  isNidValid = false;
  
  patients: any[] = [];
  selectedPatient: any = null;
  
  searchTypes = [
    { value: 'nid', labelEn: 'National ID', labelAr: 'الرقم القومي' },
    { value: 'hid', labelEn: 'Health ID', labelAr: 'الرقم الصحي' },
    { value: 'name', labelEn: 'Name', labelAr: 'الاسم' },
    { value: 'mobile', labelEn: 'Mobile', labelAr: 'الموبايل' }
  ];
  
  constructor(
    private http: HttpClient,
    private translate: TranslateService
  ) {
    this.isRtl = this.translate.currentLang === 'ar';
  }
  
  ngOnInit() {
    this.translate.onLangChange.subscribe(event => {
      this.isRtl = event.lang === 'ar';
    });
  }
  
  selectSearchType(type: string) {
    this.selectedSearchType = type;
    this.searchQuery = '';
    this.patients = [];
    this.hasSearched = false;
  }
  
  onNidValidation(event: { valid: boolean, data: any }) {
    this.isNidValid = event.valid;
  }
  
  search() {
    if (!this.searchQuery || this.isSearching) return;
    
    this.isSearching = true;
    this.hasSearched = true;
    this.selectedPatient = null;
    
    const params: any = {};
    switch (this.selectedSearchType) {
      case 'nid':
        params.nationalId = this.searchQuery;
        break;
      case 'hid':
        params.healthId = this.searchQuery;
        break;
      case 'name':
        params.name = this.searchQuery;
        break;
      case 'mobile':
        params.mobile = this.searchQuery;
        break;
    }
    
    this.http.get('/api/v1/patients/search', { params })
      .pipe(
        catchError(err => {
          console.error('Search error:', err);
          return of({ patients: [] });
        })
      )
      .subscribe((response: any) => {
        this.isSearching = false;
        this.patients = response.patients || [];
      });
  }
  
  selectPatient(patient: any) {
    this.selectedPatient = patient;
  }
  
  closePatientDetails() {
    this.selectedPatient = null;
  }
  
  getUhisStatusLabel(status: string): string {
    const labels: { [key: string]: { en: string, ar: string } } = {
      'enrolled': { en: 'Enrolled', ar: 'مسجل' },
      'active': { en: 'Active', ar: 'نشط' },
      'pending': { en: 'Pending', ar: 'قيد الانتظار' },
      'not_enrolled': { en: 'Not Enrolled', ar: 'غير مسجل' },
      'exempt': { en: 'Exempt', ar: 'معفى' }
    };
    const label = labels[status] || { en: status, ar: status };
    return this.isRtl ? label.ar : label.en;
  }
  
  viewFullRecord() {
    if (this.selectedPatient) {
      window.location.href = `/patients/${this.selectedPatient.healthId}`;
    }
  }
  
  checkEligibility() {
    if (this.selectedPatient) {
      window.location.href = `/eligibility/${this.selectedPatient.healthId}`;
    }
  }
}

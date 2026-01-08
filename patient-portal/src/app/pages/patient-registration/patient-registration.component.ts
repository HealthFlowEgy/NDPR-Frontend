import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { NidInputComponent } from '../../../shared/components/nid-input/nid-input.component';

/**
 * Patient Registration Page
 * 
 * Multi-step form for patient self-registration:
 * 1. Identity (NID, names)
 * 2. Contact (mobile, email)
 * 3. Address
 * 4. UHIS enrollment
 * 5. Review & submit
 */
@Component({
  selector: 'app-patient-registration',
  template: `
    <div class="registration-container" [class.rtl]="isRtl">
      <!-- Header -->
      <div class="registration-header">
        <h1>{{ 'patient.registration.title' | translate }}</h1>
        <p>{{ 'patient.registration.subtitle' | translate }}</p>
      </div>
      
      <!-- Progress Steps -->
      <div class="progress-steps">
        <div 
          *ngFor="let step of steps; let i = index" 
          class="step" 
          [class.active]="currentStep === i"
          [class.completed]="currentStep > i"
          (click)="goToStep(i)"
        >
          <div class="step-number">{{ i + 1 }}</div>
          <div class="step-label">{{ step.labelKey | translate }}</div>
        </div>
      </div>
      
      <!-- Form -->
      <form [formGroup]="registrationForm" (ngSubmit)="onSubmit()">
        
        <!-- Step 1: Identity -->
        <div class="form-step" *ngIf="currentStep === 0">
          <h2>{{ 'patient.registration.steps.identity' | translate }}</h2>
          
          <div class="form-group">
            <app-nid-input
              formControlName="nationalId"
              [isRtl]="isRtl"
              [required]="true"
              [showExtractedData]="true"
              (extractedDataChange)="onNidDataExtracted($event)"
            ></app-nid-input>
          </div>
          
          <div class="form-group">
            <label>{{ 'patient.fields.fullNameArabic' | translate }} *</label>
            <input 
              type="text" 
              formControlName="fullNameArabic"
              [placeholder]="'patient.fields.fullNameArabicPlaceholder' | translate"
              dir="rtl"
            />
            <div class="error" *ngIf="f.fullNameArabic.touched && f.fullNameArabic.errors?.required">
              {{ 'validation.required' | translate }}
            </div>
          </div>
          
          <div class="form-group">
            <label>{{ 'patient.fields.fullNameEnglish' | translate }}</label>
            <input 
              type="text" 
              formControlName="fullNameEnglish"
              [placeholder]="'patient.fields.fullNameEnglishPlaceholder' | translate"
              dir="ltr"
            />
          </div>
          
          <div class="form-row">
            <div class="form-group half">
              <label>{{ 'patient.fields.birthDate' | translate }}</label>
              <input type="date" formControlName="birthDate" readonly />
            </div>
            <div class="form-group half">
              <label>{{ 'patient.fields.gender' | translate }}</label>
              <select formControlName="gender" disabled>
                <option value="male">{{ 'patient.fields.genderMale' | translate }}</option>
                <option value="female">{{ 'patient.fields.genderFemale' | translate }}</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label>{{ 'patient.fields.birthGovernorate' | translate }}</label>
            <input type="text" formControlName="birthGovernorate" readonly />
            <small class="hint">{{ isRtl ? 'يتم استخراجه من الرقم القومي' : 'Extracted from National ID' }}</small>
          </div>
        </div>
        
        <!-- Step 2: Contact -->
        <div class="form-step" *ngIf="currentStep === 1">
          <h2>{{ 'patient.registration.steps.contact' | translate }}</h2>
          
          <div class="form-group">
            <label>{{ 'patient.fields.mobileNumber' | translate }} *</label>
            <input 
              type="tel" 
              formControlName="mobileNumber"
              [placeholder]="'patient.fields.mobileNumberPlaceholder' | translate"
              dir="ltr"
            />
            <div class="error" *ngIf="f.mobileNumber.touched && f.mobileNumber.errors?.pattern">
              {{ 'validation.invalidMobile' | translate }}
            </div>
          </div>
          
          <div class="form-group">
            <label>{{ 'patient.fields.email' | translate }}</label>
            <input 
              type="email" 
              formControlName="email"
              [placeholder]="'patient.fields.emailPlaceholder' | translate"
              dir="ltr"
            />
            <div class="error" *ngIf="f.email.touched && f.email.errors?.email">
              {{ 'validation.invalidEmail' | translate }}
            </div>
          </div>
          
          <div class="form-group">
            <label>{{ 'patient.fields.motherName' | translate }}</label>
            <input type="text" formControlName="motherName" dir="rtl" />
          </div>
          
          <div class="form-group">
            <label>{{ 'patient.fields.fatherName' | translate }}</label>
            <input type="text" formControlName="fatherName" dir="rtl" />
          </div>
        </div>
        
        <!-- Step 3: Address -->
        <div class="form-step" *ngIf="currentStep === 2">
          <h2>{{ 'patient.registration.steps.address' | translate }}</h2>
          
          <div class="form-group">
            <label>{{ 'patient.fields.currentGovernorate' | translate }} *</label>
            <select formControlName="currentGovernorate">
              <option value="">{{ isRtl ? 'اختر المحافظة' : 'Select Governorate' }}</option>
              <option *ngFor="let gov of governorates" [value]="gov.en">
                {{ isRtl ? gov.ar : gov.en }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>{{ 'patient.address.city' | translate }}</label>
            <input type="text" formControlName="city" />
          </div>
          
          <div class="form-group">
            <label>{{ 'patient.address.district' | translate }}</label>
            <input type="text" formControlName="district" />
          </div>
          
          <div class="form-group">
            <label>{{ 'patient.address.street' | translate }}</label>
            <input type="text" formControlName="street" />
          </div>
          
          <div class="form-group">
            <label>{{ 'patient.address.postalCode' | translate }}</label>
            <input type="text" formControlName="postalCode" maxlength="5" />
          </div>
        </div>
        
        <!-- Step 4: Emergency Contact -->
        <div class="form-step" *ngIf="currentStep === 3">
          <h2>{{ 'patient.emergency.title' | translate }}</h2>
          
          <div class="form-group">
            <label>{{ 'patient.emergency.name' | translate }}</label>
            <input type="text" formControlName="emergencyName" />
          </div>
          
          <div class="form-group">
            <label>{{ 'patient.emergency.relationship' | translate }}</label>
            <select formControlName="emergencyRelationship">
              <option value="spouse">{{ isRtl ? 'زوج/زوجة' : 'Spouse' }}</option>
              <option value="parent">{{ isRtl ? 'والد/والدة' : 'Parent' }}</option>
              <option value="child">{{ isRtl ? 'ابن/ابنة' : 'Child' }}</option>
              <option value="sibling">{{ isRtl ? 'أخ/أخت' : 'Sibling' }}</option>
              <option value="other">{{ isRtl ? 'أخرى' : 'Other' }}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>{{ 'patient.emergency.phone' | translate }}</label>
            <input type="tel" formControlName="emergencyPhone" dir="ltr" />
          </div>
          
          <div class="form-row">
            <div class="form-group half">
              <label>{{ 'patient.fields.bloodType' | translate }}</label>
              <select formControlName="bloodType">
                <option value="Unknown">{{ isRtl ? 'غير معروف' : 'Unknown' }}</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div class="form-group half">
              <label>{{ 'patient.fields.maritalStatus' | translate }}</label>
              <select formControlName="maritalStatus">
                <option value="single">{{ 'patient.fields.maritalSingle' | translate }}</option>
                <option value="married">{{ 'patient.fields.maritalMarried' | translate }}</option>
                <option value="divorced">{{ 'patient.fields.maritalDivorced' | translate }}</option>
                <option value="widowed">{{ 'patient.fields.maritalWidowed' | translate }}</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Step 5: Review -->
        <div class="form-step" *ngIf="currentStep === 4">
          <h2>{{ 'patient.registration.steps.review' | translate }}</h2>
          
          <div class="review-section">
            <h3>{{ 'patient.registration.steps.identity' | translate }}</h3>
            <div class="review-row">
              <span class="label">{{ 'patient.fields.nationalId' | translate }}:</span>
              <span class="value">{{ registrationForm.value.nationalId }}</span>
            </div>
            <div class="review-row">
              <span class="label">{{ 'patient.fields.fullNameArabic' | translate }}:</span>
              <span class="value">{{ registrationForm.value.fullNameArabic }}</span>
            </div>
            <div class="review-row">
              <span class="label">{{ 'patient.fields.birthDate' | translate }}:</span>
              <span class="value">{{ registrationForm.value.birthDate }}</span>
            </div>
            <div class="review-row">
              <span class="label">{{ 'patient.fields.gender' | translate }}:</span>
              <span class="value">{{ registrationForm.value.gender === 'male' ? ('patient.fields.genderMale' | translate) : ('patient.fields.genderFemale' | translate) }}</span>
            </div>
          </div>
          
          <div class="review-section">
            <h3>{{ 'patient.registration.steps.contact' | translate }}</h3>
            <div class="review-row">
              <span class="label">{{ 'patient.fields.mobileNumber' | translate }}:</span>
              <span class="value">{{ registrationForm.value.mobileNumber }}</span>
            </div>
            <div class="review-row" *ngIf="registrationForm.value.email">
              <span class="label">{{ 'patient.fields.email' | translate }}:</span>
              <span class="value">{{ registrationForm.value.email }}</span>
            </div>
          </div>
          
          <div class="review-section">
            <h3>{{ 'patient.registration.steps.address' | translate }}</h3>
            <div class="review-row">
              <span class="label">{{ 'patient.fields.currentGovernorate' | translate }}:</span>
              <span class="value">{{ registrationForm.value.currentGovernorate }}</span>
            </div>
          </div>
          
          <div class="consent-box">
            <label>
              <input type="checkbox" formControlName="consent" />
              <span *ngIf="isRtl">
                أوافق على معالجة بياناتي الشخصية وفقًا لقانون حماية البيانات الشخصية رقم 151/2020
              </span>
              <span *ngIf="!isRtl">
                I consent to the processing of my personal data in accordance with the Personal Data Protection Law No. 151/2020
              </span>
            </label>
          </div>
        </div>
        
        <!-- Navigation Buttons -->
        <div class="form-actions">
          <button 
            type="button" 
            class="btn btn-secondary" 
            *ngIf="currentStep > 0"
            (click)="previousStep()"
          >
            {{ 'actions.previous' | translate }}
          </button>
          
          <button 
            type="button" 
            class="btn btn-primary" 
            *ngIf="currentStep < steps.length - 1"
            (click)="nextStep()"
            [disabled]="!isCurrentStepValid()"
          >
            {{ 'actions.next' | translate }}
          </button>
          
          <button 
            type="submit" 
            class="btn btn-success" 
            *ngIf="currentStep === steps.length - 1"
            [disabled]="!registrationForm.valid || isSubmitting"
          >
            <span *ngIf="!isSubmitting">{{ 'actions.submit' | translate }}</span>
            <span *ngIf="isSubmitting">{{ 'actions.processing' | translate }}</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./patient-registration.component.scss']
})
export class PatientRegistrationComponent implements OnInit {
  @ViewChild(NidInputComponent) nidInput!: NidInputComponent;
  
  registrationForm!: FormGroup;
  currentStep = 0;
  isSubmitting = false;
  isRtl = false;
  
  steps = [
    { labelKey: 'patient.registration.steps.identity' },
    { labelKey: 'patient.registration.steps.contact' },
    { labelKey: 'patient.registration.steps.address' },
    { labelKey: 'patient.registration.steps.uhis' },
    { labelKey: 'patient.registration.steps.review' }
  ];
  
  governorates = [
    { en: 'Cairo', ar: 'القاهرة' },
    { en: 'Alexandria', ar: 'الإسكندرية' },
    { en: 'Port Said', ar: 'بورسعيد' },
    { en: 'Suez', ar: 'السويس' },
    { en: 'Damietta', ar: 'دمياط' },
    { en: 'Dakahlia', ar: 'الدقهلية' },
    { en: 'Sharqia', ar: 'الشرقية' },
    { en: 'Qalyubia', ar: 'القليوبية' },
    { en: 'Kafr El Sheikh', ar: 'كفر الشيخ' },
    { en: 'Gharbia', ar: 'الغربية' },
    { en: 'Monufia', ar: 'المنوفية' },
    { en: 'Beheira', ar: 'البحيرة' },
    { en: 'Ismailia', ar: 'الإسماعيلية' },
    { en: 'Giza', ar: 'الجيزة' },
    { en: 'Beni Suef', ar: 'بني سويف' },
    { en: 'Fayoum', ar: 'الفيوم' },
    { en: 'Minya', ar: 'المنيا' },
    { en: 'Asyut', ar: 'أسيوط' },
    { en: 'Sohag', ar: 'سوهاج' },
    { en: 'Qena', ar: 'قنا' },
    { en: 'Aswan', ar: 'أسوان' },
    { en: 'Luxor', ar: 'الأقصر' },
    { en: 'Red Sea', ar: 'البحر الأحمر' },
    { en: 'New Valley', ar: 'الوادي الجديد' },
    { en: 'Matruh', ar: 'مطروح' },
    { en: 'North Sinai', ar: 'شمال سيناء' },
    { en: 'South Sinai', ar: 'جنوب سيناء' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private router: Router
  ) {
    this.isRtl = this.translate.currentLang === 'ar';
  }
  
  ngOnInit() {
    this.initForm();
    
    this.translate.onLangChange.subscribe(event => {
      this.isRtl = event.lang === 'ar';
    });
  }
  
  initForm() {
    this.registrationForm = this.fb.group({
      // Step 1: Identity
      nationalId: ['', [Validators.required, Validators.pattern(/^[23]\d{13}$/)]],
      fullNameArabic: ['', [Validators.required, Validators.minLength(5)]],
      fullNameEnglish: [''],
      birthDate: [''],
      gender: [''],
      birthGovernorate: [''],
      
      // Step 2: Contact
      mobileNumber: ['', [Validators.required, Validators.pattern(/^(\+20|0)?1[0125]\d{8}$/)]],
      email: ['', [Validators.email]],
      motherName: [''],
      fatherName: [''],
      
      // Step 3: Address
      currentGovernorate: ['', Validators.required],
      city: [''],
      district: [''],
      street: [''],
      postalCode: [''],
      
      // Step 4: Emergency & Health
      emergencyName: [''],
      emergencyRelationship: [''],
      emergencyPhone: [''],
      bloodType: ['Unknown'],
      maritalStatus: ['single'],
      
      // Step 5: Consent
      consent: [false, Validators.requiredTrue]
    });
  }
  
  get f() {
    return this.registrationForm.controls;
  }
  
  onNidDataExtracted(data: any) {
    if (data) {
      this.registrationForm.patchValue({
        birthDate: data.birthDate,
        gender: data.gender.toLowerCase(),
        birthGovernorate: this.isRtl ? data.governorateAr : data.governorate
      });
    }
  }
  
  isCurrentStepValid(): boolean {
    switch (this.currentStep) {
      case 0:
        return this.f.nationalId.valid && this.f.fullNameArabic.valid;
      case 1:
        return this.f.mobileNumber.valid;
      case 2:
        return this.f.currentGovernorate.valid;
      case 3:
        return true;
      case 4:
        return this.f.consent.valid;
      default:
        return true;
    }
  }
  
  nextStep() {
    if (this.isCurrentStepValid() && this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }
  
  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }
  
  goToStep(index: number) {
    if (index < this.currentStep) {
      this.currentStep = index;
    }
  }
  
  onSubmit() {
    if (this.registrationForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      const formData = this.registrationForm.value;
      
      // Build patient object
      const patient = {
        nationalId: formData.nationalId,
        fullNameArabic: formData.fullNameArabic,
        fullNameEnglish: formData.fullNameEnglish,
        birthDate: formData.birthDate,
        gender: formData.gender,
        birthGovernorate: formData.birthGovernorate,
        currentGovernorate: formData.currentGovernorate,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        motherName: formData.motherName,
        fatherName: formData.fatherName,
        address: {
          city: formData.city,
          district: formData.district,
          street: formData.street,
          postalCode: formData.postalCode
        },
        emergencyContact: {
          name: formData.emergencyName,
          relationship: formData.emergencyRelationship,
          phone: formData.emergencyPhone
        },
        bloodType: formData.bloodType,
        maritalStatus: formData.maritalStatus
      };
      
      // TODO: Call registration service
      console.log('Submitting patient:', patient);
      
      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        // Navigate to success page
        this.router.navigate(['/registration-success']);
      }, 2000);
    }
  }
}

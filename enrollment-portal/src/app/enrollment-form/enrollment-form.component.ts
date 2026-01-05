import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface RegistrationResult {
  osid: string;
  did?: string;
  registrationNumber?: string;
}

@Component({
  selector: 'app-enrollment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatStepperModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatIconModule,
    HttpClientModule,
    FormsModule
  ],
  template: `
    <div class="enrollment-container">
      <!-- Success Card -->
      <mat-card class="success-card" *ngIf="registrationComplete">
        <mat-card-content>
          <div class="success-icon">
            <mat-icon>check_circle</mat-icon>
          </div>
          <h2>Registration Submitted Successfully!</h2>
          <p>Your registration has been submitted for review.</p>
          
          <div class="registration-details">
            <div class="detail-row">
              <span class="label">Registration ID:</span>
              <span class="value">{{ registrationResult?.osid }}</span>
            </div>
            <div class="detail-row" *ngIf="registrationResult?.did">
              <span class="label">Digital Identity (DID):</span>
              <span class="value did">{{ registrationResult?.did }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Status:</span>
              <span class="value status-pending">Pending Review</span>
            </div>
          </div>

          <div class="next-steps">
            <h3>Next Steps</h3>
            <ol>
              <li>Your application will be reviewed by the registration authority</li>
              <li>You will receive an email notification once approved</li>
              <li>After approval, you can access your Professional Dashboard</li>
            </ol>
          </div>

          <button mat-raised-button color="primary" (click)="startNewRegistration()">
            Register Another Professional
          </button>
        </mat-card-content>
      </mat-card>

      <!-- Registration Form -->
      <mat-card class="enrollment-card" *ngIf="!registrationComplete">
        <mat-card-header>
          <mat-card-title>Healthcare Professional Registration</mat-card-title>
          <mat-card-subtitle>Register as a healthcare professional in the HealthFlow National Registry</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-stepper linear #stepper>
            <!-- Step 1: Personal Information -->
            <mat-step [stepControl]="personalInfoForm" label="Personal Information">
              <form [formGroup]="personalInfoForm">
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Professional Type</mat-label>
                    <mat-select formControlName="entityType" required>
                      <mat-option *ngFor="let type of entityTypes" [value]="type.value">
                        {{ type.label }}
                      </mat-option>
                    </mat-select>
                    <mat-hint>Select your professional category</mat-hint>
                  </mat-form-field>
                </div>

                <div class="form-row two-columns">
                  <mat-form-field appearance="outline">
                    <mat-label>First Name</mat-label>
                    <input matInput formControlName="firstName" required>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Last Name</mat-label>
                    <input matInput formControlName="lastName" required>
                  </mat-form-field>
                </div>

                <div class="form-row two-columns">
                  <mat-form-field appearance="outline">
                    <mat-label>Date of Birth</mat-label>
                    <input matInput [matDatepicker]="picker" formControlName="dateOfBirth" required>
                    <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Gender</mat-label>
                    <mat-select formControlName="gender" required>
                      <mat-option value="Male">Male</mat-option>
                      <mat-option value="Female">Female</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>National ID Number</mat-label>
                    <input matInput formControlName="nationalId" required>
                    <mat-hint>14-digit Egyptian National ID</mat-hint>
                  </mat-form-field>
                </div>

                <div class="form-row two-columns">
                  <mat-form-field appearance="outline">
                    <mat-label>Email</mat-label>
                    <input matInput type="email" formControlName="email" required>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Phone Number</mat-label>
                    <input matInput formControlName="phone" required>
                    <mat-hint>Include country code (e.g., +20)</mat-hint>
                  </mat-form-field>
                </div>

                <div class="form-row two-columns">
                  <mat-form-field appearance="outline">
                    <mat-label>City</mat-label>
                    <mat-select formControlName="city" required>
                      <mat-option *ngFor="let city of cities" [value]="city">{{ city }}</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Address</mat-label>
                    <input matInput formControlName="address" required>
                  </mat-form-field>
                </div>

                <div class="step-actions">
                  <button mat-raised-button color="primary" matStepperNext 
                          [disabled]="!personalInfoForm.valid">
                    Next
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 2: Professional Information -->
            <mat-step [stepControl]="professionalInfoForm" label="Professional Details">
              <form [formGroup]="professionalInfoForm">
                <div class="form-row two-columns">
                  <mat-form-field appearance="outline">
                    <mat-label>License Number</mat-label>
                    <input matInput formControlName="licenseNumber" required>
                    <mat-hint>Medical Syndicate License Number</mat-hint>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Years of Experience</mat-label>
                    <input matInput type="number" formControlName="yearsOfExperience" required>
                  </mat-form-field>
                </div>

                <div class="form-row two-columns">
                  <mat-form-field appearance="outline">
                    <mat-label>Qualification</mat-label>
                    <input matInput formControlName="qualification" required>
                    <mat-hint>e.g., MBBS, MD, BSN, PharmD</mat-hint>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>License Expiry Date</mat-label>
                    <input matInput [matDatepicker]="expiryPicker" formControlName="expiryDate" required>
                    <mat-datepicker-toggle matIconSuffix [for]="expiryPicker"></mat-datepicker-toggle>
                    <mat-datepicker #expiryPicker></mat-datepicker>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Specialization</mat-label>
                    <mat-select formControlName="specialization">
                      <mat-option *ngFor="let spec of specializations" [value]="spec">
                        {{ spec }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="form-row two-columns">
                  <mat-form-field appearance="outline">
                    <mat-label>Current Facility/Employer</mat-label>
                    <input matInput formControlName="facilityName">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Department</mat-label>
                    <input matInput formControlName="department">
                  </mat-form-field>
                </div>

                <div class="step-actions">
                  <button mat-button matStepperPrevious>Back</button>
                  <button mat-raised-button color="primary" matStepperNext 
                          [disabled]="!professionalInfoForm.valid">
                    Next
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 3: Documents & Consent -->
            <mat-step label="Review & Submit">
              <div class="review-section">
                <h3>Review Your Information</h3>
                
                <div class="review-group">
                  <h4>Personal Information</h4>
                  <div class="review-grid">
                    <div class="review-item">
                      <span class="label">Name:</span>
                      <span class="value">{{ personalInfoForm.get('firstName')?.value }} {{ personalInfoForm.get('lastName')?.value }}</span>
                    </div>
                    <div class="review-item">
                      <span class="label">Type:</span>
                      <span class="value">{{ personalInfoForm.get('entityType')?.value }}</span>
                    </div>
                    <div class="review-item">
                      <span class="label">Email:</span>
                      <span class="value">{{ personalInfoForm.get('email')?.value }}</span>
                    </div>
                    <div class="review-item">
                      <span class="label">Phone:</span>
                      <span class="value">{{ personalInfoForm.get('phone')?.value }}</span>
                    </div>
                    <div class="review-item">
                      <span class="label">City:</span>
                      <span class="value">{{ personalInfoForm.get('city')?.value }}</span>
                    </div>
                  </div>
                </div>

                <div class="review-group">
                  <h4>Professional Information</h4>
                  <div class="review-grid">
                    <div class="review-item">
                      <span class="label">License Number:</span>
                      <span class="value">{{ professionalInfoForm.get('licenseNumber')?.value }}</span>
                    </div>
                    <div class="review-item">
                      <span class="label">Specialization:</span>
                      <span class="value">{{ professionalInfoForm.get('specialization')?.value || 'General Practice' }}</span>
                    </div>
                    <div class="review-item">
                      <span class="label">Qualification:</span>
                      <span class="value">{{ professionalInfoForm.get('qualification')?.value }}</span>
                    </div>
                    <div class="review-item">
                      <span class="label">Experience:</span>
                      <span class="value">{{ professionalInfoForm.get('yearsOfExperience')?.value }} years</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="document-section">
                <h3>Required Documents</h3>
                <p class="document-note">
                  Please have the following documents ready for verification:
                </p>
                <ul>
                  <li>Valid Professional License</li>
                  <li>National ID Card</li>
                  <li>Qualification Certificates</li>
                </ul>
              </div>

              <div class="consent-section">
                <mat-checkbox [(ngModel)]="consentGiven">
                  I hereby declare that all information provided is accurate and complete. 
                  I consent to the verification of my credentials and the creation of a Digital Identity (DID) for secure credential management.
                </mat-checkbox>
              </div>

              <div class="step-actions">
                <button mat-button matStepperPrevious>Back</button>
                <button mat-raised-button color="primary" 
                        (click)="onSubmit()"
                        [disabled]="!consentGiven || isLoading">
                  <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
                  <span *ngIf="!isLoading">Submit Registration</span>
                </button>
              </div>
            </mat-step>
          </mat-stepper>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .enrollment-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .enrollment-card {
      mat-card-title {
        font-size: 1.5rem;
        color: #1e3a5f;
      }
      mat-card-subtitle {
        color: #666;
      }
    }
    .form-row {
      margin-bottom: 1rem;
      mat-form-field {
        width: 100%;
      }
      &.two-columns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
    }
    .step-actions {
      margin-top: 1.5rem;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }
    .review-section {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      h3 { margin-top: 0; color: #1e3a5f; }
    }
    .review-group {
      margin-bottom: 1.5rem;
      h4 {
        color: #1e3a5f;
        margin-bottom: 0.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #e0e0e0;
      }
    }
    .review-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }
    .review-item {
      display: flex;
      flex-direction: column;
      .label {
        font-size: 12px;
        color: #666;
        text-transform: uppercase;
      }
      .value {
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }
    }
    .document-section {
      background: #fff3e0;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      h3 { margin-top: 0; color: #e65100; }
      ul {
        margin: 0;
        padding-left: 1.5rem;
      }
    }
    .consent-section {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #e3f2fd;
      border-radius: 8px;
    }
    mat-spinner {
      display: inline-block;
      margin-right: 0.5rem;
    }
    .success-card {
      text-align: center;
      padding: 2rem;
      .success-icon {
        mat-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
          color: #4caf50;
        }
      }
      h2 {
        color: #1e3a5f;
        margin: 1rem 0;
      }
    }
    .registration-details {
      background: #f5f5f5;
      padding: 1.5rem;
      border-radius: 8px;
      margin: 1.5rem 0;
      text-align: left;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e0e0e0;
      &:last-child { border-bottom: none; }
      .label { color: #666; }
      .value { 
        font-weight: 500;
        &.did {
          font-family: monospace;
          font-size: 12px;
          word-break: break-all;
        }
        &.status-pending {
          color: #ff9800;
        }
      }
    }
    .next-steps {
      text-align: left;
      background: #e8f5e9;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      h3 { 
        margin-top: 0;
        color: #2e7d32;
      }
      ol {
        margin: 0;
        padding-left: 1.5rem;
      }
    }
  `]
})
export class EnrollmentFormComponent implements OnInit {
  personalInfoForm!: FormGroup;
  professionalInfoForm!: FormGroup;
  consentGiven = false;
  isLoading = false;
  registrationComplete = false;
  registrationResult: RegistrationResult | null = null;
  
  // All 5 professional types
  entityTypes = [
    { value: 'Doctor', label: 'Doctor' },
    { value: 'Nurse', label: 'Nurse' },
    { value: 'Pharmacist', label: 'Pharmacist' },
    { value: 'Dentist', label: 'Dentist' },
    { value: 'Physiotherapist', label: 'Physiotherapist' }
  ];

  cities = [
    'Cairo', 'Alexandria', 'Giza', 'Shubra El Kheima', 'Port Said',
    'Suez', 'Luxor', 'Aswan', 'Asyut', 'Mansoura', 'Tanta', 'Ismailia'
  ];
  
  specializations = [
    'General Practice', 'Internal Medicine', 'Pediatrics', 'Surgery',
    'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 
    'Obstetrics & Gynecology', 'Ophthalmology', 'ENT', 'Psychiatry',
    'Radiology', 'Anesthesiology', 'Emergency Medicine', 'ICU',
    'Dental Surgery', 'Orthodontics', 'Physical Therapy', 'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForms();
  }

  initForms(): void {
    this.personalInfoForm = this.fb.group({
      entityType: ['Doctor', Validators.required],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      nationalId: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      city: ['', Validators.required],
      address: ['', Validators.required]
    });

    this.professionalInfoForm = this.fb.group({
      licenseNumber: ['', Validators.required],
      qualification: ['', Validators.required],
      specialization: ['General Practice'],
      yearsOfExperience: ['', [Validators.required, Validators.min(0)]],
      expiryDate: ['', Validators.required],
      facilityName: [''],
      department: ['']
    });
  }

  async onSubmit(): Promise<void> {
    if (!this.personalInfoForm.valid || !this.professionalInfoForm.valid || !this.consentGiven) {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    
    const entityType = this.personalInfoForm.get('entityType')?.value;
    const firstName = this.personalInfoForm.get('firstName')?.value;
    const lastName = this.personalInfoForm.get('lastName')?.value;
    
    // Format dates
    const dateOfBirth = this.formatDate(this.personalInfoForm.get('dateOfBirth')?.value);
    const expiryDate = this.formatDate(this.professionalInfoForm.get('expiryDate')?.value);
    
    // Build the payload according to the Registry schema
    const licenseNumber = this.professionalInfoForm.get('licenseNumber')?.value;
    const payload: any = {
      fullName: `${firstName} ${lastName}`,
      nationalId: this.personalInfoForm.get('nationalId')?.value,
      email: this.personalInfoForm.get('email')?.value,
      mobile: this.personalInfoForm.get('phone')?.value,
      specialization: this.professionalInfoForm.get('specialization')?.value || 'General Practice',
      status: 'Active',
      // Entity-specific fields
      syndicateNumber: licenseNumber, // For Doctor
      licenseNumber: licenseNumber,   // For Nurse, Pharmacist
      registrationNumber: licenseNumber // For Dentist, Physiotherapist
    };

    try {
      // Step 1: Create the professional entity in the Registry
      const registryResponse = await this.http.post<any>(
        `${environment.apiUrl}/${entityType}`,
        payload
      ).toPromise();

      console.log('Registry response:', registryResponse);

      // Step 2: Try to generate a DID for the professional (optional)
      let did: string | undefined;
      try {
        const didResponse = await this.http.post<any>(
          `${environment.identityUrl}/did/generate`,
          { method: 'rcw' }
        ).toPromise();
        did = didResponse?.[0]?.id;
        console.log('DID generated:', did);
      } catch (didError) {
        console.warn('DID generation failed (optional):', didError);
      }

      // Extract the osid from the response
      const osid = registryResponse?.result?.[entityType]?.osid || 
                   registryResponse?.osid || 
                   registryResponse?.id ||
                   'REG-' + Date.now();

      this.registrationResult = {
        osid: osid,
        did: did,
        registrationNumber: payload.licenseNumber
      };

      this.registrationComplete = true;
      this.snackBar.open('Registration submitted successfully!', 'Close', { duration: 5000 });
      
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.error?.params?.errmsg || 
                          error.error?.message || 
                          error.message ||
                          'Registration failed. Please try again.';
      this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
    } finally {
      this.isLoading = false;
    }
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  startNewRegistration(): void {
    this.registrationComplete = false;
    this.registrationResult = null;
    this.resetForms();
  }

  resetForms(): void {
    this.personalInfoForm.reset({ entityType: 'Doctor' });
    this.professionalInfoForm.reset({ specialization: 'General Practice' });
    this.consentGiven = false;
  }
}

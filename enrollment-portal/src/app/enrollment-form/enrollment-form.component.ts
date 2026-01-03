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
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment';

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
    HttpClientModule,
    FormsModule
  ],
  template: `
    <div class="enrollment-container">
      <mat-card class="enrollment-card">
        <mat-card-header>
          <mat-card-title>Healthcare Professional Registration</mat-card-title>
          <mat-card-subtitle>Register as a healthcare professional in the HealthFlow Registry</mat-card-subtitle>
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

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Address</mat-label>
                    <textarea matInput formControlName="address" rows="2" required></textarea>
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
                    <mat-label>Registration Number</mat-label>
                    <input matInput formControlName="registrationNumber" required>
                    <mat-hint>Medical Syndicate Registration Number</mat-hint>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Years of Experience</mat-label>
                    <input matInput type="number" formControlName="yearsOfExperience" required>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Qualification</mat-label>
                    <input matInput formControlName="qualification" required>
                    <mat-hint>e.g., MBBS, MD, BSN, PharmD</mat-hint>
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

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Current Employer</mat-label>
                    <input matInput formControlName="currentEmployer">
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
            <mat-step label="Documents & Submit">
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
                  I consent to the verification of my credentials.
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
        color: #1976d2;
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
    .document-section {
      background: #f5f5f5;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      h3 { margin-top: 0; color: #1976d2; }
    }
    .consent-section {
      margin-bottom: 1.5rem;
    }
    mat-spinner {
      display: inline-block;
      margin-right: 0.5rem;
    }
  `]
})
export class EnrollmentFormComponent implements OnInit {
  personalInfoForm!: FormGroup;
  professionalInfoForm!: FormGroup;
  consentGiven = false;
  isLoading = false;
  
  entityTypes = [
    { value: 'Doctor', label: 'Doctor' },
    { value: 'Nurse', label: 'Nurse' },
    { value: 'Pharmacist', label: 'Pharmacist' }
  ];
  
  specializations = [
    'General Practice', 'Internal Medicine', 'Pediatrics', 'Surgery',
    'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 'Other'
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
      address: ['', Validators.required]
    });

    this.professionalInfoForm = this.fb.group({
      registrationNumber: ['', Validators.required],
      qualification: ['', Validators.required],
      specialization: [''],
      yearsOfExperience: ['', [Validators.required, Validators.min(0)]],
      currentEmployer: ['']
    });
  }

  async onSubmit(): Promise<void> {
    if (!this.personalInfoForm.valid || !this.professionalInfoForm.valid || !this.consentGiven) {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    
    const entityType = this.personalInfoForm.get('entityType')?.value;
    const payload = {
      ...this.personalInfoForm.value,
      ...this.professionalInfoForm.value,
      name: `${this.personalInfoForm.get('firstName')?.value} ${this.personalInfoForm.get('lastName')?.value}`,
      status: 'PENDING'
    };

    try {
      await this.http.post(`${environment.apiUrl}/${entityType}`, payload).toPromise();
      this.snackBar.open('Registration submitted successfully!', 'Close', { duration: 5000 });
      this.resetForms();
    } catch (error: any) {
      this.snackBar.open(error.error?.message || 'Registration failed.', 'Close', { duration: 5000 });
    } finally {
      this.isLoading = false;
    }
  }

  resetForms(): void {
    this.personalInfoForm.reset({ entityType: 'Doctor' });
    this.professionalInfoForm.reset();
    this.consentGiven = false;
  }
}

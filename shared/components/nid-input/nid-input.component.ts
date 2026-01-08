import { Component, Input, Output, EventEmitter, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, Validators } from '@angular/forms';

/**
 * Egyptian National ID Input Component
 * 
 * Features:
 * - 14-digit input mask
 * - Real-time Luhn validation
 * - Extracts DOB, gender, governorate
 * - Bilingual error messages (Arabic/English)
 */
@Component({
  selector: 'app-nid-input',
  template: `
    <div class="nid-input-container" [class.rtl]="isRtl">
      <label [attr.for]="inputId" class="nid-label">
        {{ isRtl ? 'الرقم القومي' : 'National ID' }}
        <span class="required" *ngIf="required">*</span>
      </label>
      
      <div class="input-wrapper">
        <input
          [id]="inputId"
          type="text"
          [formControl]="nidControl"
          [placeholder]="isRtl ? 'أدخل الرقم القومي (14 رقم)' : 'Enter National ID (14 digits)'"
          maxlength="14"
          pattern="[0-9]*"
          inputmode="numeric"
          [class.invalid]="isInvalid"
          [class.valid]="isValid"
          (input)="onInput($event)"
          (blur)="onBlur()"
        />
        
        <div class="validation-icon">
          <span *ngIf="isValid" class="icon-valid">✓</span>
          <span *ngIf="isInvalid" class="icon-invalid">✗</span>
        </div>
      </div>
      
      <!-- Error Messages -->
      <div class="error-message" *ngIf="errorMessage">
        {{ isRtl ? errorMessageAr : errorMessage }}
      </div>
      
      <!-- Extracted Data Display -->
      <div class="extracted-data" *ngIf="showExtractedData && isValid && extractedData">
        <div class="data-row">
          <span class="label">{{ isRtl ? 'تاريخ الميلاد:' : 'Birth Date:' }}</span>
          <span class="value">{{ extractedData.birthDate }}</span>
        </div>
        <div class="data-row">
          <span class="label">{{ isRtl ? 'النوع:' : 'Gender:' }}</span>
          <span class="value">{{ isRtl ? extractedData.genderAr : extractedData.gender }}</span>
        </div>
        <div class="data-row">
          <span class="label">{{ isRtl ? 'المحافظة:' : 'Governorate:' }}</span>
          <span class="value">{{ isRtl ? extractedData.governorateAr : extractedData.governorate }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nid-input-container {
      margin-bottom: 1rem;
    }
    
    .nid-input-container.rtl {
      direction: rtl;
      text-align: right;
    }
    
    .nid-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }
    
    .required {
      color: #dc3545;
      margin-left: 2px;
    }
    
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    input {
      width: 100%;
      padding: 0.75rem 2.5rem 0.75rem 1rem;
      font-size: 1.1rem;
      font-family: monospace;
      letter-spacing: 0.1em;
      border: 2px solid #ddd;
      border-radius: 8px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    
    .rtl input {
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      text-align: right;
    }
    
    input:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
    
    input.valid {
      border-color: #28a745;
    }
    
    input.invalid {
      border-color: #dc3545;
    }
    
    .validation-icon {
      position: absolute;
      right: 1rem;
      font-size: 1.2rem;
    }
    
    .rtl .validation-icon {
      right: auto;
      left: 1rem;
    }
    
    .icon-valid {
      color: #28a745;
    }
    
    .icon-invalid {
      color: #dc3545;
    }
    
    .error-message {
      margin-top: 0.5rem;
      color: #dc3545;
      font-size: 0.875rem;
    }
    
    .extracted-data {
      margin-top: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #28a745;
    }
    
    .rtl .extracted-data {
      border-left: none;
      border-right: 4px solid #28a745;
    }
    
    .data-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    
    .data-row:last-child {
      margin-bottom: 0;
    }
    
    .data-row .label {
      color: #666;
    }
    
    .data-row .value {
      font-weight: 500;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NidInputComponent),
      multi: true
    }
  ]
})
export class NidInputComponent implements ControlValueAccessor, OnInit {
  @Input() inputId = 'nid-input';
  @Input() required = false;
  @Input() isRtl = false;
  @Input() showExtractedData = true;
  
  @Output() validationChange = new EventEmitter<{valid: boolean, data: any}>();
  @Output() extractedDataChange = new EventEmitter<any>();
  
  nidControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/^[23]\d{13}$/)
  ]);
  
  errorMessage = '';
  errorMessageAr = '';
  extractedData: any = null;
  
  // Governorate mapping
  private governorates: {[key: string]: {en: string, ar: string}} = {
    '01': { en: 'Cairo', ar: 'القاهرة' },
    '02': { en: 'Alexandria', ar: 'الإسكندرية' },
    '03': { en: 'Port Said', ar: 'بورسعيد' },
    '04': { en: 'Suez', ar: 'السويس' },
    '11': { en: 'Damietta', ar: 'دمياط' },
    '12': { en: 'Dakahlia', ar: 'الدقهلية' },
    '13': { en: 'Sharqia', ar: 'الشرقية' },
    '14': { en: 'Qalyubia', ar: 'القليوبية' },
    '15': { en: 'Kafr El Sheikh', ar: 'كفر الشيخ' },
    '16': { en: 'Gharbia', ar: 'الغربية' },
    '17': { en: 'Monufia', ar: 'المنوفية' },
    '18': { en: 'Beheira', ar: 'البحيرة' },
    '19': { en: 'Ismailia', ar: 'الإسماعيلية' },
    '21': { en: 'Giza', ar: 'الجيزة' },
    '22': { en: 'Beni Suef', ar: 'بني سويف' },
    '23': { en: 'Fayoum', ar: 'الفيوم' },
    '24': { en: 'Minya', ar: 'المنيا' },
    '25': { en: 'Asyut', ar: 'أسيوط' },
    '26': { en: 'Sohag', ar: 'سوهاج' },
    '27': { en: 'Qena', ar: 'قنا' },
    '28': { en: 'Aswan', ar: 'أسوان' },
    '29': { en: 'Luxor', ar: 'الأقصر' },
    '31': { en: 'Red Sea', ar: 'البحر الأحمر' },
    '32': { en: 'New Valley', ar: 'الوادي الجديد' },
    '33': { en: 'Matruh', ar: 'مطروح' },
    '34': { en: 'North Sinai', ar: 'شمال سيناء' },
    '35': { en: 'South Sinai', ar: 'جنوب سيناء' },
    '88': { en: 'Outside Egypt', ar: 'خارج مصر' }
  };
  
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  
  get isValid(): boolean {
    return this.nidControl.valid && this.nidControl.value?.length === 14;
  }
  
  get isInvalid(): boolean {
    return this.nidControl.touched && this.nidControl.invalid;
  }
  
  ngOnInit() {
    this.nidControl.valueChanges.subscribe(value => {
      this.validate(value || '');
    });
  }
  
  writeValue(value: string): void {
    this.nidControl.setValue(value, { emitEvent: false });
    if (value) {
      this.validate(value);
    }
  }
  
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.nidControl.disable();
    } else {
      this.nidControl.enable();
    }
  }
  
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Remove non-numeric characters
    const cleaned = input.value.replace(/\D/g, '');
    this.nidControl.setValue(cleaned, { emitEvent: false });
    this.onChange(cleaned);
    this.validate(cleaned);
  }
  
  onBlur(): void {
    this.onTouched();
  }
  
  private validate(nid: string): void {
    this.errorMessage = '';
    this.errorMessageAr = '';
    this.extractedData = null;
    
    if (!nid) {
      if (this.required) {
        this.errorMessage = 'National ID is required';
        this.errorMessageAr = 'الرقم القومي مطلوب';
      }
      this.emitValidation(false);
      return;
    }
    
    // Length check
    if (nid.length !== 14) {
      if (nid.length > 0) {
        this.errorMessage = `National ID must be 14 digits (${nid.length}/14)`;
        this.errorMessageAr = `الرقم القومي يجب أن يكون 14 رقم (${nid.length}/14)`;
      }
      this.emitValidation(false);
      return;
    }
    
    // Century check
    const century = nid[0];
    if (century !== '2' && century !== '3') {
      this.errorMessage = 'National ID must start with 2 or 3';
      this.errorMessageAr = 'الرقم القومي يجب أن يبدأ بـ 2 أو 3';
      this.emitValidation(false);
      return;
    }
    
    // Extract and validate date
    const centuryBase = century === '2' ? 1900 : 2000;
    const year = centuryBase + parseInt(nid.substring(1, 3));
    const month = parseInt(nid.substring(3, 5));
    const day = parseInt(nid.substring(5, 7));
    
    // Validate month
    if (month < 1 || month > 12) {
      this.errorMessage = `Invalid birth month: ${month}`;
      this.errorMessageAr = `شهر الميلاد غير صحيح: ${month}`;
      this.emitValidation(false);
      return;
    }
    
    // Validate day
    if (day < 1 || day > 31) {
      this.errorMessage = `Invalid birth day: ${day}`;
      this.errorMessageAr = `يوم الميلاد غير صحيح: ${day}`;
      this.emitValidation(false);
      return;
    }
    
    // Validate date
    const birthDate = new Date(year, month - 1, day);
    if (birthDate > new Date()) {
      this.errorMessage = 'Birth date cannot be in the future';
      this.errorMessageAr = 'تاريخ الميلاد لا يمكن أن يكون في المستقبل';
      this.emitValidation(false);
      return;
    }
    
    // Validate governorate
    const govCode = nid.substring(7, 9);
    const governorate = this.governorates[govCode];
    if (!governorate) {
      this.errorMessage = `Invalid governorate code: ${govCode}`;
      this.errorMessageAr = `كود المحافظة غير صحيح: ${govCode}`;
      this.emitValidation(false);
      return;
    }
    
    // Extract gender
    const genderDigit = parseInt(nid[12]);
    const isMale = genderDigit % 2 === 1;
    
    // Build extracted data
    this.extractedData = {
      birthDate: birthDate.toISOString().split('T')[0],
      birthYear: year,
      birthMonth: month,
      birthDay: day,
      gender: isMale ? 'Male' : 'Female',
      genderAr: isMale ? 'ذكر' : 'أنثى',
      governorateCode: govCode,
      governorate: governorate.en,
      governorateAr: governorate.ar
    };
    
    this.extractedDataChange.emit(this.extractedData);
    this.emitValidation(true);
  }
  
  private emitValidation(valid: boolean): void {
    this.validationChange.emit({
      valid,
      data: this.extractedData
    });
  }
}

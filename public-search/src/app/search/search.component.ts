import { Component } from '@angular/core';
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

interface Professional {
  id: string;
  name: string;
  type: string;
  specialization: string;
  registrationNumber: string;
  location: string;
  status: 'Active' | 'Pending' | 'Suspended';
  facility?: string;
  licenseExpiry: string;
  credentials: { name: string; issuer: string; date: string }[];
}

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
    MatSnackBarModule
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  searchQuery = '';
  loading = false;
  
  filters = {
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

  professionals: Professional[] = [
    {
      id: '1',
      name: 'Dr. Ahmed Hassan',
      type: 'Doctor',
      specialization: 'Cardiology',
      registrationNumber: 'EG-DOC-2024-001',
      location: 'Cairo',
      status: 'Active',
      facility: 'Cairo University Hospital',
      licenseExpiry: '2026-12-31',
      credentials: [
        { name: 'Medical License', issuer: 'Egyptian Medical Syndicate', date: '2024-01-15' },
        { name: 'Cardiology Certification', issuer: 'Egyptian Board', date: '2023-06-20' }
      ]
    },
    {
      id: '2',
      name: 'Dr. Fatima Ali',
      type: 'Doctor',
      specialization: 'Pediatrics',
      registrationNumber: 'EG-DOC-2024-002',
      location: 'Alexandria',
      status: 'Active',
      facility: 'Alexandria Children Hospital',
      licenseExpiry: '2026-08-15',
      credentials: [
        { name: 'Medical License', issuer: 'Egyptian Medical Syndicate', date: '2024-02-10' }
      ]
    },
    {
      id: '3',
      name: 'Nurse Sarah Mohamed',
      type: 'Nurse',
      specialization: 'General Practice',
      registrationNumber: 'EG-NRS-2024-001',
      location: 'Cairo',
      status: 'Active',
      facility: 'Dar El Fouad Hospital',
      licenseExpiry: '2025-11-30',
      credentials: [
        { name: 'Nursing License', issuer: 'Egyptian Nursing Syndicate', date: '2024-03-05' }
      ]
    },
    {
      id: '4',
      name: 'Nurse Mona Adel',
      type: 'Nurse',
      specialization: 'General Practice',
      registrationNumber: 'EG-NRS-2024-002',
      location: 'Giza',
      status: 'Active',
      facility: 'Giza General Hospital',
      licenseExpiry: '2025-09-20',
      credentials: [
        { name: 'Nursing License', issuer: 'Egyptian Nursing Syndicate', date: '2024-01-20' }
      ]
    },
    {
      id: '5',
      name: 'Dr. Omar Khalil',
      type: 'Pharmacist',
      specialization: 'General Practice',
      registrationNumber: 'EG-PHR-2024-001',
      location: 'Cairo',
      status: 'Active',
      facility: 'El Ezaby Pharmacy',
      licenseExpiry: '2026-03-15',
      credentials: [
        { name: 'Pharmacy License', issuer: 'Egyptian Pharmacists Syndicate', date: '2024-04-10' }
      ]
    },
    {
      id: '6',
      name: 'Dr. Layla Ibrahim',
      type: 'Dentist',
      specialization: 'Dental Surgery',
      registrationNumber: 'EG-DNT-2024-001',
      location: 'Cairo',
      status: 'Active',
      facility: 'Cairo Dental Center',
      licenseExpiry: '2026-06-30',
      credentials: [
        { name: 'Dental License', issuer: 'Egyptian Dental Syndicate', date: '2024-02-28' },
        { name: 'Oral Surgery Certification', issuer: 'Egyptian Board', date: '2023-11-15' }
      ]
    },
    {
      id: '7',
      name: 'Dr. Karim Nasser',
      type: 'Dentist',
      specialization: 'Dental Surgery',
      registrationNumber: 'EG-DNT-2024-002',
      location: 'Alexandria',
      status: 'Active',
      facility: 'Alexandria Dental Clinic',
      licenseExpiry: '2026-04-20',
      credentials: [
        { name: 'Dental License', issuer: 'Egyptian Dental Syndicate', date: '2024-03-15' }
      ]
    },
    {
      id: '8',
      name: 'Dr. Hana Mostafa',
      type: 'Physiotherapist',
      specialization: 'Physical Therapy',
      registrationNumber: 'EG-PHY-2024-001',
      location: 'Cairo',
      status: 'Active',
      facility: 'Cairo Rehabilitation Center',
      licenseExpiry: '2026-05-10',
      credentials: [
        { name: 'Physiotherapy License', issuer: 'Egyptian Physical Therapy Syndicate', date: '2024-01-25' }
      ]
    },
    {
      id: '9',
      name: 'Dr. Youssef Amin',
      type: 'Physiotherapist',
      specialization: 'Physical Therapy',
      registrationNumber: 'EG-PHY-2024-002',
      location: 'Giza',
      status: 'Pending',
      facility: 'Giza Sports Medicine Center',
      licenseExpiry: '2026-07-25',
      credentials: [
        { name: 'Physiotherapy License', issuer: 'Egyptian Physical Therapy Syndicate', date: '2024-05-10' }
      ]
    },
    {
      id: '10',
      name: 'Dr. Nadia Farouk',
      type: 'Doctor',
      specialization: 'Neurology',
      registrationNumber: 'EG-DOC-2024-003',
      location: 'Cairo',
      status: 'Active',
      facility: 'Ain Shams University Hospital',
      licenseExpiry: '2026-09-30',
      credentials: [
        { name: 'Medical License', issuer: 'Egyptian Medical Syndicate', date: '2024-04-20' },
        { name: 'Neurology Certification', issuer: 'Egyptian Board', date: '2023-12-10' }
      ]
    }
  ];

  filteredResults: Professional[] = [...this.professionals];
  selectedProfessional: Professional | null = null;
  showDetailsModal = false;
  showVerifyModal = false;
  verificationTimestamp = '';

  pageSize = 6;
  currentPage = 0;

  constructor(private snackBar: MatSnackBar) {}

  get totalPages(): number {
    return Math.ceil(this.filteredResults.length / this.pageSize);
  }

  get paginatedResults(): Professional[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredResults.slice(start, start + this.pageSize);
  }

  search(): void {
    this.loading = true;
    setTimeout(() => {
      this.applyFilters();
      this.loading = false;
    }, 500);
  }

  applyFilters(): void {
    this.filteredResults = this.professionals.filter(p => {
      const matchesSearch = !this.searchQuery || 
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.registrationNumber.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesType = !this.filters.type || p.type === this.filters.type;
      const matchesSpec = !this.filters.specialization || p.specialization === this.filters.specialization;
      const matchesLocation = !this.filters.location || p.location === this.filters.location;
      const matchesStatus = !this.filters.status || p.status === this.filters.status;
      return matchesSearch && matchesType && matchesSpec && matchesLocation && matchesStatus;
    });
    this.currentPage = 0;
  }

  clearFilters(): void {
    this.filters = { type: '', specialization: '', location: '', status: '' };
    this.searchQuery = '';
    this.filteredResults = [...this.professionals];
    this.currentPage = 0;
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
    this.snackBar.open('Verification proof downloaded', 'Close', { duration: 3000 });
  }

  previousPage(): void {
    if (this.currentPage > 0) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) this.currentPage++;
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

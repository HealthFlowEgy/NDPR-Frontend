import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';

/**
 * Document interface following Sunbird RC eLocker patterns
 */
export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadProgress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

/**
 * Document Upload Component with Drag-and-Drop
 * Following Sunbird RC document management best practices
 */
@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatCardModule,
    MatSnackBarModule
  ],
  template: `
    <div class="upload-container">
      <!-- Drag and Drop Zone -->
      <div
        class="upload-zone"
        [class.drag-over]="isDragOver"
        [class.disabled]="disabled"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        <mat-icon class="upload-icon">cloud_upload</mat-icon>
        <p class="upload-text">
          Drag and drop files here or <span class="browse-link">browse</span>
        </p>
        <p class="upload-hint">
          Accepted: {{ acceptedTypesDisplay }} (Max {{ maxFileSizeMB }}MB each)
        </p>
        <input
          #fileInput
          type="file"
          [accept]="acceptedTypes"
          [multiple]="multiple"
          (change)="onFileSelected($event)"
          hidden
        />
      </div>

      <!-- Uploaded Files List -->
      <div class="uploaded-files" *ngIf="documents.length > 0">
        <mat-card class="document-item" *ngFor="let doc of documents">
          <div class="document-content">
            <mat-icon class="file-icon" [ngClass]="getFileIconClass(doc.type)">
              {{ getFileIcon(doc.type) }}
            </mat-icon>
            
            <div class="document-info">
              <span class="document-name">{{ doc.name }}</span>
              <span class="document-size">{{ formatSize(doc.size) }}</span>
              <span class="document-status" [ngClass]="'status-' + doc.status">
                {{ getStatusText(doc.status) }}
              </span>
            </div>

            <div class="document-actions">
              <!-- Preview button -->
              <button
                mat-icon-button
                *ngIf="doc.status === 'completed'"
                (click)="previewDocument(doc)"
                matTooltip="Preview"
              >
                <mat-icon>visibility</mat-icon>
              </button>
              
              <!-- Remove button -->
              <button
                mat-icon-button
                color="warn"
                (click)="removeDocument(doc)"
                [disabled]="doc.status === 'uploading'"
                matTooltip="Remove"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>

          <!-- Progress bar -->
          <mat-progress-bar
            *ngIf="doc.status === 'uploading'"
            mode="determinate"
            [value]="doc.uploadProgress"
          ></mat-progress-bar>

          <!-- Error message -->
          <div class="error-message" *ngIf="doc.status === 'error'">
            {{ doc.errorMessage }}
          </div>
        </mat-card>
      </div>

      <!-- Document Type Selector (if required) -->
      <div class="document-type-info" *ngIf="documentType">
        <mat-icon>info</mat-icon>
        <span>Uploading: {{ documentType }}</span>
      </div>
    </div>
  `,
  styles: [`
    .upload-container {
      width: 100%;
    }

    .upload-zone {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background-color: #fafafa;
    }

    .upload-zone:hover {
      border-color: #1976d2;
      background-color: #e3f2fd;
    }

    .upload-zone.drag-over {
      border-color: #1976d2;
      background-color: #bbdefb;
      transform: scale(1.02);
    }

    .upload-zone.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .upload-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #1976d2;
      margin-bottom: 16px;
    }

    .upload-text {
      font-size: 16px;
      color: #333;
      margin-bottom: 8px;
    }

    .browse-link {
      color: #1976d2;
      text-decoration: underline;
    }

    .upload-hint {
      font-size: 12px;
      color: #666;
    }

    .uploaded-files {
      margin-top: 16px;
    }

    .document-item {
      margin-bottom: 8px;
      padding: 12px;
    }

    .document-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .file-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .file-icon.pdf {
      color: #f44336;
    }

    .file-icon.image {
      color: #4CAF50;
    }

    .file-icon.default {
      color: #9E9E9E;
    }

    .document-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .document-name {
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 200px;
    }

    .document-size {
      font-size: 12px;
      color: #666;
    }

    .document-status {
      font-size: 11px;
      font-weight: 500;
    }

    .status-pending {
      color: #FF9800;
    }

    .status-uploading {
      color: #2196F3;
    }

    .status-completed {
      color: #4CAF50;
    }

    .status-error {
      color: #f44336;
    }

    .document-actions {
      display: flex;
      gap: 4px;
    }

    .error-message {
      color: #f44336;
      font-size: 12px;
      margin-top: 8px;
      padding-left: 44px;
    }

    .document-type-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 8px 12px;
      background-color: #e3f2fd;
      border-radius: 4px;
      font-size: 14px;
      color: #1976d2;
    }
  `]
})
export class DocumentUploadComponent {
  @Input() documentType: string = '';
  @Input() acceptedTypes: string = '.pdf,.jpg,.jpeg,.png';
  @Input() maxFileSizeMB: number = 10;
  @Input() multiple: boolean = true;
  @Input() disabled: boolean = false;
  @Input() maxFiles: number = 5;

  @Output() documentsChanged = new EventEmitter<UploadedDocument[]>();
  @Output() uploadComplete = new EventEmitter<UploadedDocument>();
  @Output() uploadError = new EventEmitter<{ document: UploadedDocument; error: string }>();

  documents: UploadedDocument[] = [];
  isDragOver = false;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  get acceptedTypesDisplay(): string {
    return this.acceptedTypes
      .split(',')
      .map(t => t.replace('.', '').toUpperCase())
      .join(', ');
  }

  get maxFileSizeBytes(): number {
    return this.maxFileSizeMB * 1024 * 1024;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled) {
      this.isDragOver = true;
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (this.disabled) return;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
      input.value = ''; // Reset input
    }
  }

  private handleFiles(files: File[]): void {
    // Check max files limit
    if (this.documents.length + files.length > this.maxFiles) {
      this.snackBar.open(
        `Maximum ${this.maxFiles} files allowed`,
        'Close',
        { duration: 3000 }
      );
      return;
    }

    for (const file of files) {
      if (!this.validateFile(file)) continue;

      const document: UploadedDocument = {
        id: this.generateId(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: '',
        uploadProgress: 0,
        status: 'pending'
      };

      this.documents.push(document);
      this.uploadFile(file, document);
    }

    this.documentsChanged.emit(this.documents);
  }

  private validateFile(file: File): boolean {
    // Check file type
    const allowedTypes = this.acceptedTypes.split(',').map(t => {
      const ext = t.trim().toLowerCase();
      if (ext === '.pdf') return 'application/pdf';
      if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
      if (ext === '.png') return 'image/png';
      return ext;
    });

    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    const isTypeAllowed = this.acceptedTypes.split(',').includes(fileExt) ||
                          allowedTypes.includes(file.type);

    if (!isTypeAllowed) {
      this.snackBar.open(
        `File type not allowed: ${file.name}`,
        'Close',
        { duration: 3000 }
      );
      return false;
    }

    // Check file size
    if (file.size > this.maxFileSizeBytes) {
      this.snackBar.open(
        `File too large: ${file.name} (max ${this.maxFileSizeMB}MB)`,
        'Close',
        { duration: 3000 }
      );
      return false;
    }

    return true;
  }

  private uploadFile(file: File, document: UploadedDocument): void {
    document.status = 'uploading';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', this.documentType || 'enrollment');

    this.http
      .post(`${environment.apiUrl}/documents/upload`, formData, {
        reportProgress: true,
        observe: 'events'
      })
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            document.uploadProgress = Math.round((100 * event.loaded) / event.total);
          } else if (event.type === HttpEventType.Response) {
            document.status = 'completed';
            document.url = (event.body as any)?.url || '';
            this.documentsChanged.emit(this.documents);
            this.uploadComplete.emit(document);
          }
        },
        error: (error) => {
          document.status = 'error';
          document.errorMessage = error.message || 'Upload failed';
          this.uploadError.emit({ document, error: document.errorMessage });
        }
      });
  }

  previewDocument(document: UploadedDocument): void {
    if (document.url) {
      window.open(document.url, '_blank');
    }
  }

  removeDocument(document: UploadedDocument): void {
    this.documents = this.documents.filter(d => d.id !== document.id);
    this.documentsChanged.emit(this.documents);
  }

  getFileIcon(type: string): string {
    if (type === 'application/pdf') return 'picture_as_pdf';
    if (type.startsWith('image/')) return 'image';
    return 'insert_drive_file';
  }

  getFileIconClass(type: string): string {
    if (type === 'application/pdf') return 'pdf';
    if (type.startsWith('image/')) return 'image';
    return 'default';
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Pending';
      case 'uploading': return 'Uploading...';
      case 'completed': return 'Uploaded';
      case 'error': return 'Failed';
      default: return status;
    }
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  private generateId(): string {
    return `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public method to get all uploaded documents
  getUploadedDocuments(): UploadedDocument[] {
    return this.documents.filter(d => d.status === 'completed');
  }

  // Public method to clear all documents
  clearAll(): void {
    this.documents = [];
    this.documentsChanged.emit(this.documents);
  }
}

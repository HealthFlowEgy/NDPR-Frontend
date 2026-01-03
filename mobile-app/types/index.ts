/**
 * HealthFlow Mobile App - Type Definitions
 * 
 * Complete type definitions for the mobile application.
 */

// ============================================
// Authentication Types
// ============================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: AuthTokens | null;
  user: UserProfile | null;
  error: string | null;
}

export interface UserProfile {
  sub: string;
  email: string;
  name: string;
  preferred_username: string;
  given_name?: string;
  family_name?: string;
  email_verified: boolean;
}

// ============================================
// DID Types
// ============================================

export interface DIDDocument {
  '@context': string[];
  id: string;
  alsoKnownAs?: string[];
  verificationMethod: VerificationMethod[];
  authentication?: string[];
  assertionMethod?: string[];
  service?: DIDService[];
}

export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyMultibase?: string;
  publicKeyJwk?: Record<string, string>;
}

export interface DIDService {
  id: string;
  type: string;
  serviceEndpoint: string;
}

export interface GenerateDIDRequest {
  content: Array<{
    alsoKnownAs?: string[];
    services?: DIDService[];
    method: 'web';
  }>;
}

export interface GenerateDIDResponse extends DIDDocument {}

// ============================================
// Credential Types
// ============================================

export interface VerifiableCredential {
  '@context': string[];
  id?: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: CredentialSubject;
  proof?: CredentialProof;
}

export interface CredentialSubject {
  id: string;
  [key: string]: unknown;
}

export interface CredentialProof {
  type: string;
  created: string;
  verificationMethod: string;
  proofPurpose: string;
  proofValue: string;
}

export interface ProfessionalCredential extends VerifiableCredential {
  credentialSubject: {
    id: string;
    name: string;
    nationalId: string;
    professionalType: ProfessionalType;
    syndicateNumber: string;
    specialization?: string;
    licenseStatus: 'active' | 'suspended' | 'revoked';
    licenseExpiry?: string;
  };
}

export type ProfessionalType = 'Doctor' | 'Nurse' | 'Pharmacist';

// ============================================
// Signing Types
// ============================================

export type DocumentType = 
  | 'prescription'
  | 'medical_certificate'
  | 'referral_letter'
  | 'dispensing_record'
  | 'pre_authorization'
  | 'lab_report';

export type SigningRequestStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'expired';

export interface SigningRequest {
  id: string;
  professional_id: string;
  document_type: DocumentType;
  requester_name: string;
  requester_id?: string;
  patient_name?: string;
  patient_id?: string;
  document_hash: string;
  document_preview?: DocumentPreview;
  status: SigningRequestStatus;
  created_at: string;
  expires_at: string;
  priority: 'urgent' | 'normal';
}

export interface DocumentPreview {
  title: string;
  summary: string;
  medications?: MedicationItem[];
  notes?: string;
}

export interface MedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions?: string;
}

export interface SigningRequestsResponse {
  requests: SigningRequest[];
  total: number;
}

export interface ApproveSigningRequest {
  biometric_verified: boolean;
  device_info: string;
}

export interface RejectSigningRequest {
  reason: string;
  device_info?: string;
}

export interface SigningResponse {
  status: 'approved' | 'rejected';
  signed_document?: VerifiableCredential;
  message: string;
}

export interface SigningStats {
  total_signed: number;
  total_rejected: number;
  total_pending: number;
  total_expired: number;
  total_requests: number;
}

export interface SigningHistoryItem {
  id: string;
  document_type: DocumentType;
  requester_name: string;
  patient_name?: string;
  status: 'approved' | 'rejected';
  signed_at: string;
  document_hash: string;
}

// ============================================
// QR Code Types
// ============================================

export interface QRCodeData {
  type: 'healthflow-credential';
  did: string;
  credential_id?: string;
}

export interface VerificationResult {
  isValid: boolean;
  credential?: VerifiableCredential;
  signerDID?: string;
  signerName?: string;
  error?: string;
}

// ============================================
// Notification Types
// ============================================

export interface PushNotification {
  id: string;
  type: 'signing_request' | 'credential_issued' | 'credential_expiring' | 'system';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

// ============================================
// Device Types
// ============================================

export interface DeviceInfo {
  id: string;
  name: string;
  platform: 'ios' | 'android';
  model: string;
  osVersion: string;
  appVersion: string;
}

export interface BiometricCapabilities {
  isAvailable: boolean;
  biometricType: 'face' | 'fingerprint' | 'iris' | 'none';
  isEnrolled: boolean;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================
// Redux State Types
// ============================================

export interface RootState {
  auth: AuthState;
  credentials: CredentialsState;
  signing: SigningState;
}

export interface CredentialsState {
  credentials: ProfessionalCredential[];
  userDID: DIDDocument | null;
  isLoading: boolean;
  error: string | null;
}

export interface SigningState {
  requests: SigningRequest[];
  history: SigningHistoryItem[];
  stats: SigningStats | null;
  selectedRequestId: string | null;
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
}

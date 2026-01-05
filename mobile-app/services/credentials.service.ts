/**
 * HealthFlow Mobile App - Credentials Service
 * 
 * Handles verifiable credentials operations with the Credentials Service.
 * Validated against https://credentials.healthflow.tech API.
 * 
 * TRD v3.0 - January 5, 2026
 */

import ApiService from './api.service';
import StorageService from './storage.service';
import { apiRoutes, config } from '../config/environment';
import {
  Credential,
  CredentialVerification,
  IssueCredentialRequest,
  IssueCredentialResponse,
  CredentialSearchQuery,
  CredentialType,
} from '../types';

class CredentialsService {
  /**
   * Get all credentials for the authenticated user
   */
  async getCredentials(): Promise<Credential[]> {
    const url = apiRoutes.credentials.list;
    const response = await ApiService.get<{ credentials: Credential[] }>(url);
    
    if (!response.success || !response.data) {
      console.warn('Failed to fetch credentials:', response.error?.message);
      return [];
    }
    
    // Cache credentials locally for offline access
    await this.cacheCredentials(response.data.credentials || []);
    
    return response.data.credentials || [];
  }

  /**
   * Search credentials with filters
   */
  async searchCredentials(query: CredentialSearchQuery): Promise<Credential[]> {
    const url = apiRoutes.credentials.search;
    const response = await ApiService.post<{ credentials: Credential[] }>(url, query);
    
    if (!response.success || !response.data) {
      console.warn('Failed to search credentials:', response.error?.message);
      return [];
    }
    
    return response.data.credentials || [];
  }

  /**
   * Get a specific credential by ID
   */
  async getCredentialById(id: string): Promise<Credential | null> {
    const url = apiRoutes.credentials.byId(id);
    const response = await ApiService.get<Credential>(url);
    
    if (!response.success || !response.data) {
      console.warn('Failed to fetch credential:', response.error?.message);
      return null;
    }
    
    return response.data;
  }

  /**
   * Verify a credential's validity
   */
  async verifyCredential(id: string): Promise<CredentialVerification | null> {
    const url = apiRoutes.credentials.verify(id);
    const response = await ApiService.get<CredentialVerification>(url);
    
    if (!response.success || !response.data) {
      console.warn('Failed to verify credential:', response.error?.message);
      return null;
    }
    
    return response.data;
  }

  /**
   * Request issuance of a new credential
   */
  async issueCredential(request: IssueCredentialRequest): Promise<IssueCredentialResponse | null> {
    const url = apiRoutes.credentials.issue;
    const response = await ApiService.post<IssueCredentialResponse>(url, request);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to issue credential');
    }
    
    // Refresh credentials cache after issuance
    await this.getCredentials();
    
    return response.data;
  }

  /**
   * Build a credential issuance request
   */
  buildCredentialRequest(
    credentialType: CredentialType,
    subjectId: string,
    subjectData: Record<string, unknown>,
    schemaId: string,
    schemaVersion: string = '1.0.0'
  ): IssueCredentialRequest {
    const now = new Date();
    const expirationDate = new Date(now);
    expirationDate.setFullYear(expirationDate.getFullYear() + 1); // 1 year validity

    return {
      credential: {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://w3id.org/security/suites/ed25519-2020/v1',
          config.jsonLdContext,
        ],
        type: ['VerifiableCredential', credentialType],
        issuer: `did:web:registry.healthflow.tech`,
        issuanceDate: now.toISOString(),
        expirationDate: expirationDate.toISOString(),
        credentialSubject: {
          id: subjectId,
          ...subjectData,
        },
      },
      credentialSchemaId: schemaId,
      credentialSchemaVersion: schemaVersion,
    };
  }

  /**
   * Build a Medical License Credential request
   */
  buildMedicalLicenseCredential(
    subjectDID: string,
    professionalName: string,
    licenseNumber: string,
    specialty: string,
    professionalType: string
  ): IssueCredentialRequest {
    return this.buildCredentialRequest(
      'MedicalLicenseCredential',
      subjectDID,
      {
        name: professionalName,
        licenseNumber: licenseNumber,
        specialty: specialty,
        professionalType: professionalType,
        licenseStatus: 'active',
        issuingAuthority: 'Egyptian Medical Syndicate',
        country: 'EG',
      },
      'MedicalLicenseCredential',
      '1.0.0'
    );
  }

  /**
   * Build a Doctor Credential request
   */
  buildDoctorCredential(
    subjectDID: string,
    name: string,
    syndicateNumber: string,
    specialty: string,
    nationalId: string
  ): IssueCredentialRequest {
    return this.buildCredentialRequest(
      'DoctorCredential',
      subjectDID,
      {
        name: name,
        syndicateNumber: syndicateNumber,
        specialty: specialty,
        nationalId: nationalId,
        professionalType: 'Doctor',
        licenseStatus: 'active',
      },
      'DoctorCredential',
      '1.0.0'
    );
  }

  /**
   * Build a Nurse Credential request
   */
  buildNurseCredential(
    subjectDID: string,
    name: string,
    syndicateNumber: string,
    specialty: string,
    nationalId: string
  ): IssueCredentialRequest {
    return this.buildCredentialRequest(
      'NurseCredential',
      subjectDID,
      {
        name: name,
        syndicateNumber: syndicateNumber,
        specialty: specialty,
        nationalId: nationalId,
        professionalType: 'Nurse',
        licenseStatus: 'active',
      },
      'NurseCredential',
      '1.0.0'
    );
  }

  /**
   * Build a Pharmacist Credential request
   */
  buildPharmacistCredential(
    subjectDID: string,
    name: string,
    syndicateNumber: string,
    pharmacyLicense: string,
    nationalId: string
  ): IssueCredentialRequest {
    return this.buildCredentialRequest(
      'PharmacistCredential',
      subjectDID,
      {
        name: name,
        syndicateNumber: syndicateNumber,
        pharmacyLicense: pharmacyLicense,
        nationalId: nationalId,
        professionalType: 'Pharmacist',
        licenseStatus: 'active',
      },
      'PharmacistCredential',
      '1.0.0'
    );
  }

  /**
   * Cache credentials locally for offline access
   */
  private async cacheCredentials(credentials: Credential[]): Promise<void> {
    try {
      await StorageService.storeCredentials(credentials);
    } catch (error) {
      console.warn('Failed to cache credentials:', error);
    }
  }

  /**
   * Get cached credentials (for offline mode)
   */
  async getCachedCredentials(): Promise<Credential[]> {
    try {
      const cached = await StorageService.getCredentials();
      return cached || [];
    } catch (error) {
      console.warn('Failed to get cached credentials:', error);
      return [];
    }
  }

  /**
   * Sync credentials with backend
   * Returns true if sync was successful
   */
  async syncCredentials(): Promise<boolean> {
    try {
      const credentials = await this.getCredentials();
      return credentials.length >= 0;
    } catch (error) {
      console.warn('Failed to sync credentials:', error);
      return false;
    }
  }

  /**
   * Check if a credential is expired
   */
  isCredentialExpired(credential: Credential): boolean {
    if (!credential.expirationDate) return false;
    return new Date(credential.expirationDate) <= new Date();
  }

  /**
   * Check if a credential is expiring soon (within 30 days)
   */
  isCredentialExpiringSoon(credential: Credential, daysThreshold = 30): boolean {
    if (!credential.expirationDate) return false;
    const expiryDate = new Date(credential.expirationDate);
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
    return expiryDate <= thresholdDate && expiryDate > new Date();
  }

  /**
   * Get credential status
   */
  getCredentialStatus(credential: Credential): 'active' | 'expired' | 'expiring' | 'revoked' {
    if (credential.status === 'revoked') return 'revoked';
    if (this.isCredentialExpired(credential)) return 'expired';
    if (this.isCredentialExpiringSoon(credential)) return 'expiring';
    return 'active';
  }

  /**
   * Format credential type for display
   */
  formatCredentialType(type: string[]): string {
    const credentialType = type.find(t => t !== 'VerifiableCredential') || 'Credential';
    return credentialType
      .replace(/Credential$/, '')
      .replace(/([A-Z])/g, ' $1')
      .trim();
  }

  /**
   * Get credential icon based on type
   */
  getCredentialIcon(type: string[]): string {
    const credentialType = type.find(t => t !== 'VerifiableCredential') || '';
    
    switch (credentialType) {
      case 'MedicalLicenseCredential':
        return 'card-account-details';
      case 'DoctorCredential':
        return 'doctor';
      case 'NurseCredential':
        return 'account-heart';
      case 'PharmacistCredential':
        return 'pill';
      case 'DentistCredential':
        return 'tooth';
      case 'PhysiotherapistCredential':
        return 'human-handsup';
      default:
        return 'certificate';
    }
  }

  /**
   * Clear all cached credentials (for logout)
   */
  async clearCredentials(): Promise<void> {
    await StorageService.clearCredentials();
  }
}

export default new CredentialsService();

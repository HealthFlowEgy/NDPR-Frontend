/**
 * HealthFlow Mobile App - Identity Service
 * 
 * Handles DID generation, resolution, and document signing.
 * Validated against https://identity.healthflow.tech API.
 * 
 * IMPORTANT: DID generation requires the "content" wrapper array format.
 */

import ApiService from './api.service';
import StorageService from './storage.service';
import { apiRoutes } from '../config/environment';
import {
  DIDDocument,
  GenerateDIDRequest,
  VerifiableCredential,
} from '../types';

interface SignRequest {
  DID: string;
  payload: object;
}

interface SignResponse {
  signedDocument: VerifiableCredential;
}

class IdentityService {
  /**
   * Generate a new DID for the user
   * 
   * Uses the correct "content" wrapper format as per TRD v3.0:
   * {
   *   "content": [
   *     {
   *       "alsoKnownAs": ["identifier"],
   *       "services": [],
   *       "method": "web"
   *     }
   *   ]
   * }
   */
  async generateDID(alsoKnownAs?: string[]): Promise<DIDDocument> {
    const url = apiRoutes.identity.generateDID;
    
    const body: GenerateDIDRequest = {
      content: [
        {
          alsoKnownAs: alsoKnownAs || [],
          services: [],
          method: 'web',
        },
      ],
    };

    const response = await ApiService.post<DIDDocument[]>(url, body, false);
    
    if (!response.success || !response.data || response.data.length === 0) {
      throw new Error(response.error?.message || 'Failed to generate DID');
    }

    // API returns array, get first element
    const didDocument = response.data[0];
    
    // Store DID locally
    await StorageService.storeDID(didDocument);
    
    return didDocument;
  }

  /**
   * Resolve a DID to get its document
   */
  async resolveDID(did: string): Promise<DIDDocument> {
    const url = apiRoutes.identity.resolveDID(did);
    const response = await ApiService.get<DIDDocument>(url, false);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to resolve DID');
    }
    
    return response.data;
  }

  /**
   * Get user's stored DID
   */
  async getUserDID(): Promise<DIDDocument | null> {
    const did = await StorageService.getDID();
    return did as DIDDocument | null;
  }

  /**
   * Check if user has a DID
   */
  async hasDID(): Promise<boolean> {
    const did = await this.getUserDID();
    return did !== null;
  }

  /**
   * Sign a document/credential using the Identity Service
   * 
   * Request format:
   * {
   *   "DID": "did:web:registry.healthflow.tech:uuid",
   *   "payload": { ... document to sign ... }
   * }
   */
  async signDocument(did: string, payload: object): Promise<VerifiableCredential> {
    const url = apiRoutes.identity.sign;
    
    const body: SignRequest = {
      DID: did,
      payload,
    };

    const response = await ApiService.post<VerifiableCredential>(url, body, false);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to sign document');
    }
    
    return response.data;
  }

  /**
   * Verify a signed document
   * 
   * Request format:
   * {
   *   "DID": "did:web:registry.healthflow.tech:uuid",
   *   "payload": { ... signed document with proof ... }
   * }
   * 
   * Response: true or false (boolean)
   */
  async verifyDocument(did: string, signedDocument: object): Promise<boolean> {
    const url = apiRoutes.identity.verify;
    
    const body = {
      DID: did,
      payload: signedDocument,
    };

    const response = await ApiService.post<boolean>(url, body, false);
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Verification failed');
    }
    
    return response.data === true;
  }

  /**
   * Get DID document URL for did:web method
   * Format: https://registry.healthflow.tech/{uuid}/did.json
   */
  getDIDDocumentURL(did: string): string {
    // Parse did:web:registry.healthflow.tech:uuid
    const parts = did.split(':');
    if (parts.length < 4 || parts[1] !== 'web') {
      throw new Error('Invalid DID format');
    }
    
    const domain = parts[2];
    const uuid = parts.slice(3).join('/');
    
    return `https://${domain}/${uuid}/did.json`;
  }

  /**
   * Extract UUID from DID
   */
  extractUUID(did: string): string {
    const parts = did.split(':');
    return parts[parts.length - 1];
  }

  /**
   * Create a credential to be signed
   */
  createCredential(
    issuerDID: string,
    subjectId: string,
    subjectData: Record<string, unknown>,
    type: string[] = ['VerifiableCredential']
  ): object {
    return {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1',
        { 'schema': 'https://schema.org/' },
      ],
      type,
      issuer: issuerDID,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: subjectId,
        ...subjectData,
      },
    };
  }

  /**
   * Clear stored DID (for logout)
   */
  async clearDID(): Promise<void> {
    await StorageService.clearDID();
  }
}

export default new IdentityService();

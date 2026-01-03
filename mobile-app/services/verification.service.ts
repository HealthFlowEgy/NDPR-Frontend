/**
 * HealthFlow Mobile App - Verification Service
 * 
 * Handles QR code scanning and credential verification.
 */

import IdentityService from './identity.service';
import ApiService from './api.service';
import { apiRoutes } from '../config/environment';
import {
  QRCodeData,
  VerificationResult,
  VerifiableCredential,
  DIDDocument,
} from '../types';

class VerificationService {
  /**
   * Parse QR code data
   */
  parseQRCode(data: string): QRCodeData | null {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.type !== 'healthflow-credential') {
        return null;
      }
      
      if (!parsed.did) {
        return null;
      }
      
      return {
        type: parsed.type,
        did: parsed.did,
        credential_id: parsed.credential_id,
      };
    } catch {
      // Try to parse as plain DID
      if (data.startsWith('did:web:')) {
        return {
          type: 'healthflow-credential',
          did: data,
        };
      }
      return null;
    }
  }

  /**
   * Verify a credential from QR code
   */
  async verifyFromQR(qrData: string): Promise<VerificationResult> {
    // Parse QR code
    const parsed = this.parseQRCode(qrData);
    
    if (!parsed) {
      return {
        isValid: false,
        error: 'Invalid QR code format',
      };
    }

    try {
      // Resolve DID to get document
      const didDocument = await IdentityService.resolveDID(parsed.did);
      
      if (!didDocument) {
        return {
          isValid: false,
          error: 'Could not resolve DID',
        };
      }

      // Get signer name from alsoKnownAs if available
      const signerName = didDocument.alsoKnownAs?.[0] || 'Unknown';

      return {
        isValid: true,
        signerDID: parsed.did,
        signerName,
      };
    } catch (error: any) {
      return {
        isValid: false,
        error: error.message || 'Verification failed',
      };
    }
  }

  /**
   * Verify a signed credential
   */
  async verifyCredential(
    credential: VerifiableCredential,
    signerDID: string
  ): Promise<VerificationResult> {
    try {
      const isValid = await IdentityService.verifyDocument(signerDID, credential);
      
      if (!isValid) {
        return {
          isValid: false,
          error: 'Signature verification failed',
        };
      }

      // Extract signer info
      const signerName = typeof credential.credentialSubject === 'object' 
        ? (credential.credentialSubject as any).name || 'Unknown'
        : 'Unknown';

      return {
        isValid: true,
        credential,
        signerDID,
        signerName,
      };
    } catch (error: any) {
      return {
        isValid: false,
        error: error.message || 'Verification failed',
      };
    }
  }

  /**
   * Get professional info from DID
   */
  async getProfessionalInfo(did: string): Promise<{
    name: string;
    type: string;
    syndicateNumber?: string;
    specialization?: string;
  } | null> {
    try {
      const didDocument = await IdentityService.resolveDID(did);
      
      if (!didDocument) {
        return null;
      }

      // Extract info from alsoKnownAs or services
      const alsoKnownAs = didDocument.alsoKnownAs?.[0] || '';
      
      return {
        name: alsoKnownAs,
        type: 'Healthcare Professional',
      };
    } catch {
      return null;
    }
  }

  /**
   * Generate QR code data for a credential
   */
  generateQRData(did: string, credentialId?: string): string {
    const data: QRCodeData = {
      type: 'healthflow-credential',
      did,
      credential_id: credentialId,
    };
    
    return JSON.stringify(data);
  }

  /**
   * Check if DID is valid format
   */
  isValidDID(did: string): boolean {
    // Basic validation for did:web format
    const parts = did.split(':');
    return parts.length >= 4 && parts[0] === 'did' && parts[1] === 'web';
  }

  /**
   * Format verification result for display
   */
  formatResult(result: VerificationResult): {
    status: 'valid' | 'invalid' | 'error';
    title: string;
    message: string;
    details?: Record<string, string>;
  } {
    if (result.isValid) {
      return {
        status: 'valid',
        title: 'Credential Verified',
        message: 'This credential is valid and has not been revoked.',
        details: {
          'Signer': result.signerName || 'Unknown',
          'DID': result.signerDID || 'Unknown',
        },
      };
    }

    return {
      status: result.error ? 'error' : 'invalid',
      title: result.error ? 'Verification Error' : 'Invalid Credential',
      message: result.error || 'This credential could not be verified.',
    };
  }
}

export default new VerificationService();

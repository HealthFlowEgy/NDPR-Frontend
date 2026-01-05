import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { KeycloakService } from 'keycloak-angular';

export interface DIDDocument {
  id: string;
  '@context': string[];
  verificationMethod: {
    id: string;
    type: string;
    controller: string;
    publicKeyMultibase?: string;
    publicKeyJwk?: any;
  }[];
  authentication: string[];
  assertionMethod: string[];
}

export interface GenerateDIDRequest {
  content: {
    alg: string;
    type: string;
  }[];
}

export interface SignRequest {
  signerDID: string;
  payload: any;
}

export interface VerifyRequest {
  signerDID: string;
  signedDoc: any;
}

@Injectable({
  providedIn: 'root'
})
export class IdentityService {
  private http = inject(HttpClient);
  private keycloak = inject(KeycloakService);
  private baseUrl = environment.api.identity;

  private async getHeaders(): Promise<HttpHeaders> {
    const token = await this.keycloak.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  async generateDID(algorithm: string = 'Ed25519'): Promise<Observable<DIDDocument[]>> {
    const headers = await this.getHeaders();
    const request: GenerateDIDRequest = {
      content: [{ alg: algorithm, type: 'key' }]
    };
    return this.http.post<DIDDocument[]>(`${this.baseUrl}/did/generate`, request, { headers }).pipe(
      catchError(error => {
        console.error('Error generating DID:', error);
        return of([]);
      })
    );
  }

  async resolveDID(did: string): Promise<Observable<DIDDocument | null>> {
    const headers = await this.getHeaders();
    return this.http.get<DIDDocument>(`${this.baseUrl}/did/resolve/${encodeURIComponent(did)}`, { headers }).pipe(
      catchError(error => {
        console.error('Error resolving DID:', error);
        return of(null);
      })
    );
  }

  async signDocument(signerDID: string, payload: any): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    const request: SignRequest = { signerDID, payload };
    return this.http.post<any>(`${this.baseUrl}/utils/sign`, request, { headers }).pipe(
      catchError(error => {
        console.error('Error signing document:', error);
        return of(null);
      })
    );
  }

  async verifySignature(signerDID: string, signedDoc: any): Promise<Observable<boolean>> {
    const headers = await this.getHeaders();
    const request: VerifyRequest = { signerDID, signedDoc };
    return this.http.post<any>(`${this.baseUrl}/utils/verify`, request, { headers }).pipe(
      map(response => response?.verified === true),
      catchError(error => {
        console.error('Error verifying signature:', error);
        return of(false);
      })
    );
  }

  checkHealth(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/health`).pipe(
      catchError(error => {
        console.error('Identity service health check failed:', error);
        return of({ status: 'error' });
      })
    );
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { KeycloakService } from 'keycloak-angular';

export interface Credential {
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  expirationDate: string;
  credentialSubject: {
    id: string;
    [key: string]: any;
  };
  proof?: {
    type: string;
    created: string;
    proofValue: string;
    proofPurpose: string;
    verificationMethod: string;
  };
  status?: string;
}

export interface CredentialVerification {
  status: string;
  checks: {
    active: string;
    revoked: string;
    expired: string;
    proof: string;
  }[];
}

export interface IssueCredentialRequest {
  credential: {
    '@context': string[];
    type: string[];
    issuer: string;
    issuanceDate: string;
    expirationDate: string;
    credentialSubject: {
      id: string;
      [key: string]: any;
    };
  };
  credentialSchemaId: string;
  credentialSchemaVersion: string;
}

@Injectable({
  providedIn: 'root'
})
export class CredentialsService {
  private http = inject(HttpClient);
  private keycloak = inject(KeycloakService);
  private baseUrl = environment.api.credentials;

  private async getHeaders(): Promise<HttpHeaders> {
    const token = await this.keycloak.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  async getCredentials(): Promise<Observable<Credential[]>> {
    const headers = await this.getHeaders();
    return this.http.get<any>(`${this.baseUrl}/credentials`, { headers }).pipe(
      map(response => response.credentials || response || []),
      catchError(error => {
        console.error('Error fetching credentials:', error);
        return of([]);
      })
    );
  }

  async searchCredentials(query: any): Promise<Observable<Credential[]>> {
    const headers = await this.getHeaders();
    return this.http.post<any>(`${this.baseUrl}/credentials/search`, query, { headers }).pipe(
      map(response => response.credentials || response || []),
      catchError(error => {
        console.error('Error searching credentials:', error);
        return of([]);
      })
    );
  }

  async getCredentialById(id: string): Promise<Observable<Credential | null>> {
    const headers = await this.getHeaders();
    return this.http.get<Credential>(`${this.baseUrl}/credentials/${encodeURIComponent(id)}`, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching credential:', error);
        return of(null);
      })
    );
  }

  async verifyCredential(id: string): Promise<Observable<CredentialVerification | null>> {
    const headers = await this.getHeaders();
    return this.http.get<CredentialVerification>(`${this.baseUrl}/credentials/${encodeURIComponent(id)}/verify`, { headers }).pipe(
      catchError(error => {
        console.error('Error verifying credential:', error);
        return of(null);
      })
    );
  }

  async issueCredential(request: IssueCredentialRequest): Promise<Observable<Credential | null>> {
    const headers = await this.getHeaders();
    return this.http.post<any>(`${this.baseUrl}/credentials/issue`, request, { headers }).pipe(
      map(response => response.credential || response),
      catchError(error => {
        console.error('Error issuing credential:', error);
        return of(null);
      })
    );
  }

  async revokeCredential(id: string): Promise<Observable<boolean>> {
    const headers = await this.getHeaders();
    return this.http.delete<any>(`${this.baseUrl}/credentials/${encodeURIComponent(id)}`, { headers }).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error revoking credential:', error);
        return of(false);
      })
    );
  }
}

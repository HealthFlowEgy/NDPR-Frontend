import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { KeycloakService } from 'keycloak-angular';

export interface SigningRequest {
  id: string;
  professional_id: string;
  document_type: string;
  document_payload: any;
  requester_name: string;
  requester_organization?: string;
  purpose?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  signed_document?: any;
  rejection_reason?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface SigningHistory {
  id: string;
  signing_request_id: string;
  professional_id: string;
  action: 'approved' | 'rejected';
  action_timestamp: string;
  ip_address?: string;
  device_info?: string;
  biometric_verified: boolean;
  request_created_at: string;
  document_type: string;
  requester_name: string;
}

export interface SigningStats {
  total_signed: number;
  total_rejected: number;
  total_pending: number;
  total_expired: number;
  total_requests: number;
}

export interface CreateSigningRequest {
  professional_id: string;
  document_type: string;
  document_payload: any;
  requester_name: string;
  requester_organization?: string;
  purpose?: string;
  expires_in_hours?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SigningService {
  private http = inject(HttpClient);
  private keycloak = inject(KeycloakService);
  private baseUrl = environment.api.signing;

  private async getHeaders(): Promise<HttpHeaders> {
    const token = await this.keycloak.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  async getSigningRequests(status?: string): Promise<Observable<SigningRequest[]>> {
    const headers = await this.getHeaders();
    let url = `${this.baseUrl}/signing-requests`;
    if (status) {
      url += `?status=${status}`;
    }
    return this.http.get<SigningRequest[]>(url, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching signing requests:', error);
        return of([]);
      })
    );
  }

  async getPendingRequests(): Promise<Observable<SigningRequest[]>> {
    return this.getSigningRequests('pending');
  }

  async getSigningRequestById(id: string): Promise<Observable<SigningRequest | null>> {
    const headers = await this.getHeaders();
    return this.http.get<SigningRequest>(`${this.baseUrl}/signing-requests/${id}`, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching signing request:', error);
        return of(null);
      })
    );
  }

  async createSigningRequest(request: CreateSigningRequest): Promise<Observable<SigningRequest | null>> {
    const headers = await this.getHeaders();
    return this.http.post<SigningRequest>(`${this.baseUrl}/signing-requests`, request, { headers }).pipe(
      catchError(error => {
        console.error('Error creating signing request:', error);
        return of(null);
      })
    );
  }

  async approveSigningRequest(id: string, deviceInfo?: string, biometricVerified: boolean = false): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.post<any>(`${this.baseUrl}/signing-requests/${id}/approve`, {
      device_info: deviceInfo,
      biometric_verified: biometricVerified
    }, { headers }).pipe(
      catchError(error => {
        console.error('Error approving signing request:', error);
        return of(null);
      })
    );
  }

  async rejectSigningRequest(id: string, reason?: string, deviceInfo?: string): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.post<any>(`${this.baseUrl}/signing-requests/${id}/reject`, {
      reason,
      device_info: deviceInfo
    }, { headers }).pipe(
      catchError(error => {
        console.error('Error rejecting signing request:', error);
        return of(null);
      })
    );
  }

  async getSigningHistory(limit: number = 50, offset: number = 0): Promise<Observable<{ history: SigningHistory[], total: number }>> {
    const headers = await this.getHeaders();
    return this.http.get<any>(`${this.baseUrl}/signing-history?limit=${limit}&offset=${offset}`, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching signing history:', error);
        return of({ history: [], total: 0 });
      })
    );
  }

  async getSigningStats(): Promise<Observable<SigningStats>> {
    const headers = await this.getHeaders();
    return this.http.get<SigningStats>(`${this.baseUrl}/signing-stats`, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching signing stats:', error);
        return of({
          total_signed: 0,
          total_rejected: 0,
          total_pending: 0,
          total_expired: 0,
          total_requests: 0
        });
      })
    );
  }

  checkHealth(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/health`).pipe(
      catchError(error => {
        console.error('Signing service health check failed:', error);
        return of({ status: 'error' });
      })
    );
  }
}

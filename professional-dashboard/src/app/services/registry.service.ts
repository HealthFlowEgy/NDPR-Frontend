import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { KeycloakService } from 'keycloak-angular';

export interface RegistryEntity {
  osid: string;
  [key: string]: any;
}

export interface SearchResult<T> {
  totalCount: number;
  data: T[];
}

@Injectable({
  providedIn: 'root'
})
export class RegistryService {
  private http = inject(HttpClient);
  private keycloak = inject(KeycloakService);
  private baseUrl = environment.api.registry;

  private async getHeaders(): Promise<HttpHeaders> {
    const token = await this.keycloak.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Generic entity operations
  async getEntity<T extends RegistryEntity>(entityType: string, osid: string): Promise<Observable<T | null>> {
    const headers = await this.getHeaders();
    return this.http.get<T>(`${this.baseUrl}/${entityType}/${osid}`, { headers }).pipe(
      catchError(error => {
        console.error(`Error fetching ${entityType}:`, error);
        return of(null);
      })
    );
  }

  async createEntity<T extends RegistryEntity>(entityType: string, data: Partial<T>): Promise<Observable<{ osid: string } | null>> {
    const headers = await this.getHeaders();
    return this.http.post<any>(`${this.baseUrl}/${entityType}`, data, { headers }).pipe(
      map(response => response.result?.[entityType] || response),
      catchError(error => {
        console.error(`Error creating ${entityType}:`, error);
        return of(null);
      })
    );
  }

  async updateEntity<T extends RegistryEntity>(entityType: string, osid: string, data: Partial<T>): Promise<Observable<boolean>> {
    const headers = await this.getHeaders();
    return this.http.put<any>(`${this.baseUrl}/${entityType}/${osid}`, data, { headers }).pipe(
      map(() => true),
      catchError(error => {
        console.error(`Error updating ${entityType}:`, error);
        return of(false);
      })
    );
  }

  async searchEntities<T extends RegistryEntity>(entityType: string, filters: any = {}): Promise<Observable<T[]>> {
    const headers = await this.getHeaders();
    return this.http.post<any>(`${this.baseUrl}/${entityType}/search`, { filters }, { headers }).pipe(
      map(response => response || []),
      catchError(error => {
        console.error(`Error searching ${entityType}:`, error);
        return of([]);
      })
    );
  }

  // Professional-specific operations
  async getMyProfile(): Promise<Observable<RegistryEntity | null>> {
    const headers = await this.getHeaders();
    const userProfile = await this.keycloak.loadUserProfile();
    const email = userProfile.email;
    
    // Search for the professional by email across different entity types
    const entityTypes = ['Doctor', 'Nurse', 'Pharmacist', 'Dentist', 'Physiotherapist'];
    
    for (const entityType of entityTypes) {
      try {
        const result = await this.http.post<any[]>(`${this.baseUrl}/${entityType}/search`, {
          filters: { email: { eq: email } }
        }, { headers }).toPromise();
        
        if (result && result.length > 0) {
          return of({ ...result[0], entityType });
        }
      } catch (e) {
        // Continue to next entity type
      }
    }
    
    return of(null);
  }

  // Facility operations
  async getFacilities(facilityType: string): Promise<Observable<RegistryEntity[]>> {
    return this.searchEntities(facilityType);
  }

  async getHealthFacilities(): Promise<Observable<RegistryEntity[]>> {
    return this.searchEntities('HealthFacility');
  }

  async getClinics(): Promise<Observable<RegistryEntity[]>> {
    return this.searchEntities('Clinic');
  }

  async getLaboratories(): Promise<Observable<RegistryEntity[]>> {
    return this.searchEntities('Laboratory');
  }

  async getPharmacies(): Promise<Observable<RegistryEntity[]>> {
    return this.searchEntities('PharmacyFacility');
  }

  async getRadiologyCenters(): Promise<Observable<RegistryEntity[]>> {
    return this.searchEntities('RadiologyCenter');
  }
}

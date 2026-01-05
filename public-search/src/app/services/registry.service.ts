import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, map, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Professional {
  osid: string;
  id?: string;
  name: string;
  fullName?: string;
  type: string;
  specialization?: string;
  specialty?: string;
  registrationNumber?: string;
  licenseNumber?: string;
  location?: string;
  city?: string;
  status: string;
  facility?: string;
  facilityName?: string;
  licenseExpiry?: string;
  expiryDate?: string;
  email?: string;
  phone?: string;
  credentials?: { name: string; issuer: string; date: string }[];
}

export interface SearchFilters {
  type?: string;
  specialization?: string;
  location?: string;
  status?: string;
  query?: string;
}

export interface SearchResponse {
  data: Professional[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class RegistryService {
  private http = inject(HttpClient);
  private baseUrl = environment.api.registry;

  // Entity types to search
  private entityTypes = ['Doctor', 'Nurse', 'Pharmacist', 'Dentist', 'Physiotherapist'];

  searchProfessionals(filters: SearchFilters, offset: number = 0, limit: number = 20): Observable<SearchResponse> {
    // Search across all professional types
    const searchRequests = this.entityTypes.map(entityType => {
      const searchFilters: any = {};
      
      // Apply filters
      if (filters.specialization) {
        searchFilters.specialization = { contains: filters.specialization };
      }
      if (filters.location) {
        searchFilters.city = { contains: filters.location };
      }
      if (filters.status) {
        searchFilters.status = { eq: filters.status };
      }
      if (filters.query) {
        // Search by name or registration number
        searchFilters.name = { contains: filters.query };
      }

      return this.http.post<any>(`${this.baseUrl}/${entityType}/search`, {
        offset: 0,
        limit: 100, // Get more results to filter client-side
        filters: searchFilters
      }).pipe(
        map(response => {
          const data = response.data || (Array.isArray(response) ? response : []);
          return data.map((item: any) => this.mapToProfessional(item, entityType));
        }),
        catchError(error => {
          console.error(`Error searching ${entityType}:`, error);
          return of([]);
        })
      );
    });

    // If type filter is specified, only search that type
    if (filters.type && this.entityTypes.includes(filters.type)) {
      const searchFilters: any = {};
      if (filters.specialization) {
        searchFilters.specialization = { contains: filters.specialization };
      }
      if (filters.location) {
        searchFilters.city = { contains: filters.location };
      }
      if (filters.status) {
        searchFilters.status = { eq: filters.status };
      }
      if (filters.query) {
        searchFilters.name = { contains: filters.query };
      }

      return this.http.post<any>(`${this.baseUrl}/${filters.type}/search`, {
        offset,
        limit,
        filters: searchFilters
      }).pipe(
        map(response => {
          const data = response.data || (Array.isArray(response) ? response : []);
          return {
            data: data.map((item: any) => this.mapToProfessional(item, filters.type!)),
            totalCount: response.totalCount || data.length
          };
        }),
        catchError(error => {
          console.error(`Error searching ${filters.type}:`, error);
          return of({ data: [], totalCount: 0 });
        })
      );
    }

    // Search all types and combine results
    return forkJoin(searchRequests).pipe(
      map(results => {
        const allProfessionals = results.flat();
        
        // Apply client-side filtering for query across multiple fields
        let filtered = allProfessionals;
        if (filters.query) {
          const query = filters.query.toLowerCase();
          filtered = allProfessionals.filter(p => 
            p.name?.toLowerCase().includes(query) ||
            p.registrationNumber?.toLowerCase().includes(query) ||
            p.licenseNumber?.toLowerCase().includes(query)
          );
        }

        // Sort by name
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        // Apply pagination
        const paginatedData = filtered.slice(offset, offset + limit);

        return {
          data: paginatedData,
          totalCount: filtered.length
        };
      })
    );
  }

  getProfessionalById(type: string, id: string): Observable<Professional | null> {
    return this.http.get<any>(`${this.baseUrl}/${type}/${id}`).pipe(
      map(response => this.mapToProfessional(response, type)),
      catchError(error => {
        console.error(`Error getting ${type} ${id}:`, error);
        return of(null);
      })
    );
  }

  private mapToProfessional(item: any, type: string): Professional {
    return {
      osid: item.osid || item.id,
      id: item.osid || item.id,
      name: item.name || item.fullName || 'Unknown',
      fullName: item.fullName || item.name,
      type: type,
      specialization: item.specialization || item.specialty || 'General Practice',
      specialty: item.specialty || item.specialization,
      registrationNumber: item.registrationNumber || item.licenseNumber || `${type.substring(0, 3).toUpperCase()}-${item.osid?.substring(0, 8) || 'N/A'}`,
      licenseNumber: item.licenseNumber || item.registrationNumber,
      location: item.city || item.location || 'Not specified',
      city: item.city || item.location,
      status: item.status || 'Active',
      facility: item.facilityName || item.facility || 'Independent',
      facilityName: item.facilityName || item.facility,
      licenseExpiry: item.expiryDate || item.licenseExpiry || '2026-12-31',
      expiryDate: item.expiryDate || item.licenseExpiry,
      email: item.email,
      phone: item.phone,
      credentials: []
    };
  }
}

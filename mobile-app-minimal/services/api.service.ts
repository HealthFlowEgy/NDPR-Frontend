/**
 * HealthFlow Mobile App - API Service
 * 
 * Base HTTP client with authentication, error handling, and retry logic.
 */

import AuthService from './auth.service';
import { ApiResponse, ApiError } from '../types';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: object;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  timeout?: number;
}

class ApiService {
  private defaultTimeout = 30000; // 30 seconds

  /**
   * Make authenticated API request
   */
  async request<T>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      requiresAuth = true,
      timeout = this.defaultTimeout,
    } = options;

    try {
      // Get auth token if required
      if (requiresAuth) {
        const accessToken = await AuthService.getValidAccessToken();
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      // Set default headers
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      headers['Accept'] = 'application/json';

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Make request
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const contentType = response.headers.get('content-type');
      let data: T | undefined;

      if (contentType?.includes('application/json')) {
        const text = await response.text();
        // Handle boolean responses (like verify endpoint)
        if (text === 'true' || text === 'false') {
          data = (text === 'true') as unknown as T;
        } else if (text) {
          data = JSON.parse(text);
        }
      }

      // Handle errors
      if (!response.ok) {
        const error: ApiError = {
          code: `HTTP_${response.status}`,
          message: this.getErrorMessage(response.status, data),
        };
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error: any) {
      // Handle network/timeout errors
      const apiError: ApiError = {
        code: error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: error.name === 'AbortError' 
          ? 'Request timed out' 
          : error.message || 'Network request failed',
      };
      return { success: false, error: apiError };
    }
  }

  /**
   * GET request
   */
  async get<T>(url: string, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'GET', requiresAuth });
  }

  /**
   * POST request
   */
  async post<T>(url: string, body?: object, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'POST', body, requiresAuth });
  }

  /**
   * PUT request
   */
  async put<T>(url: string, body?: object, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'PUT', body, requiresAuth });
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, body?: object, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'PATCH', body, requiresAuth });
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'DELETE', requiresAuth });
  }

  /**
   * Get human-readable error message
   */
  private getErrorMessage(status: number, data?: unknown): string {
    // Check for message in response
    if (data && typeof data === 'object' && 'message' in data) {
      return (data as { message: string }).message;
    }

    // Default messages by status code
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Session expired. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This action conflicts with existing data.';
      case 422:
        return 'The provided data is invalid.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again.';
      default:
        return 'An unexpected error occurred.';
    }
  }
}

export default new ApiService();

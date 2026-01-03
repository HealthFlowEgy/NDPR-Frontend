import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';

/**
 * Authentication Service for Enrollment Portal
 * Following Sunbird RC best practices
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private keycloak: KeycloakService) {}

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.keycloak.isLoggedIn();
  }

  /**
   * Get current user's profile
   */
  async getUserProfile(): Promise<KeycloakProfile | null> {
    if (!this.isLoggedIn()) {
      return null;
    }
    try {
      return await this.keycloak.loadUserProfile();
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  /**
   * Get current user's roles
   */
  getUserRoles(): string[] {
    return this.keycloak.getUserRoles();
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    return this.keycloak.isUserInRole(role);
  }

  /**
   * Get the current access token
   */
  async getToken(): Promise<string> {
    return await this.keycloak.getToken();
  }

  /**
   * Login with redirect
   */
  login(redirectUri?: string): void {
    this.keycloak.login({
      redirectUri: redirectUri || window.location.origin
    });
  }

  /**
   * Logout and redirect
   */
  logout(redirectUri?: string): void {
    this.keycloak.logout(redirectUri || window.location.origin);
  }

  /**
   * Get user's full name
   */
  async getFullName(): Promise<string> {
    const profile = await this.getUserProfile();
    if (profile) {
      return `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.username || 'User';
    }
    return 'User';
  }

  /**
   * Get user's email
   */
  async getEmail(): Promise<string | undefined> {
    const profile = await this.getUserProfile();
    return profile?.email;
  }

  /**
   * Get user's ID (subject)
   */
  getUserId(): string | undefined {
    return this.keycloak.getKeycloakInstance().subject;
  }
}

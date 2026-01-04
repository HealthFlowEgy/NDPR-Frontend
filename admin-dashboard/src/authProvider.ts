import Keycloak from 'keycloak-js';
import { AuthProvider, UserIdentity } from 'react-admin';

// Keycloak configuration following Sunbird RC best practices
const keycloakConfig = {
    url: process.env.REACT_APP_KEYCLOAK_URL || 'https://keycloak.healthflow.tech',
    realm: process.env.REACT_APP_KEYCLOAK_REALM || 'RegistryAdmin',
    clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'admin-portal'
};

// Initialize Keycloak instance
export const keycloak = new Keycloak(keycloakConfig);

// Track initialization state to prevent double initialization in React Strict Mode
let keycloakInitialized = false;
let keycloakInitPromise: Promise<boolean> | null = null;

// Initialize Keycloak with PKCE for enhanced security
export const initKeycloak = (): Promise<boolean> => {
    // If already initialized, return the existing promise or resolved value
    if (keycloakInitialized) {
        return Promise.resolve(keycloak.authenticated || false);
    }
    
    // If initialization is in progress, return the existing promise
    if (keycloakInitPromise) {
        return keycloakInitPromise;
    }
    
    // Start initialization
    keycloakInitPromise = keycloak.init({
        onLoad: 'login-required',
        checkLoginIframe: false,
        pkceMethod: 'S256'
    }).then((authenticated) => {
        keycloakInitialized = true;
        console.log('Keycloak initialized, authenticated:', authenticated);
        return authenticated;
    }).catch((error) => {
        console.error('Keycloak init error:', error);
        keycloakInitPromise = null; // Allow retry on error
        throw error;
    });
    
    return keycloakInitPromise;
};

// Permission mapping based on Keycloak roles
export interface Permissions {
    isAdmin: boolean;
    isRegistrar: boolean;
    canManageDoctors: boolean;
    canManageNurses: boolean;
    canManagePharmacists: boolean;
    canManagePhysiotherapists: boolean;
    canManageDentists: boolean;
    canManageFacilities: boolean;
    canApproveRegistrations: boolean;
    canViewAnalytics: boolean;
    canExportData: boolean;
}

// Extract roles from Keycloak token
const getRoles = (): string[] => {
    const tokenParsed = keycloak.tokenParsed;
    if (!tokenParsed) return [];
    
    const realmRoles = tokenParsed.realm_access?.roles || [];
    const clientRoles = tokenParsed.resource_access?.[keycloakConfig.clientId]?.roles || [];
    
    return [...realmRoles, ...clientRoles];
};

// Map roles to permissions
const getPermissions = (): Permissions => {
    const roles = getRoles();
    const isAdmin = roles.includes('system_admin');
    const isRegistrar = roles.includes('registrar');
    
    return {
        isAdmin,
        isRegistrar,
        canManageDoctors: isAdmin || isRegistrar,
        canManageNurses: isAdmin || isRegistrar,
        canManagePharmacists: isAdmin || isRegistrar,
        canManagePhysiotherapists: isAdmin || isRegistrar,
        canManageDentists: isAdmin || isRegistrar,
        canManageFacilities: isAdmin || isRegistrar,
        canApproveRegistrations: isAdmin || isRegistrar,
        canViewAnalytics: isAdmin || isRegistrar,
        canExportData: isAdmin
    };
};

// Auth provider implementation for React Admin
export const authProvider: AuthProvider = {
    // Called when the user attempts to log in
    login: async () => {
        // Keycloak handles login via redirect
        return Promise.resolve();
    },

    // Called when the user clicks on the logout button
    logout: async () => {
        await keycloak.logout({
            redirectUri: window.location.origin
        });
        return Promise.resolve();
    },

    // Called when the API returns an error
    checkError: async (error: any) => {
        const status = error?.status;
        if (status === 401 || status === 403) {
            // Token might be expired, try to refresh
            try {
                const refreshed = await keycloak.updateToken(30);
                if (refreshed) {
                    return Promise.resolve();
                }
            } catch {
                // Refresh failed, redirect to login
                return Promise.reject();
            }
        }
        return Promise.resolve();
    },

    // Called when the user navigates to a new location, to check for authentication
    checkAuth: async () => {
        if (keycloak.authenticated) {
            // Check if token needs refresh
            try {
                await keycloak.updateToken(30);
                return Promise.resolve();
            } catch {
                return Promise.reject();
            }
        }
        return Promise.reject();
    },

    // Called when the user navigates to a new location, to check for permissions / roles
    getPermissions: async () => {
        return Promise.resolve(getPermissions());
    },

    // Get the current user identity
    getIdentity: async (): Promise<UserIdentity> => {
        const tokenParsed = keycloak.tokenParsed;
        if (!tokenParsed) {
            return Promise.reject();
        }

        return Promise.resolve({
            id: tokenParsed.sub || '',
            fullName: tokenParsed.name || tokenParsed.preferred_username || 'User',
            avatar: tokenParsed.picture
        });
    }
};

// HTTP client with Keycloak token injection
export const httpClient = async (url: string, options: any = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json' });
    }
    
    // Refresh token if needed
    try {
        await keycloak.updateToken(30);
    } catch {
        // Token refresh failed, will be handled by checkError
    }
    
    // Add Authorization header
    if (keycloak.token) {
        options.headers.set('Authorization', `Bearer ${keycloak.token}`);
    }
    
    return fetch(url, options);
};

export default authProvider;

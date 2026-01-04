/**
 * HealthFlow Mobile App - Environment Configuration
 * 
 * All endpoints validated against production infrastructure.
 * TRD v3.0 - January 3, 2026
 */

export const config = {
  // Keycloak OAuth Configuration
  keycloak: {
    url: 'https://keycloak.healthflow.tech',
    realm: 'RegistryAdmin',
    clientId: 'mobile-app',
    issuer: 'https://keycloak.healthflow.tech/realms/RegistryAdmin',
  },

  // API Endpoints
  api: {
    registry: 'https://registry.healthflow.tech',
    identity: 'https://identity.healthflow.tech',
    signing: 'https://signing.healthflow.tech',
  },

  // OAuth Settings
  oauth: {
    redirectUri: 'com.healthflow.mobile:/oauthredirect',
    scopes: ['openid', 'profile', 'email'],
    usePKCE: true,
  },

  // App Settings
  app: {
    name: 'HealthFlow',
    version: '1.0.0',
    bundleId: 'com.healthflow.mobile',
  },

  // Security Settings
  security: {
    sessionTimeoutMinutes: 15,
    signingRequestTimeoutMinutes: 15,
    requireBiometricForSigning: true,
    enableJailbreakDetection: true,
  },

  // Feature Flags
  features: {
    offlineMode: true,
    pushNotifications: true,
    qrScanner: true,
    remoteSign: true,
  },
};

// Keycloak OAuth endpoints
export const oauthEndpoints = {
  authorization: `${config.keycloak.url}/realms/${config.keycloak.realm}/protocol/openid-connect/auth`,
  token: `${config.keycloak.url}/realms/${config.keycloak.realm}/protocol/openid-connect/token`,
  userInfo: `${config.keycloak.url}/realms/${config.keycloak.realm}/protocol/openid-connect/userinfo`,
  logout: `${config.keycloak.url}/realms/${config.keycloak.realm}/protocol/openid-connect/logout`,
  jwks: `${config.keycloak.url}/realms/${config.keycloak.realm}/protocol/openid-connect/certs`,
};

// API route builders
export const apiRoutes = {
  // Registry API
  registry: {
    entities: (type: string) => `${config.api.registry}/api/v1/${type}`,
    entity: (type: string, id: string) => `${config.api.registry}/api/v1/${type}/${id}`,
    search: (type: string) => `${config.api.registry}/api/v1/${type}/search`,
  },

  // Identity Service
  identity: {
    health: `${config.api.identity}/health`,
    generateDID: `${config.api.identity}/did/generate`,
    resolveDID: (did: string) => `${config.api.identity}/did/resolve/${encodeURIComponent(did)}`,
    sign: `${config.api.identity}/utils/sign`,
    verify: `${config.api.identity}/utils/verify`,
  },

  // Signing Service
  signing: {
    requests: `${config.api.signing}/api/v1/signing-requests`,
    requestById: (id: string) => `${config.api.signing}/api/v1/signing-requests/${id}`,
    approve: (id: string) => `${config.api.signing}/api/v1/signing-requests/${id}/approve`,
    reject: (id: string) => `${config.api.signing}/api/v1/signing-requests/${id}/reject`,
    history: `${config.api.signing}/api/v1/signing-history`,
    stats: `${config.api.signing}/api/v1/signing-stats`,
  },
};

export default config;

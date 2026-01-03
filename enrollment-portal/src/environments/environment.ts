// Enrollment Portal Environment Configuration
// Following Sunbird RC best practices for Keycloak integration

export const environment = {
  production: false,
  apiUrl: 'https://api.healthflow.tech/api/v1',
  
  // Keycloak configuration following Sunbird RC Admin Portal pattern
  keycloak: {
    url: 'https://keycloak.healthflow.tech',
    realm: 'RegistryAdmin',
    clientId: 'enrollment-portal'
  },
  
  // WebSocket configuration for real-time notifications
  socketUrl: 'wss://api.healthflow.tech/ws'
};

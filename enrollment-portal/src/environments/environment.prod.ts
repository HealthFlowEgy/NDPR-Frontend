// Enrollment Portal Production Environment Configuration

export const environment = {
  production: true,
  apiUrl: 'https://api.healthflow.tech/api/v1',
  
  // Keycloak configuration
  keycloak: {
    url: 'https://keycloak.healthflow.tech',
    realm: 'RegistryAdmin',
    clientId: 'enrollment-portal'
  },
  
  // WebSocket configuration
  socketUrl: 'wss://api.healthflow.tech/ws'
};

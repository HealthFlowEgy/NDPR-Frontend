// Enrollment Portal Environment Configuration
// Following Sunbird RC best practices for Keycloak integration

export const environment = {
  production: false,
  apiUrl: 'https://registry.healthflow.tech/api/v1',
  
  // Identity Service API
  identityUrl: 'https://identity.healthflow.tech',
  
  // Keycloak configuration following Sunbird RC Admin Portal pattern
  keycloak: {
    url: 'https://keycloak.healthflow.tech',
    realm: 'RegistryAdmin',
    clientId: 'enrollment-portal'
  },
  
  
};

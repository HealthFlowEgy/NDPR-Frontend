// Enrollment Portal Production Environment Configuration

export const environment = {
  production: true,
  
  // Registry API
  apiUrl: 'https://registry.healthflow.tech/api/v1',
  
  // Identity Service API
  identityUrl: 'https://identity.healthflow.tech',
  
  // Keycloak configuration
  keycloak: {
    url: 'https://keycloak.healthflow.tech',
    realm: 'RegistryAdmin',
    clientId: 'enrollment-portal'
  }
};

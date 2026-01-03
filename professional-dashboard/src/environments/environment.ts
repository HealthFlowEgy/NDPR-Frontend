export const environment = {
  production: false,
  keycloak: {
    url: 'https://keycloak.healthflow.tech',
    realm: 'RegistryAdmin',
    clientId: 'professional-dashboard'
  },
  api: {
    registry: 'https://registry.healthflow.tech/api/v1',
    identity: 'https://identity.healthflow.tech',
    signing: 'https://signing.healthflow.tech'
  }
};

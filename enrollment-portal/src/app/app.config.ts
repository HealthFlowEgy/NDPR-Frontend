import { APP_INITIALIZER, ApplicationConfig, Provider } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { KeycloakService, KeycloakBearerInterceptor } from 'keycloak-angular';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

// Keycloak initialization factory following Sunbird RC best practices
function initializeKeycloak(keycloak: KeycloakService): () => Promise<boolean> {
  return () =>
    keycloak.init({
      config: {
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId
      },
      initOptions: {
        // Use 'check-sso' for enrollment portal to allow anonymous access
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri:
          window.location.origin + '/assets/silent-check-sso.html',
        checkLoginIframe: false,
        // Use PKCE for enhanced security (recommended by Sunbird RC)
        pkceMethod: 'S256'
      },
      // Load user profile when authenticated
      loadUserProfileAtStartUp: true,
      // Enable bearer token interceptor
      enableBearerInterceptor: true,
      // Exclude public endpoints from bearer token
      bearerExcludedUrls: ['/assets', '/public']
    });
}

// Keycloak providers
const KeycloakProviders: Provider[] = [
  KeycloakService,
  {
    provide: APP_INITIALIZER,
    useFactory: initializeKeycloak,
    multi: true,
    deps: [KeycloakService]
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: KeycloakBearerInterceptor,
    multi: true
  }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    ...KeycloakProviders
  ]
};

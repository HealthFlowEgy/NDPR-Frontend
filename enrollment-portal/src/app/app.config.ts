import { APP_INITIALIZER, ApplicationConfig, Provider } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { KeycloakService, KeycloakBearerInterceptor } from 'keycloak-angular';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

// Keycloak initialization factory - enrollment portal allows anonymous access
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
        // Disable silent check to avoid iframe timeout issues
        silentCheckSsoRedirectUri: undefined,
        checkLoginIframe: false,
        // Use PKCE for enhanced security
        pkceMethod: 'S256'
      },
      // Load user profile when authenticated
      loadUserProfileAtStartUp: false,
      // Enable bearer token interceptor
      enableBearerInterceptor: true,
      // Exclude public endpoints from bearer token
      bearerExcludedUrls: ['/assets', '/public', '/api']
    }).catch(err => {
      console.warn('Keycloak init failed, continuing without auth:', err);
      return true; // Continue even if Keycloak fails
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

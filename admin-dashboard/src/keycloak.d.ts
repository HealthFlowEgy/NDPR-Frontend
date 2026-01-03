declare module 'keycloak-js' {
  export interface KeycloakConfig {
    url?: string;
    realm?: string;
    clientId?: string;
  }

  export interface KeycloakInitOptions {
    onLoad?: 'login-required' | 'check-sso';
    checkLoginIframe?: boolean;
    pkceMethod?: 'S256';
    silentCheckSsoRedirectUri?: string;
  }

  export interface KeycloakTokenParsed {
    sub?: string;
    name?: string;
    preferred_username?: string;
    email?: string;
    picture?: string;
    realm_access?: {
      roles: string[];
    };
    resource_access?: {
      [key: string]: {
        roles: string[];
      };
    };
  }

  export interface KeycloakLogoutOptions {
    redirectUri?: string;
  }

  export default class Keycloak {
    constructor(config?: KeycloakConfig);
    init(options?: KeycloakInitOptions): Promise<boolean>;
    login(options?: { redirectUri?: string }): Promise<void>;
    logout(options?: KeycloakLogoutOptions): Promise<void>;
    updateToken(minValidity: number): Promise<boolean>;
    authenticated?: boolean;
    token?: string;
    tokenParsed?: KeycloakTokenParsed;
  }
}

# HealthFlow Mobile App - Technical Requirements Document (TRD)

**Version:** 3.0 (Final - Validated)  
**Date:** January 3, 2026  
**Author:** Manus AI  
**Status:** ✅ All Backend Services Operational

---

## 1. Executive Summary

This document provides the comprehensive technical requirements for the HealthFlow Mobile Application. All backend services have been validated and are operational. The mobile app will enable healthcare professionals to manage their digital credentials, receive and approve remote signing requests, and verify credentials via QR codes.

---

## 2. Technology Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | React Native | 0.73+ | Cross-platform mobile development |
| **Build Tool** | Expo | 50+ | Development and deployment |
| **UI Toolkit** | React Native Paper | 5.x | Material Design components |
| **State Management** | Redux Toolkit | 2.x | Global state management |
| **Navigation** | React Navigation | 6.x | Screen navigation |
| **Authentication** | `react-native-app-auth` | 7.x | OAuth 2.0 + PKCE |
| **Secure Storage** | `expo-secure-store` | 5.x | Encrypted token storage |
| **Biometrics** | `expo-local-authentication` | 11.x | Fingerprint/Face ID |
| **QR Scanner** | `react-native-vision-camera` | 3.x | QR code scanning |
| **Offline DB** | WatermelonDB | 0.27+ | Local credential cache |
| **Push Notifications** | `expo-notifications` | 0.27+ | Signing request alerts |

---

## 3. Backend Services

### 3.1. Service URLs (Production)

| Service | URL | Port | Status |
|---------|-----|------|--------|
| Registry API | `https://registry.healthflow.tech` | 443 | ✅ Operational |
| Keycloak | `https://keycloak.healthflow.tech` | 443 | ✅ Operational |
| Identity Service | `https://identity.healthflow.tech` | 443 | ✅ Operational |
| Signing Service | `https://signing.healthflow.tech` | 443 | ✅ Operational |
| Credentials Service | Internal only | 3334 | ✅ Operational |
| Schema Service | Internal only | 3333 | ✅ Operational |

### 3.2. Environment Configuration

```typescript
// config/environment.ts
export const config = {
  keycloak: {
    url: 'https://keycloak.healthflow.tech',
    realm: 'RegistryAdmin',
    clientId: 'mobile-app',
  },
  api: {
    registry: 'https://registry.healthflow.tech',
    identity: 'https://identity.healthflow.tech',
    signing: 'https://signing.healthflow.tech',
  },
  oauth: {
    redirectUri: 'com.healthflow.mobile:/oauthredirect',
    scopes: ['openid', 'profile', 'email'],
  },
};
```

---

## 4. Keycloak Configuration

### 4.1. Client Details

| Property | Value |
|----------|-------|
| **Realm** | `RegistryAdmin` |
| **Client ID** | `mobile-app` |
| **Client Type** | Public |
| **PKCE** | Enabled (S256) |
| **Redirect URIs** | `com.healthflow.mobile:/oauthredirect`, `com.healthflow.mobile://oauthredirect` |

### 4.2. OAuth 2.0 Endpoints

| Endpoint | URL |
|----------|-----|
| Authorization | `https://keycloak.healthflow.tech/realms/RegistryAdmin/protocol/openid-connect/auth` |
| Token | `https://keycloak.healthflow.tech/realms/RegistryAdmin/protocol/openid-connect/token` |
| UserInfo | `https://keycloak.healthflow.tech/realms/RegistryAdmin/protocol/openid-connect/userinfo` |
| Logout | `https://keycloak.healthflow.tech/realms/RegistryAdmin/protocol/openid-connect/logout` |
| JWKS | `https://keycloak.healthflow.tech/realms/RegistryAdmin/protocol/openid-connect/certs` |

---

## 5. API Reference

### 5.1. Identity Service (`https://identity.healthflow.tech`)

#### 5.1.1. Generate DID

```http
POST /did/generate
Content-Type: application/json

{
  "content": [
    {
      "alsoKnownAs": ["dr-ahmed-hassan-001"],
      "services": [],
      "method": "web"
    }
  ]
}
```

**Response:**
```json
[
  {
    "@context": ["https://www.w3.org/ns/did/v1"],
    "id": "did:web:registry.healthflow.tech:681b62d8-f6fe-4300-aea7-76e556f3a313",
    "alsoKnownAs": ["dr-ahmed-hassan-001"],
    "verificationMethod": [
      {
        "id": "did:web:registry.healthflow.tech:681b62d8-f6fe-4300-aea7-76e556f3a313#key-0",
        "type": "Ed25519VerificationKey2020",
        "publicKeyMultibase": "z6Mkru26FDGaAsXxxPJPzmFNew1tbxH9RVWcYZDFWMTacn9d"
      }
    ]
  }
]
```

#### 5.1.2. Resolve DID

```http
GET /did/resolve/{did}
```

**Example:**
```http
GET /did/resolve/did:web:registry.healthflow.tech:681b62d8-f6fe-4300-aea7-76e556f3a313
```

#### 5.1.3. Sign Document

```http
POST /utils/sign
Content-Type: application/json

{
  "DID": "did:web:registry.healthflow.tech:681b62d8-f6fe-4300-aea7-76e556f3a313",
  "payload": {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/security/suites/ed25519-2020/v1",
      {"schema": "https://schema.org/"}
    ],
    "type": ["VerifiableCredential"],
    "issuer": "did:web:registry.healthflow.tech:681b62d8-f6fe-4300-aea7-76e556f3a313",
    "issuanceDate": "2026-01-03T20:00:00Z",
    "credentialSubject": {
      "id": "did:example:patient-12345",
      "schema:name": "Mohamed Ali"
    }
  }
}
```

**Response:** Returns the signed document with `proof` object added.

#### 5.1.4. Verify Signature

```http
POST /utils/verify
Content-Type: application/json

{
  "DID": "did:web:registry.healthflow.tech:681b62d8-f6fe-4300-aea7-76e556f3a313",
  "payload": {
    // Full signed document including proof
  }
}
```

**Response:** `true` (valid) or `false` (invalid)

---

### 5.2. Signing Service (`https://signing.healthflow.tech`)

All endpoints require Bearer token authentication.

#### 5.2.1. List Signing Requests

```http
GET /api/v1/signing-requests?status=pending
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "requests": [
    {
      "id": "uuid",
      "professional_id": "prof-123",
      "document_type": "prescription",
      "requester_name": "Cairo Hospital",
      "status": "pending",
      "created_at": "2026-01-03T20:00:00Z",
      "expires_at": "2026-01-03T20:15:00Z"
    }
  ],
  "total": 1
}
```

#### 5.2.2. Get Signing Request Details

```http
GET /api/v1/signing-requests/{id}
Authorization: Bearer {access_token}
```

#### 5.2.3. Approve Signing Request

```http
POST /api/v1/signing-requests/{id}/approve
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "biometric_verified": true,
  "device_info": "iPhone 15 Pro"
}
```

**Response:**
```json
{
  "status": "approved",
  "signed_document": { /* signed VC */ },
  "message": "Document signed successfully"
}
```

#### 5.2.4. Reject Signing Request

```http
POST /api/v1/signing-requests/{id}/reject
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "reason": "I did not authorize this request",
  "device_info": "iPhone 15 Pro"
}
```

#### 5.2.5. Get Signing History

```http
GET /api/v1/signing-history?limit=50&offset=0
Authorization: Bearer {access_token}
```

#### 5.2.6. Get Signing Statistics

```http
GET /api/v1/signing-stats
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "total_signed": 28,
  "total_rejected": 2,
  "total_pending": 1,
  "total_expired": 5,
  "total_requests": 36
}
```

---

### 5.3. DID Web Resolution

DIDs can be resolved via standard web resolution:

```http
GET https://registry.healthflow.tech/{uuid}/did.json
```

**Example:**
```http
GET https://registry.healthflow.tech/681b62d8-f6fe-4300-aea7-76e556f3a313/did.json
```

---

## 6. Authentication Flow

### 6.1. OAuth 2.0 + PKCE Flow

```typescript
// services/auth.service.ts
import { authorize, refresh, revoke } from 'react-native-app-auth';

const authConfig = {
  issuer: 'https://keycloak.healthflow.tech/realms/RegistryAdmin',
  clientId: 'mobile-app',
  redirectUrl: 'com.healthflow.mobile:/oauthredirect',
  scopes: ['openid', 'profile', 'email'],
  usePKCE: true,
};

export const login = async () => {
  const result = await authorize(authConfig);
  return {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    idToken: result.idToken,
    expiresAt: result.accessTokenExpirationDate,
  };
};

export const refreshTokens = async (refreshToken: string) => {
  const result = await refresh(authConfig, { refreshToken });
  return result;
};

export const logout = async (idToken: string) => {
  await revoke(authConfig, { tokenToRevoke: idToken });
};
```

### 6.2. Secure Token Storage

```typescript
// services/storage.service.ts
import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'healthflow_access_token',
  REFRESH_TOKEN: 'healthflow_refresh_token',
  ID_TOKEN: 'healthflow_id_token',
  USER_DID: 'healthflow_user_did',
};

export const storeTokens = async (tokens: AuthTokens) => {
  await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, tokens.accessToken);
  await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, tokens.refreshToken);
  await SecureStore.setItemAsync(KEYS.ID_TOKEN, tokens.idToken);
};

export const getAccessToken = async () => {
  return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
};

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
  await SecureStore.deleteItemAsync(KEYS.ID_TOKEN);
};
```

---

## 7. Remote Signing Flow

### 7.1. Sequence Diagram

```
Hospital System          Signing Service          Mobile App          Identity Service
      |                        |                       |                      |
      |-- POST /signing-requests -->                   |                      |
      |                        |-- Push Notification -->                      |
      |                        |                       |                      |
      |                        |<-- GET /signing-requests --                  |
      |                        |-- Return pending list -->                    |
      |                        |                       |                      |
      |                        |                       |-- Biometric Auth     |
      |                        |                       |                      |
      |                        |<-- POST /approve -----                       |
      |                        |                       |                      |
      |                        |--------------- POST /utils/sign ------------>|
      |                        |<------------- Signed Document ---------------|
      |                        |                       |                      |
      |                        |-- Return signed doc -->                      |
      |<-- Webhook callback ---|                       |                      |
```

### 7.2. Implementation

```typescript
// services/signing.service.ts
import { getAccessToken } from './storage.service';
import * as LocalAuthentication from 'expo-local-authentication';

const SIGNING_API = 'https://signing.healthflow.tech/api/v1';

export const getPendingRequests = async () => {
  const token = await getAccessToken();
  const response = await fetch(`${SIGNING_API}/signing-requests?status=pending`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const approveRequest = async (requestId: string, deviceInfo: string) => {
  // Require biometric authentication
  const authResult = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Authenticate to sign document',
    fallbackLabel: 'Use passcode',
  });

  if (!authResult.success) {
    throw new Error('Biometric authentication failed');
  }

  const token = await getAccessToken();
  const response = await fetch(`${SIGNING_API}/signing-requests/${requestId}/approve`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      biometric_verified: true,
      device_info: deviceInfo,
    }),
  });

  return response.json();
};

export const rejectRequest = async (requestId: string, reason: string) => {
  const token = await getAccessToken();
  const response = await fetch(`${SIGNING_API}/signing-requests/${requestId}/reject`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  });

  return response.json();
};
```

---

## 8. QR Code Verification

### 8.1. QR Code Format

```json
{
  "type": "healthflow-credential",
  "did": "did:web:registry.healthflow.tech:681b62d8-f6fe-4300-aea7-76e556f3a313",
  "credential_id": "cred-12345"
}
```

### 8.2. Verification Implementation

```typescript
// services/verification.service.ts
const IDENTITY_API = 'https://identity.healthflow.tech';

export const verifyCredential = async (signedCredential: object, signerDID: string) => {
  const response = await fetch(`${IDENTITY_API}/utils/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      DID: signerDID,
      payload: signedCredential,
    }),
  });

  const isValid = await response.json();
  return isValid === true;
};

export const resolveDID = async (did: string) => {
  const response = await fetch(`${IDENTITY_API}/did/resolve/${encodeURIComponent(did)}`);
  return response.json();
};
```

---

## 9. Project Structure

```
healthflow-mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (main)/
│   │   ├── index.tsx           # Dashboard
│   │   ├── wallet.tsx          # Digital Wallet
│   │   ├── signing.tsx         # Signing Requests
│   │   ├── scanner.tsx         # QR Scanner
│   │   └── settings.tsx
│   └── _layout.tsx
├── components/
│   ├── CredentialCard.tsx
│   ├── SigningRequestCard.tsx
│   ├── QRScanner.tsx
│   └── BiometricPrompt.tsx
├── services/
│   ├── auth.service.ts
│   ├── storage.service.ts
│   ├── signing.service.ts
│   ├── verification.service.ts
│   └── api.service.ts
├── store/
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── credentialsSlice.ts
│   │   └── signingSlice.ts
│   └── index.ts
├── config/
│   └── environment.ts
├── app.json
├── package.json
└── tsconfig.json
```

---

## 10. Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| Token Storage | `expo-secure-store` with encryption |
| Biometric Auth | Required for all signing operations |
| Certificate Pinning | Pin Keycloak and API certificates |
| Session Timeout | Auto-logout after 15 minutes of inactivity |
| Jailbreak Detection | Block app on rooted/jailbroken devices |
| Request Expiry | Signing requests expire after 15 minutes |

---

## 11. Pre-Deployment Checklist

- [x] Create `mobile-app` client in Keycloak RegistryAdmin realm
- [x] Configure Nginx reverse proxy for `identity.healthflow.tech`
- [x] Add DNS A record for `identity.healthflow.tech`
- [x] Obtain SSL certificate for `identity.healthflow.tech`
- [x] Deploy Signing Service (`healthflow-signing`)
- [x] Add DNS A record for `signing.healthflow.tech`
- [x] Obtain SSL certificate for `signing.healthflow.tech`
- [x] Test DID generation flow end-to-end
- [x] Test document signing flow end-to-end
- [x] Test signature verification flow end-to-end
- [ ] Configure push notification service (Firebase/APNs)
- [ ] Set up app store accounts (Apple/Google)
- [ ] Load test signing endpoint under concurrent requests

---

## 12. Bug Fixes Applied

| Bug ID | Component | Issue | Resolution |
|--------|-----------|-------|------------|
| #1 | Identity Service | DID generation returning 500 | Fixed request body format - requires `content` wrapper array |
| #2 | Missing API | No signing requests endpoints | Implemented new `healthflow-signing` microservice |
| #3 | Verification | Returning only boolean | Documented correct usage - `DID` + `payload` parameters |

---

## 13. References

1. [Sunbird RC Documentation](https://docs.sunbirdrc.dev/)
2. [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)
3. [DID Web Method](https://w3c-ccg.github.io/did-method-web/)
4. [React Native App Auth](https://github.com/FormidableLabs/react-native-app-auth)
5. [Expo Documentation](https://docs.expo.dev/)

---

**Document Status:** Final and Validated  
**All backend services are operational and ready for mobile app development.**

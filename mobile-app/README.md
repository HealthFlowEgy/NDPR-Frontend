# HealthFlow Mobile App

Digital Healthcare Credentials & Remote Document Signing for Egyptian Healthcare Professionals.

## Overview

HealthFlow Mobile is a React Native application that enables healthcare professionals in Egypt to:

- **Manage Digital Credentials**: Store and present verifiable credentials in a secure digital wallet
- **Remote Document Signing**: Approve and sign prescriptions, medical certificates, and clinical documents
- **Credential Verification**: Scan and verify other professionals' credentials via QR codes
- **Biometric Security**: Secure all signing operations with Face ID, Touch ID, or device PIN

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React Native + Expo | 50.0 |
| Navigation | Expo Router | 3.4 |
| UI Library | React Native Paper | 5.x |
| State Management | Redux Toolkit | 2.x |
| Authentication | react-native-app-auth | 7.x |
| Secure Storage | expo-secure-store | 12.x |
| Biometrics | expo-local-authentication | 13.x |
| QR Scanning | react-native-vision-camera | 3.x |

## Backend Services

All endpoints validated against production infrastructure (TRD v3.0):

| Service | URL | Status |
|---------|-----|--------|
| Registry API | https://registry.healthflow.tech | ✅ |
| Keycloak | https://keycloak.healthflow.tech | ✅ |
| Identity Service | https://identity.healthflow.tech | ✅ |
| Signing Service | https://signing.healthflow.tech | ✅ |

## Project Structure

```
healthflow-mobile/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout with providers
│   ├── (auth)/             # Authentication screens
│   │   ├── _layout.tsx
│   │   └── login.tsx
│   └── (main)/             # Main app screens
│       ├── _layout.tsx     # Bottom tab navigation
│       ├── index.tsx       # Dashboard
│       ├── wallet.tsx      # Credentials wallet
│       ├── signing.tsx     # Signing requests
│       ├── scanner.tsx     # QR verification
│       └── settings.tsx    # App settings
├── components/             # Reusable UI components
│   ├── BiometricPrompt.tsx
│   ├── CredentialCard.tsx
│   ├── QRScanner.tsx
│   └── SigningRequestCard.tsx
├── services/               # API and business logic
│   ├── api.service.ts      # Base HTTP client
│   ├── auth.service.ts     # Keycloak OAuth
│   ├── identity.service.ts # DID operations
│   ├── signing.service.ts  # Document signing
│   ├── storage.service.ts  # Secure storage
│   └── verification.service.ts
├── store/                  # Redux store
│   ├── index.ts
│   └── slices/
│       ├── authSlice.ts
│       ├── credentialsSlice.ts
│       └── signingSlice.ts
├── config/
│   └── environment.ts      # API endpoints config
├── types/
│   └── index.ts            # TypeScript definitions
├── app.json                # Expo configuration
├── package.json
└── tsconfig.json
```

## Key Features

### 1. OAuth 2.0 + PKCE Authentication

Secure authentication with Keycloak RegistryAdmin realm:

```typescript
const authConfig = {
  issuer: 'https://keycloak.healthflow.tech/realms/RegistryAdmin',
  clientId: 'mobile-app',
  redirectUrl: 'com.healthflow.mobile:/oauthredirect',
  scopes: ['openid', 'profile', 'email'],
  usePKCE: true,
};
```

### 2. Remote Document Signing

Biometric-gated signing flow:

1. Receive signing request via push notification
2. Review document details in app
3. Authenticate with Face ID / Touch ID
4. App calls Signing Service to create signature
5. Signed document returned to requester

### 3. DID Generation

Generate Decentralized Identifiers for professionals:

```typescript
// Correct format with "content" wrapper (TRD v3.0)
const body = {
  content: [{
    alsoKnownAs: ["dr-ahmed-hassan-001"],
    services: [],
    method: "web"
  }]
};
```

### 4. QR Verification

Scan and verify credentials instantly:

```typescript
// QR code format
{
  "type": "healthflow-credential",
  "did": "did:web:registry.healthflow.tech:uuid",
  "credential_id": "cred-12345"
}
```

## Installation

```bash
# Clone repository
git clone https://github.com/HealthFlow-Medical-HCX/healthflow-mobile.git
cd healthflow-mobile

# Install dependencies
npm install

# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## Configuration

### Environment Variables

Create `.env` file:

```env
EXPO_PUBLIC_REGISTRY_URL=https://registry.healthflow.tech
EXPO_PUBLIC_KEYCLOAK_URL=https://keycloak.healthflow.tech
EXPO_PUBLIC_IDENTITY_URL=https://identity.healthflow.tech
EXPO_PUBLIC_SIGNING_URL=https://signing.healthflow.tech
EXPO_PUBLIC_KEYCLOAK_REALM=RegistryAdmin
EXPO_PUBLIC_KEYCLOAK_CLIENT_ID=mobile-app
```

### Keycloak Client Setup

Create `mobile-app` client in RegistryAdmin realm:

| Setting | Value |
|---------|-------|
| Client Type | Public |
| PKCE | Enabled (S256) |
| Redirect URIs | `com.healthflow.mobile:/oauthredirect` |
| Web Origins | `com.healthflow.mobile` |

## Security Features

| Feature | Implementation |
|---------|----------------|
| Token Storage | expo-secure-store (Keychain/Keystore) |
| Biometric Auth | Required for all signing operations |
| Session Timeout | Auto-logout after 15 minutes |
| Request Expiry | Signing requests expire in 15 minutes |
| SSL Pinning | Recommended for production |

## API Reference

### Identity Service

```typescript
// Generate DID
POST /did/generate
{ content: [{ alsoKnownAs: [], services: [], method: "web" }] }

// Sign document
POST /utils/sign
{ DID: "did:web:...", payload: { ... } }

// Verify signature
POST /utils/verify
{ DID: "did:web:...", payload: { ... } }
// Returns: true | false
```

### Signing Service

```typescript
// List pending requests
GET /api/v1/signing-requests?status=pending
Authorization: Bearer {token}

// Approve request
POST /api/v1/signing-requests/{id}/approve
{ biometric_verified: true, device_info: "iPhone 15" }

// Reject request
POST /api/v1/signing-requests/{id}/reject
{ reason: "Not authorized" }
```

## Building for Production

### iOS

```bash
# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### Android

```bash
# Build for Android
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

## Testing

```bash
# Run linting
npm run lint

# Run type checking
npm run typecheck

# Run tests
npm test
```

## Troubleshooting

### Common Issues

1. **OAuth redirect not working**
   - Ensure URI scheme is registered in `app.json`
   - Check Keycloak client redirect URIs

2. **Biometric not available**
   - Verify device has biometric hardware
   - Check user has enrolled biometrics

3. **Camera permission denied**
   - Check Info.plist / AndroidManifest permissions
   - Request permission again in settings

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

Proprietary - HealthFlow Group © 2026

## Support

- Email: support@healthflow.tech
- Documentation: https://docs.healthflow.tech
- Issues: https://github.com/HealthFlow-Medical-HCX/healthflow-mobile/issues

---

**HealthFlow Group** - Digitizing Egypt's Healthcare Infrastructure

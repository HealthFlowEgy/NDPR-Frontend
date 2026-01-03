# HealthFlow Testing Guide

**Version:** 1.0  
**Date:** January 3, 2026  
**Environment:** Production

---

## Portal URLs

| Portal | URL | Description |
|--------|-----|-------------|
| **Admin Dashboard** | https://admin.healthflow.tech | System administration and analytics |
| **Enrollment Portal** | https://enroll.healthflow.tech | Professional registration |
| **Professional Dashboard** | https://dashboard.healthflow.tech | Professional credential management |
| **Public Search** | https://search.healthflow.tech | Public registry search |

---

## Backend Services

| Service | URL | Description |
|---------|-----|-------------|
| Registry API | https://registry.healthflow.tech | Core registry API |
| Keycloak | https://keycloak.healthflow.tech | Authentication server |
| Identity Service | https://identity.healthflow.tech | DID and signing operations |
| Signing Service | https://signing.healthflow.tech | Remote signing requests |

---

## Test Credentials

### Admin Portal

| Username | Password | Role |
|----------|----------|------|
| `admin` | `HealthFlow@2026` | System Administrator |
| `registrar` | `Registrar@2026` | Registrar |

### Keycloak Admin Console

- **URL:** https://keycloak.healthflow.tech/admin
- **Realm:** `RegistryAdmin`
- **Admin Username:** `admin`
- **Admin Password:** `HealthFlow@2026`

---

## Test Scenarios

### 1. Admin Dashboard Login

1. Navigate to https://admin.healthflow.tech
2. You will be redirected to Keycloak login
3. Enter credentials: `admin` / `HealthFlow@2026`
4. Verify you see the dashboard with statistics

### 2. Professional Registration

1. Navigate to https://enroll.healthflow.tech
2. Select professional type (Doctor, Nurse, Pharmacist)
3. Fill in personal information
4. Upload required documents
5. Submit registration

### 3. Public Search

1. Navigate to https://search.healthflow.tech
2. Search by name or registration number
3. Filter by professional type
4. Click "Verify" to check credential status

### 4. DID Generation (API Test)

```bash
curl -X POST https://identity.healthflow.tech/did/generate \
  -H "Content-Type: application/json" \
  -d '{"content": [{"alsoKnownAs": ["test-user"], "services": [], "method": "web"}]}'
```

### 5. Document Signing (API Test)

```bash
curl -X POST https://identity.healthflow.tech/utils/sign \
  -H "Content-Type: application/json" \
  -d '{
    "DID": "did:web:registry.healthflow.tech:{uuid}",
    "payload": {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      "type": ["VerifiableCredential"],
      "issuer": "did:web:registry.healthflow.tech:{uuid}",
      "issuanceDate": "2026-01-03T00:00:00Z",
      "credentialSubject": {"id": "test", "name": "Test"}
    }
  }'
```

---

## Known Issues

None at this time. All services are operational.

---

## Support

For issues or questions, contact the development team.

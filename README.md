# HealthFlow Sunbird RC Frontend Portals

Frontend portals for the HealthFlow Sunbird RC healthcare registry system.

## Overview

This repository contains the frontend applications for the HealthFlow healthcare professional and entity registry system built on Sunbird RC.

## Architecture

| Portal | Technology | Description |
|--------|------------|-------------|
| **Admin Dashboard** | React Admin (generator-create-rc-admin) | Registry and schema management for administrators |
| **Enrollment Portal** | Angular (sunbird-rc-ui) | Self-service registration for healthcare professionals and entities |
| **Professional Dashboard** | Angular (sunbird-rc-ui + elocker-ui) | Profile management and credential wallet for professionals |
| **Public Search Portal** | Angular (sunbird-rc-ui) | Public verification and search of registered professionals |

## Directory Structure

```
Healthflow-sunbird-rc-frontend/
├── admin-dashboard/          # React Admin dashboard (auto-generated)
├── enrollment-portal/        # Angular enrollment application
├── professional-dashboard/   # Angular professional profile & wallet
├── public-search/           # Angular public search portal
├── shared/                  # Shared configurations and assets
│   ├── config/             # Environment configurations
│   ├── assets/             # Shared images and branding
│   └── schemas/            # JSON schema definitions
├── docker/                  # Docker configurations
│   ├── docker-compose.yml
│   └── nginx/              # Nginx reverse proxy configs
└── docs/                    # Documentation
```

## Backend Services

The frontend portals connect to the following backend services:

| Service | URL | Description |
|---------|-----|-------------|
| Registry API | https://registry.healthflow.tech | Sunbird RC Registry API |
| Keycloak | https://keycloak.healthflow.tech | Authentication & SSO |
| Identity Service | Internal | DID generation |
| Credential Service | Internal | VC issuance & verification |

## Deployment

### Prerequisites

- Node.js 20.x
- Docker & Docker Compose
- Nginx

### Quick Start

```bash
# Clone the repository
git clone https://github.com/HealthFlow-Medical-HCX/Healthflow-sunbird-rc-frontend.git
cd Healthflow-sunbird-rc-frontend

# Install dependencies for all portals
./scripts/install-all.sh

# Start development servers
./scripts/dev-start.sh

# Build for production
./scripts/build-all.sh

# Deploy with Docker
docker-compose up -d
```

## Environment Configuration

Copy the example environment files and configure for your environment:

```bash
cp shared/config/.env.example shared/config/.env
```

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `REGISTRY_API_URL` | Sunbird RC Registry API endpoint |
| `KEYCLOAK_URL` | Keycloak authentication server URL |
| `KEYCLOAK_REALM` | Keycloak realm name |
| `KEYCLOAK_CLIENT_ID` | Keycloak client ID for the portal |

## Development

### Admin Dashboard

```bash
cd admin-dashboard
npm install
npm start
# Available at http://localhost:3000
```

### Enrollment Portal

```bash
cd enrollment-portal
npm install
ng serve
# Available at http://localhost:4200
```

### Professional Dashboard

```bash
cd professional-dashboard
npm install
ng serve --port 4201
# Available at http://localhost:4201
```

### Public Search Portal

```bash
cd public-search
npm install
ng serve --port 4202
# Available at http://localhost:4202
```

## Healthcare Schemas

The portals support the following healthcare entity schemas:

- **Doctor** - Medical practitioners with specializations
- **Nurse** - Nursing professionals
- **Pharmacist** - Licensed pharmacists
- **HealthFacility** - Hospitals, clinics, and healthcare centers

## License

MIT License - See [LICENSE](LICENSE) for details.

## Related Repositories

- [Healthflow-sunbird-rc-core](https://github.com/HealthFlow-Medical-HCX/Healthflow-sunbird-rc-core) - Backend infrastructure and configurations
- [Healthflow-DID](https://github.com/HealthFlow-Medical-HCX/Healthflow-DID) - Digital Identity Wallet

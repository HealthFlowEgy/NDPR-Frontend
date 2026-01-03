# HealthFlow Frontend Portals - Deployment Summary

## Overview

This document summarizes the frontend portals implementation for the HealthFlow Healthcare Professional Registry system. All portals are deployed on a separate Digital Ocean droplet to ensure backend services remain unaffected.

## Infrastructure

### Frontend Droplet
| Property | Value |
|----------|-------|
| **Name** | healthflow-frontend |
| **Public IP** | 139.59.157.82 |
| **Region** | Frankfurt 1 (fra1) |
| **Size** | 2 vCPUs, 4GB RAM, 80GB Disk |
| **OS** | Ubuntu 22.04 LTS |

### Backend Services (Unchanged)
| Service | URL |
|---------|-----|
| Registry API | https://registry.healthflow.tech |
| Keycloak | https://keycloak.healthflow.tech |

## Deployed Portals

### 1. Admin Dashboard
| Property | Value |
|----------|-------|
| **URL** | http://139.59.157.82 (Port 80) |
| **Technology** | React Admin + TypeScript |
| **Status** | ✅ Deployed |
| **Features** | CRUD operations for Doctors, Nurses, Pharmacists, Health Facilities |

### 2. Enrollment Portal
| Property | Value |
|----------|-------|
| **URL** | http://139.59.157.82:8080 |
| **Technology** | Angular 19 + Angular Material |
| **Status** | ✅ Deployed |
| **Features** | Multi-step registration form for healthcare professionals |

### 3. Professional Dashboard
| Property | Value |
|----------|-------|
| **URL** | http://139.59.157.82:8081 |
| **Technology** | Static HTML (placeholder) |
| **Status** | 🚧 Placeholder |
| **Planned Features** | Profile management, credential viewing, digital wallet |

### 4. Public Search Portal
| Property | Value |
|----------|-------|
| **URL** | http://139.59.157.82:8082 |
| **Technology** | Static HTML (placeholder) |
| **Status** | 🚧 Placeholder |
| **Planned Features** | Search and verify healthcare professionals |

## GitHub Repository

**Repository:** https://github.com/HealthFlow-Medical-HCX/Healthflow-sunbird-rc-frontend

### Repository Structure
```
Healthflow-sunbird-rc-frontend/
├── README.md
├── .gitignore
├── admin-dashboard/
│   ├── README.md
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── App.tsx
│       ├── sunbirdRcDataProvider.ts
│       └── ...
├── enrollment-portal/
│   ├── README.md
│   ├── package.json
│   ├── angular.json
│   └── src/
│       ├── app/
│       │   ├── app.ts
│       │   ├── app.config.ts
│       │   ├── app.routes.ts
│       │   └── enrollment-form/
│       ├── environments/
│       └── main.ts
├── professional-dashboard/
│   └── README.md (placeholder)
├── public-search/
│   └── README.md (placeholder)
├── shared/
│   └── config/
│       └── .env.example
└── docker/
    ├── docker-compose.yml
    └── nginx/
        └── nginx.conf
```

## DNS Configuration (Required)

To use custom domains, add the following DNS records pointing to `139.59.157.82`:

| Subdomain | Type | Value |
|-----------|------|-------|
| admin.healthflow.tech | A | 139.59.157.82 |
| enroll.healthflow.tech | A | 139.59.157.82 |
| dashboard.healthflow.tech | A | 139.59.157.82 |
| search.healthflow.tech | A | 139.59.157.82 |

## SSH Access

SSH credentials for the frontend droplet are available in the credentials file provided separately.

```bash
ssh -i healthflow_frontend_key root@139.59.157.82
```

## Next Steps

### Immediate
1. Configure DNS records for custom domains
2. Set up SSL certificates using Let's Encrypt
3. Configure CORS on backend to allow frontend origins

### Development Priorities
1. **Professional Dashboard** - Implement full Angular application with:
   - Keycloak authentication integration
   - Profile management
   - Verifiable Credential viewing (eLocker integration)
   - Status tracking

2. **Public Search Portal** - Implement search functionality with:
   - Integration with Registry API search endpoint
   - Filter by professional type and specialization
   - Credential verification display

### Backend Integration
1. Enable CORS headers on Registry API for frontend origins
2. Create Keycloak clients for each portal:
   - `admin-dashboard`
   - `enrollment-portal`
   - `professional-dashboard`
   - `public-search`

## Technology Stack Summary

| Portal | Framework | UI Library | State Management |
|--------|-----------|------------|------------------|
| Admin Dashboard | React 18 | React Admin + MUI | React Admin |
| Enrollment Portal | Angular 19 | Angular Material | Reactive Forms |
| Professional Dashboard | Angular (planned) | Angular Material | NgRx (planned) |
| Public Search | Angular (planned) | Angular Material | Services |

## Maintenance

### Rebuilding Portals
```bash
# Admin Dashboard
cd /var/www/healthflow-frontend/admin-dashboard/healthflow-admin
npm run build

# Enrollment Portal
cd /var/www/healthflow-frontend/enrollment-portal/healthflow-enrollment
ng build --configuration=production
```

### Nginx Configuration
```bash
# Test configuration
nginx -t

# Reload after changes
systemctl reload nginx
```

---

**Document Version:** 1.0  
**Last Updated:** January 3, 2026  
**Author:** HealthFlow Development Team

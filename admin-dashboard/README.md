# HealthFlow Admin Dashboard

React Admin-based dashboard for managing the HealthFlow Healthcare Registry.

## Overview

This admin dashboard provides a comprehensive interface for system administrators and registrars to manage healthcare professionals and entities in the Sunbird RC registry.

## Features

- **Doctor Management** - Create, view, edit, and delete doctor records
- **Nurse Management** - Manage nurse registrations
- **Pharmacist Management** - Handle pharmacist records
- **Health Facility Management** - Manage hospitals, clinics, and pharmacies
- **Search & Filter** - Advanced search across all entity types
- **Bulk Operations** - Import/export registry data

## Technology Stack

- React 18 with TypeScript
- React Admin 4.x
- Material UI 5.x
- Custom Sunbird RC Data Provider

## Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Configuration

Create a `.env` file with the following variables:

```env
REACT_APP_API_URL=https://registry.healthflow.tech/api/v1
REACT_APP_KEYCLOAK_URL=https://keycloak.healthflow.tech
REACT_APP_KEYCLOAK_REALM=sunbird-rc
REACT_APP_KEYCLOAK_CLIENT_ID=admin-dashboard
```

## Deployment

The dashboard is deployed on the frontend droplet (139.59.157.82) and served via Nginx.

### Production URLs

- **Direct IP**: http://139.59.157.82
- **Domain**: https://admin.healthflow.tech (requires DNS configuration)

## Custom Data Provider

The `sunbirdRcDataProvider.ts` provides a custom data provider that integrates with the Sunbird RC Registry API:

- Handles Sunbird RC's unique `osid` identifier
- Supports search endpoint with filters
- Manages CRUD operations for all entity types

## Project Structure

```
admin-dashboard/
├── src/
│   ├── App.tsx                    # Main application component
│   ├── sunbirdRcDataProvider.ts   # Custom Sunbird RC data provider
│   ├── index.tsx                  # Application entry point
│   └── ...
├── package.json
├── tsconfig.json
└── README.md
```

## License

Proprietary - HealthFlow Medical HCX

# HealthFlow Admin Dashboard

React Admin dashboard for managing the HealthFlow healthcare registry.

## Overview

This dashboard is generated using [generator-create-rc-admin](https://github.com/Samagra-Development/generator-create-rc-admin), which automatically creates admin panels from Sunbird RC schemas.

## Features

- **Schema Management** - View and manage registry schemas
- **Entity CRUD** - Create, read, update, delete registry entries
- **User Management** - Manage registrars and administrators
- **Attestation Workflow** - Review and approve attestation requests
- **Reports & Analytics** - View registry statistics and reports

## Supported Entities

- Doctor
- Nurse
- Pharmacist
- HealthFacility

## Setup

### Prerequisites

- Node.js 20.x
- npm or yarn
- Yeoman (`npm install -g yo`)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Configuration

Configure the following environment variables:

```env
REACT_APP_API_URL=https://registry.healthflow.tech/api/v1
REACT_APP_KEYCLOAK_URL=https://keycloak.healthflow.tech
REACT_APP_KEYCLOAK_REALM=sunbird-rc
REACT_APP_KEYCLOAK_CLIENT_ID=admin-dashboard
```

## Technology Stack

- React 18
- React Admin
- Material UI
- Keycloak JS Adapter

## Generation

This dashboard was generated using:

```bash
yo create-rc-admin
```

With the following configuration:
- API Type: Sunbird-RC
- Dashboard Title: HealthFlow Admin
- Entities: Doctor, Nurse, Pharmacist, HealthFacility

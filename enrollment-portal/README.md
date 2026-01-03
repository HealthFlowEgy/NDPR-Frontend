# HealthFlow Enrollment Portal

Angular-based self-service enrollment portal for healthcare professionals and entities.

## Overview

This portal allows healthcare professionals (doctors, nurses, pharmacists) and healthcare entities (hospitals, clinics) to self-register with the HealthFlow registry.

## Features

- **Self-Registration** - Healthcare professionals can register themselves
- **Document Upload** - Upload supporting documents (licenses, certificates)
- **KYC Verification** - Integration with identity verification services
- **DID Generation** - Automatic generation of Decentralized Identifiers
- **Credential Issuance** - Receive Verifiable Credentials upon approval

## Enrollment Flow

1. **Registration** - User creates account with basic information
2. **Profile Completion** - Fill in professional details
3. **Document Upload** - Upload required documents
4. **Verification** - Submit for verification
5. **Approval** - Registrar reviews and approves
6. **Credential Issuance** - Receive digital credentials

## Supported Entity Types

- Doctor
- Nurse
- Pharmacist
- HealthFacility

## Setup

### Prerequisites

- Node.js 20.x
- Angular CLI 17.x

### Installation

```bash
# Install Angular CLI
npm install -g @angular/cli

# Install dependencies
npm install

# Start development server
ng serve

# Build for production
ng build --configuration=production
```

## Configuration

The portal uses `sunbird-rc-ui` configuration files:

- `forms.json` - Form definitions for each entity type
- `layouts.json` - Page layout configurations
- `search.json` - Search configuration

## Technology Stack

- Angular 17
- Sunbird RC UI Toolkit
- Angular Material
- Keycloak Angular Adapter

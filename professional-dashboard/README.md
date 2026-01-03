# HealthFlow Professional Dashboard

Angular-based dashboard for healthcare professionals to manage their profiles and digital credentials.

## Overview

This dashboard provides healthcare professionals with a unified interface to manage their registry profile, view and share their digital credentials, and update their professional information.

## Features

- **Profile Management** - View and update professional profile
- **Credential Wallet** - Store and manage Verifiable Credentials (VCs)
- **Credential Sharing** - Generate QR codes for credential verification
- **Attestation Requests** - Request attestations from other entities
- **Notification Center** - View updates and notifications
- **Activity Log** - Track profile and credential activities

## Credential Types

- Professional License
- Specialization Certificate
- Employment Verification
- Training Certificates
- Continuing Education Credits

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
ng serve --port 4201

# Build for production
ng build --configuration=production
```

## Integration

This dashboard integrates:

- **sunbird-rc-ui** - Core UI components and forms
- **sunbird-rc-elocker-ui** - Digital wallet functionality

## Technology Stack

- Angular 17
- Sunbird RC UI Toolkit
- Sunbird RC eLocker UI
- Angular Material
- Keycloak Angular Adapter
- QR Code Generator

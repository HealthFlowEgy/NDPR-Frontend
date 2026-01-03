# HealthFlow Public Search Portal

Angular-based public portal for searching and verifying registered healthcare professionals.

## Overview

This portal allows the public to search for registered healthcare professionals and entities, and verify their credentials using QR codes or credential IDs.

## Features

- **Professional Search** - Search for doctors, nurses, pharmacists
- **Entity Search** - Search for hospitals, clinics, pharmacies
- **Credential Verification** - Verify credentials via QR code scan
- **Profile View** - View public professional profiles
- **Certificate Download** - Download verification certificates

## Search Capabilities

- Search by name
- Search by registration number
- Search by specialization
- Search by location
- Filter by entity type

## Verification Methods

1. **QR Code Scan** - Scan QR code on credential
2. **Credential ID** - Enter credential ID manually
3. **Registration Number** - Verify by professional registration number

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
ng serve --port 4202

# Build for production
ng build --configuration=production
```

## Configuration

Configure search parameters in `search.json`:

```json
{
  "entities": ["Doctor", "Nurse", "Pharmacist", "HealthFacility"],
  "searchFields": ["name", "registrationNumber", "specialization"],
  "displayFields": ["name", "qualification", "registrationNumber", "status"]
}
```

## Technology Stack

- Angular 17
- Sunbird RC UI Toolkit
- Angular Material
- QR Code Scanner

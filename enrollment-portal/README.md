# HealthFlow Enrollment Portal

Angular-based self-service registration portal for healthcare professionals.

## Overview

This portal allows healthcare professionals (Doctors, Nurses, Pharmacists) to self-register in the HealthFlow Registry. The registration process includes personal information, professional credentials, and document verification.

## Features

- **Multi-step Registration Form** - Guided 3-step registration process
- **Professional Type Selection** - Doctor, Nurse, or Pharmacist
- **Personal Information** - Name, DOB, National ID, Contact details
- **Professional Details** - Registration number, qualifications, specialization
- **Document Checklist** - Required documents for verification
- **Consent Management** - Terms acceptance before submission

## Technology Stack

- Angular 19 with standalone components
- Angular Material UI
- Reactive Forms with validation
- SCSS styling

## Prerequisites

- Node.js 20.x or higher
- Angular CLI 19.x

## Installation

```bash
# Install dependencies
npm install

# Start development server
ng serve

# Build for production
ng build --configuration=production
```

## Configuration

Configure the API endpoints in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://registry.healthflow.tech/api/v1',
  keycloak: {
    url: 'https://keycloak.healthflow.tech',
    realm: 'sunbird-rc',
    clientId: 'enrollment-portal'
  }
};
```

## Deployment

The portal is deployed on the frontend droplet (139.59.157.82) and served via Nginx on port 8080.

### Production URLs

- **Direct IP**: http://139.59.157.82:8080
- **Domain**: https://enroll.healthflow.tech (requires DNS configuration)

## Registration Flow

1. **Personal Information**
   - Select professional type (Doctor/Nurse/Pharmacist)
   - Enter personal details (name, DOB, gender)
   - Provide National ID (14-digit Egyptian ID)
   - Contact information (email, phone, address)

2. **Professional Details**
   - Medical Syndicate Registration Number
   - Years of experience
   - Qualification (MBBS, MD, BSN, PharmD, etc.)
   - Specialization
   - Current employer

3. **Documents & Submit**
   - Review document requirements
   - Accept consent declaration
   - Submit registration

## Project Structure

```
enrollment-portal/
├── src/
│   ├── app/
│   │   ├── app.ts                    # Main app component
│   │   ├── app.config.ts             # App configuration
│   │   ├── app.routes.ts             # Routing configuration
│   │   └── enrollment-form/          # Enrollment form component
│   ├── environments/
│   │   └── environment.ts            # Environment configuration
│   ├── main.ts                       # Application entry point
│   └── styles.scss                   # Global styles
├── angular.json
├── package.json
└── README.md
```

## License

Proprietary - HealthFlow Medical HCX

import React, { useEffect, useState } from 'react';
import { Admin, Resource, CustomRoutes } from 'react-admin';
import { Route } from 'react-router-dom';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import BusinessIcon from '@mui/icons-material/Business';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import sunbirdRcDataProvider from './sunbirdRcDataProvider';
import { authProvider, initKeycloak, Permissions } from './authProvider';
import Dashboard from './components/Dashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';

// Import CRUD components
import {
    DoctorList,
    DoctorCreate,
    DoctorEdit,
    DoctorShow,
} from './resources/doctors';

import {
    NurseList,
    NurseCreate,
    NurseEdit,
    NurseShow,
} from './resources/nurses';

import {
    PharmacistList,
    PharmacistCreate,
    PharmacistEdit,
    PharmacistShow,
} from './resources/pharmacists';

import {
    PhysiotherapistList,
    PhysiotherapistCreate,
    PhysiotherapistEdit,
    PhysiotherapistShow,
} from './resources/physiotherapists';

import {
    DentistList,
    DentistCreate,
    DentistEdit,
    DentistShow,
} from './resources/dentists';

import {
    HealthFacilityList,
    HealthFacilityCreate,
    HealthFacilityEdit,
    HealthFacilityShow,
} from './resources/healthFacilities';

// Loading component
const LoadingScreen: React.FC = () => (
    <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="#f5f5f5"
    >
        <img 
            src="/logo.png" 
            alt="HealthFlow" 
            style={{ width: 120, marginBottom: 24 }}
            onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
            }}
        />
        <CircularProgress size={48} sx={{ color: '#1976d2' }} />
        <Typography variant="h6" sx={{ mt: 2, color: '#666' }}>
            Initializing Authentication...
        </Typography>
    </Box>
);

// Error component
const ErrorScreen: React.FC<{ message: string }> = ({ message }) => (
    <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="#f5f5f5"
    >
        <Typography variant="h5" color="error" gutterBottom>
            Authentication Error
        </Typography>
        <Typography variant="body1" color="textSecondary">
            {message}
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
            Please refresh the page or contact support.
        </Typography>
    </Box>
);

function App() {
    const [keycloakReady, setKeycloakReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        initKeycloak()
            .then((authenticated) => {
                if (authenticated) {
                    console.log('Keycloak authenticated successfully');
                    setKeycloakReady(true);
                } else {
                    // This shouldn't happen with 'login-required' onLoad
                    setError('Authentication required');
                }
            })
            .catch((err) => {
                console.error('Keycloak initialization failed:', err);
                setError('Failed to initialize authentication. Please try again.');
            });

        // Token refresh is handled by authProvider.checkError
    }, []);

    if (error) {
        return <ErrorScreen message={error} />;
    }

    if (!keycloakReady) {
        return <LoadingScreen />;
    }

    return (
        <Admin
            dataProvider={sunbirdRcDataProvider}
            authProvider={authProvider}
            dashboard={Dashboard}
            title="HealthFlow Admin Dashboard"
            requireAuth
        >
            {(permissions: Permissions) => (
                <>
                    {/* Doctor Resource */}
                    {permissions.canManageDoctors && (
                        <Resource
                            name="Doctor"
                            list={DoctorList}
                            create={DoctorCreate}
                            edit={DoctorEdit}
                            show={DoctorShow}
                            icon={LocalHospitalIcon}
                            options={{ label: 'Doctors' }}
                        />
                    )}

                    {/* Nurse Resource */}
                    {permissions.canManageNurses && (
                        <Resource
                            name="Nurse"
                            list={NurseList}
                            create={NurseCreate}
                            edit={NurseEdit}
                            show={NurseShow}
                            icon={MedicalServicesIcon}
                            options={{ label: 'Nurses' }}
                        />
                    )}

                    {/* Pharmacist Resource */}
                    {permissions.canManagePharmacists && (
                        <Resource
                            name="Pharmacist"
                            list={PharmacistList}
                            create={PharmacistCreate}
                            edit={PharmacistEdit}
                            show={PharmacistShow}
                            icon={LocalPharmacyIcon}
                            options={{ label: 'Pharmacists' }}
                        />
                    )}

                    {/* Physiotherapist Resource */}
                    {permissions.canManagePhysiotherapists && (
                        <Resource
                            name="Physiotherapist"
                            list={PhysiotherapistList}
                            create={PhysiotherapistCreate}
                            edit={PhysiotherapistEdit}
                            show={PhysiotherapistShow}
                            icon={AccessibilityNewIcon}
                            options={{ label: 'Physiotherapists' }}
                        />
                    )}

                    {/* Dentist Resource */}
                    {permissions.canManageDentists && (
                        <Resource
                            name="Dentist"
                            list={DentistList}
                            create={DentistCreate}
                            edit={DentistEdit}
                            show={DentistShow}
                            icon={MedicalInformationIcon}
                            options={{ label: 'Dentists' }}
                        />
                    )}

                    {/* Health Facility Resource */}
                    {permissions.canManageFacilities && (
                        <Resource
                            name="HealthFacility"
                            list={HealthFacilityList}
                            create={HealthFacilityCreate}
                            edit={HealthFacilityEdit}
                            show={HealthFacilityShow}
                            icon={BusinessIcon}
                            options={{ label: 'Health Facilities' }}
                        />
                    )}

                    {/* Custom Routes */}
                    <CustomRoutes>
                        {permissions.canViewAnalytics && (
                            <Route path="/analytics" element={<AnalyticsDashboard />} />
                        )}
                    </CustomRoutes>
                </>
            )}
        </Admin>
    );
}

export default App;

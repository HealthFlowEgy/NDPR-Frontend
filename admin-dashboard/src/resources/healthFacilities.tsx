import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    EmailField,
    DateField,
    NumberField,
    BooleanField,
    Edit,
    Create,
    SimpleForm,
    TextInput,
    SelectInput,
    NumberInput,
    BooleanInput,
    Show,
    SimpleShowLayout,
    EditButton,
    ShowButton,
    DeleteButton,
    Filter,
    SearchInput,
    useRecordContext,
    TopToolbar,
    CreateButton,
    ExportButton,
    required,
    email,
    Toolbar,
    SaveButton,
} from 'react-admin';
import { Box, Chip, Typography, Card, CardContent, Grid } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';

// Status choices
const statusChoices = [
    { id: 'Active', name: 'Active' },
    { id: 'Inactive', name: 'Inactive' },
    { id: 'Suspended', name: 'Suspended' },
    { id: 'Pending', name: 'Pending Verification' },
];

// Facility type choices
const facilityTypeChoices = [
    { id: 'Hospital', name: 'Hospital' },
    { id: 'Clinic', name: 'Clinic' },
    { id: 'Pharmacy', name: 'Pharmacy' },
    { id: 'Laboratory', name: 'Laboratory' },
    { id: 'Diagnostic Center', name: 'Diagnostic Center' },
    { id: 'Rehabilitation Center', name: 'Rehabilitation Center' },
    { id: 'Nursing Home', name: 'Nursing Home' },
    { id: 'Medical Center', name: 'Medical Center' },
];

// Facility category choices
const facilityCategoryChoices = [
    { id: 'Government', name: 'Government' },
    { id: 'Private', name: 'Private' },
    { id: 'NGO', name: 'NGO' },
    { id: 'Military', name: 'Military' },
    { id: 'University', name: 'University' },
];

// Governorate choices
const governorateChoices = [
    { id: 'Cairo', name: 'Cairo' },
    { id: 'Alexandria', name: 'Alexandria' },
    { id: 'Giza', name: 'Giza' },
    { id: 'Qalyubia', name: 'Qalyubia' },
    { id: 'Port Said', name: 'Port Said' },
    { id: 'Suez', name: 'Suez' },
    { id: 'Luxor', name: 'Luxor' },
    { id: 'Aswan', name: 'Aswan' },
    { id: 'Asyut', name: 'Asyut' },
    { id: 'Beheira', name: 'Beheira' },
    { id: 'Beni Suef', name: 'Beni Suef' },
    { id: 'Dakahlia', name: 'Dakahlia' },
    { id: 'Damietta', name: 'Damietta' },
    { id: 'Faiyum', name: 'Faiyum' },
    { id: 'Gharbia', name: 'Gharbia' },
    { id: 'Ismailia', name: 'Ismailia' },
    { id: 'Kafr El Sheikh', name: 'Kafr El Sheikh' },
    { id: 'Matruh', name: 'Matruh' },
    { id: 'Minya', name: 'Minya' },
    { id: 'Monufia', name: 'Monufia' },
    { id: 'New Valley', name: 'New Valley' },
    { id: 'North Sinai', name: 'North Sinai' },
    { id: 'Qena', name: 'Qena' },
    { id: 'Red Sea', name: 'Red Sea' },
    { id: 'Sharqia', name: 'Sharqia' },
    { id: 'Sohag', name: 'Sohag' },
    { id: 'South Sinai', name: 'South Sinai' },
];

// Custom status field
const StatusField = () => {
    const record = useRecordContext();
    if (!record) return null;
    const statusColors: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
        'Active': 'success', 'Inactive': 'default', 'Suspended': 'error', 'Pending': 'warning',
    };
    return <Chip label={record.status || 'Unknown'} color={statusColors[record.status] || 'default'} size="small" />;
};

// Emergency services field
const EmergencyField = () => {
    const record = useRecordContext();
    if (!record) return null;
    return <Chip label={record.emergencyServices ? 'Yes' : 'No'} color={record.emergencyServices ? 'success' : 'default'} size="small" />;
};

// Filter component
const FacilityFilter = (props: any) => (
    <Filter {...props}>
        <SearchInput source="q" alwaysOn placeholder="Search facilities..." />
        <SelectInput source="status" choices={statusChoices} alwaysOn />
        <SelectInput source="facilityType" choices={facilityTypeChoices} />
        <SelectInput source="facilityCategory" choices={facilityCategoryChoices} />
        <SelectInput source="governorate" choices={governorateChoices} />
    </Filter>
);

// List Actions
const ListActions = () => (
    <TopToolbar>
        <CreateButton />
        <ExportButton />
    </TopToolbar>
);

// Custom Toolbar
const CustomToolbar = () => (
    <Toolbar>
        <SaveButton />
    </Toolbar>
);

// List Component
export const HealthFacilityList = () => (
    <List filters={<FacilityFilter />} actions={<ListActions />} sort={{ field: 'facilityName', order: 'ASC' }} perPage={25}>
        <Datagrid rowClick="show" bulkActionButtons={false}>
            <TextField source="facilityName" label="Facility Name" />
            <TextField source="facilityType" label="Type" />
            <TextField source="facilityCategory" label="Category" />
            <TextField source="licenseNumber" label="License Number" />
            <TextField source="governorate" label="Governorate" />
            <NumberField source="bedCapacity" label="Beds" />
            <EmergencyField />
            <StatusField />
            <EditButton />
            <ShowButton />
            <DeleteButton mutationMode="pessimistic" />
        </Datagrid>
    </List>
);

// Create Component
export const HealthFacilityCreate = () => (
    <Create title="Register New Health Facility">
        <SimpleForm toolbar={<CustomToolbar />}>
            <Typography variant="h6" gutterBottom>Facility Information</Typography>
            <Box display="flex" flexDirection="column" gap={2} width="100%">
                <Box display="flex" gap={2}>
                    <TextInput source="facilityName" label="Facility Name" validate={required()} fullWidth />
                    <TextInput source="licenseNumber" label="License Number" validate={required()} fullWidth />
                </Box>
                <Box display="flex" gap={2}>
                    <SelectInput source="facilityType" label="Facility Type" choices={facilityTypeChoices} validate={required()} fullWidth />
                    <SelectInput source="facilityCategory" label="Facility Category" choices={facilityCategoryChoices} validate={required()} fullWidth />
                </Box>
            </Box>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Contact Information</Typography>
            <Box display="flex" flexDirection="column" gap={2} width="100%">
                <Box display="flex" gap={2}>
                    <TextInput source="email" label="Email Address" validate={[required(), email()]} fullWidth />
                    <TextInput source="phone" label="Phone Number" validate={required()} fullWidth />
                </Box>
                <Box display="flex" gap={2}>
                    <SelectInput source="governorate" label="Governorate" choices={governorateChoices} validate={required()} fullWidth />
                    <TextInput source="city" label="City" fullWidth />
                </Box>
                <TextInput source="address" label="Full Address" fullWidth multiline />
            </Box>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Facility Details</Typography>
            <Box display="flex" flexDirection="column" gap={2} width="100%">
                <Box display="flex" gap={2}>
                    <NumberInput source="bedCapacity" label="Bed Capacity" fullWidth />
                    <NumberInput source="numberOfDoctors" label="Number of Doctors" fullWidth />
                </Box>
                <Box display="flex" gap={2}>
                    <NumberInput source="numberOfNurses" label="Number of Nurses" fullWidth />
                    <SelectInput source="status" label="Status" choices={statusChoices} defaultValue="Pending" fullWidth />
                </Box>
                <Box display="flex" gap={2}>
                    <BooleanInput source="emergencyServices" label="Emergency Services Available" />
                    <BooleanInput source="ambulanceServices" label="Ambulance Services Available" />
                </Box>
                <TextInput source="specialties" label="Specialties (comma-separated)" fullWidth multiline />
            </Box>
        </SimpleForm>
    </Create>
);

// Edit Component
export const HealthFacilityEdit = () => (
    <Edit title="Edit Health Facility">
        <SimpleForm toolbar={<CustomToolbar />}>
            <Typography variant="h6" gutterBottom>Facility Information</Typography>
            <Box display="flex" flexDirection="column" gap={2} width="100%">
                <Box display="flex" gap={2}>
                    <TextInput source="facilityName" label="Facility Name" validate={required()} fullWidth />
                    <TextInput source="licenseNumber" label="License Number" validate={required()} fullWidth />
                </Box>
                <Box display="flex" gap={2}>
                    <SelectInput source="facilityType" label="Facility Type" choices={facilityTypeChoices} validate={required()} fullWidth />
                    <SelectInput source="facilityCategory" label="Facility Category" choices={facilityCategoryChoices} validate={required()} fullWidth />
                </Box>
            </Box>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Contact Information</Typography>
            <Box display="flex" flexDirection="column" gap={2} width="100%">
                <Box display="flex" gap={2}>
                    <TextInput source="email" label="Email Address" validate={[required(), email()]} fullWidth />
                    <TextInput source="phone" label="Phone Number" validate={required()} fullWidth />
                </Box>
                <Box display="flex" gap={2}>
                    <SelectInput source="governorate" label="Governorate" choices={governorateChoices} validate={required()} fullWidth />
                    <TextInput source="city" label="City" fullWidth />
                </Box>
                <TextInput source="address" label="Full Address" fullWidth multiline />
            </Box>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Facility Details</Typography>
            <Box display="flex" flexDirection="column" gap={2} width="100%">
                <Box display="flex" gap={2}>
                    <NumberInput source="bedCapacity" label="Bed Capacity" fullWidth />
                    <NumberInput source="numberOfDoctors" label="Number of Doctors" fullWidth />
                </Box>
                <Box display="flex" gap={2}>
                    <NumberInput source="numberOfNurses" label="Number of Nurses" fullWidth />
                    <SelectInput source="status" label="Status" choices={statusChoices} fullWidth />
                </Box>
                <Box display="flex" gap={2}>
                    <BooleanInput source="emergencyServices" label="Emergency Services Available" />
                    <BooleanInput source="ambulanceServices" label="Ambulance Services Available" />
                </Box>
                <TextInput source="specialties" label="Specialties (comma-separated)" fullWidth multiline />
            </Box>
        </SimpleForm>
    </Edit>
);

// Show Component
export const HealthFacilityShow = () => (
    <Show title="Health Facility Details">
        <SimpleShowLayout>
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid size={12}>
                            <Typography variant="h5" gutterBottom>
                                <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Facility Information
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">Facility Name</Typography>
                            <TextField source="facilityName" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">License Number</Typography>
                            <TextField source="licenseNumber" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">Facility Type</Typography>
                            <TextField source="facilityType" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">Facility Category</Typography>
                            <TextField source="facilityCategory" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                            <StatusField />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid size={12}>
                            <Typography variant="h5" gutterBottom>Contact Information</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                            <EmailField source="email" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                            <TextField source="phone" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">Governorate</Typography>
                            <TextField source="governorate" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">City</Typography>
                            <TextField source="city" />
                        </Grid>
                        <Grid size={12}>
                            <Typography variant="subtitle2" color="textSecondary">Address</Typography>
                            <TextField source="address" />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid size={12}>
                            <Typography variant="h5" gutterBottom>Facility Details</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography variant="subtitle2" color="textSecondary">Bed Capacity</Typography>
                            <NumberField source="bedCapacity" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography variant="subtitle2" color="textSecondary">Number of Doctors</Typography>
                            <NumberField source="numberOfDoctors" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography variant="subtitle2" color="textSecondary">Number of Nurses</Typography>
                            <NumberField source="numberOfNurses" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">Emergency Services</Typography>
                            <BooleanField source="emergencyServices" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">Ambulance Services</Typography>
                            <BooleanField source="ambulanceServices" />
                        </Grid>
                        <Grid size={12}>
                            <Typography variant="subtitle2" color="textSecondary">Specialties</Typography>
                            <TextField source="specialties" />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            
            <Card>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid size={12}>
                            <Typography variant="h5" gutterBottom>Registry Information</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">Registry ID (OSID)</Typography>
                            <TextField source="osid" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">Created At</Typography>
                            <DateField source="osCreatedAt" showTime />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </SimpleShowLayout>
    </Show>
);

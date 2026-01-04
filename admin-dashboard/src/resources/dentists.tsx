import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    EmailField,
    DateField,
    Edit,
    Create,
    SimpleForm,
    TextInput,
    SelectInput,
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
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';

// Status choices
const statusChoices = [
    { id: 'Active', name: 'Active' },
    { id: 'Inactive', name: 'Inactive' },
    { id: 'Suspended', name: 'Suspended' },
    { id: 'Pending', name: 'Pending Verification' },
];

// Specialization choices
const specializationChoices = [
    { id: 'General Dentistry', name: 'General Dentistry' },
    { id: 'Orthodontics', name: 'Orthodontics' },
    { id: 'Periodontics', name: 'Periodontics' },
    { id: 'Endodontics', name: 'Endodontics' },
    { id: 'Prosthodontics', name: 'Prosthodontics' },
    { id: 'Oral Surgery', name: 'Oral Surgery' },
    { id: 'Pediatric Dentistry', name: 'Pediatric Dentistry' },
    { id: 'Cosmetic Dentistry', name: 'Cosmetic Dentistry' },
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

// Filter component
const DentistFilter = (props: any) => (
    <Filter {...props}>
        <SearchInput source="q" alwaysOn placeholder="Search dentists..." />
        <SelectInput source="status" choices={statusChoices} alwaysOn />
        <SelectInput source="specialization" choices={specializationChoices} />
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
export const DentistList = () => (
    <List filters={<DentistFilter />} actions={<ListActions />} sort={{ field: 'fullName', order: 'ASC' }} perPage={25}>
        <Datagrid rowClick="show" bulkActionButtons={false}>
            <TextField source="fullName" label="Full Name" />
            <TextField source="dentalSyndicateNumber" label="Syndicate Number" />
            <TextField source="specialization" label="Specialization" />
            <EmailField source="email" label="Email" />
            <TextField source="mobile" label="Mobile" />
            <StatusField />
            <EditButton />
            <ShowButton />
            <DeleteButton mutationMode="pessimistic" />
        </Datagrid>
    </List>
);

// Create Component
export const DentistCreate = () => (
    <Create title="Register New Dentist">
        <SimpleForm toolbar={<CustomToolbar />}>
            <Typography variant="h6" gutterBottom>Personal Information</Typography>
            <Box display="flex" flexDirection="column" gap={2} width="100%">
                <Box display="flex" gap={2}>
                    <TextInput source="fullName" label="Full Name" validate={required()} fullWidth />
                    <TextInput source="nationalId" label="National ID" validate={required()} fullWidth />
                </Box>
                <Box display="flex" gap={2}>
                    <TextInput source="email" label="Email Address" validate={[required(), email()]} fullWidth />
                    <TextInput source="mobile" label="Mobile Number" fullWidth />
                </Box>
            </Box>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Professional Information</Typography>
            <Box display="flex" flexDirection="column" gap={2} width="100%">
                <Box display="flex" gap={2}>
                    <TextInput source="dentalSyndicateNumber" label="Dental Syndicate Number" validate={required()} fullWidth />
                    <SelectInput source="specialization" label="Specialization" choices={specializationChoices} fullWidth />
                </Box>
                <Box display="flex" gap={2}>
                    <TextInput source="qualification" label="Qualification" fullWidth />
                    <TextInput source="yearsOfExperience" label="Years of Experience" fullWidth />
                </Box>
                <Box display="flex" gap={2}>
                    <SelectInput source="status" label="Status" choices={statusChoices} defaultValue="Pending" fullWidth />
                    <TextInput source="clinicName" label="Clinic Name" fullWidth />
                </Box>
                <TextInput source="clinicAddress" label="Clinic Address" fullWidth multiline />
            </Box>
        </SimpleForm>
    </Create>
);

// Edit Component
export const DentistEdit = () => (
    <Edit title="Edit Dentist">
        <SimpleForm toolbar={<CustomToolbar />}>
            <Typography variant="h6" gutterBottom>Personal Information</Typography>
            <Box display="flex" flexDirection="column" gap={2} width="100%">
                <Box display="flex" gap={2}>
                    <TextInput source="fullName" label="Full Name" validate={required()} fullWidth />
                    <TextInput source="nationalId" label="National ID" validate={required()} fullWidth />
                </Box>
                <Box display="flex" gap={2}>
                    <TextInput source="email" label="Email Address" validate={[required(), email()]} fullWidth />
                    <TextInput source="mobile" label="Mobile Number" fullWidth />
                </Box>
            </Box>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Professional Information</Typography>
            <Box display="flex" flexDirection="column" gap={2} width="100%">
                <Box display="flex" gap={2}>
                    <TextInput source="dentalSyndicateNumber" label="Dental Syndicate Number" validate={required()} fullWidth />
                    <SelectInput source="specialization" label="Specialization" choices={specializationChoices} fullWidth />
                </Box>
                <Box display="flex" gap={2}>
                    <TextInput source="qualification" label="Qualification" fullWidth />
                    <TextInput source="yearsOfExperience" label="Years of Experience" fullWidth />
                </Box>
                <Box display="flex" gap={2}>
                    <SelectInput source="status" label="Status" choices={statusChoices} fullWidth />
                    <TextInput source="clinicName" label="Clinic Name" fullWidth />
                </Box>
                <TextInput source="clinicAddress" label="Clinic Address" fullWidth multiline />
            </Box>
        </SimpleForm>
    </Edit>
);

// Show Component
export const DentistShow = () => (
    <Show title="Dentist Details">
        <SimpleShowLayout>
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid size={12}>
                            <Typography variant="h5" gutterBottom>
                                <MedicalInformationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Personal Information
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">Full Name</Typography>
                            <TextField source="fullName" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">National ID</Typography>
                            <TextField source="nationalId" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                            <EmailField source="email" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">Mobile</Typography>
                            <TextField source="mobile" />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid size={12}>
                            <Typography variant="h5" gutterBottom>Professional Information</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">Syndicate Number</Typography>
                            <TextField source="dentalSyndicateNumber" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">Specialization</Typography>
                            <TextField source="specialization" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">Qualification</Typography>
                            <TextField source="qualification" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">Years of Experience</Typography>
                            <TextField source="yearsOfExperience" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                            <StatusField />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">Clinic Name</Typography>
                            <TextField source="clinicName" />
                        </Grid>
                        <Grid size={12}>
                            <Typography variant="subtitle2" color="textSecondary">Clinic Address</Typography>
                            <TextField source="clinicAddress" />
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

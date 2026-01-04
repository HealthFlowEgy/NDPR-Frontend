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
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

// Status choices
const statusChoices = [
    { id: 'Active', name: 'Active' },
    { id: 'Inactive', name: 'Inactive' },
    { id: 'Suspended', name: 'Suspended' },
    { id: 'Pending', name: 'Pending Verification' },
];

// Specialization choices
const specializationChoices = [
    { id: 'Cardiology', name: 'Cardiology' },
    { id: 'Dermatology', name: 'Dermatology' },
    { id: 'Endocrinology', name: 'Endocrinology' },
    { id: 'Gastroenterology', name: 'Gastroenterology' },
    { id: 'General Practice', name: 'General Practice' },
    { id: 'Gynecology', name: 'Gynecology' },
    { id: 'Hematology', name: 'Hematology' },
    { id: 'Internal Medicine', name: 'Internal Medicine' },
    { id: 'Nephrology', name: 'Nephrology' },
    { id: 'Neurology', name: 'Neurology' },
    { id: 'Oncology', name: 'Oncology' },
    { id: 'Ophthalmology', name: 'Ophthalmology' },
    { id: 'Orthopedics', name: 'Orthopedics' },
    { id: 'Pediatrics', name: 'Pediatrics' },
    { id: 'Psychiatry', name: 'Psychiatry' },
    { id: 'Pulmonology', name: 'Pulmonology' },
    { id: 'Radiology', name: 'Radiology' },
    { id: 'Rheumatology', name: 'Rheumatology' },
    { id: 'Surgery', name: 'Surgery' },
    { id: 'Urology', name: 'Urology' },
];

// Custom status field with color coding
const StatusField = () => {
    const record = useRecordContext();
    if (!record) return null;
    
    const statusColors: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
        'Active': 'success',
        'Inactive': 'default',
        'Suspended': 'error',
        'Pending': 'warning',
    };
    
    return (
        <Chip 
            label={record.status || 'Unknown'} 
            color={statusColors[record.status] || 'default'}
            size="small"
        />
    );
};

// Filter component
const DoctorFilter = (props: any) => (
    <Filter {...props}>
        <SearchInput source="q" alwaysOn placeholder="Search doctors..." />
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

// Custom Toolbar for forms
const CustomToolbar = () => (
    <Toolbar>
        <SaveButton />
    </Toolbar>
);

// List Component
export const DoctorList = () => (
    <List 
        filters={<DoctorFilter />}
        actions={<ListActions />}
        sort={{ field: 'fullName', order: 'ASC' }}
        perPage={25}
    >
        <Datagrid rowClick="show" bulkActionButtons={false}>
            <TextField source="fullName" label="Full Name" />
            <TextField source="syndicateNumber" label="Syndicate Number" />
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
export const DoctorCreate = () => (
    <Create title="Register New Doctor">
        <SimpleForm toolbar={<CustomToolbar />}>
            <Typography variant="h6" gutterBottom>
                Personal Information
            </Typography>
            <Box display="flex" flexDirection="column" gap={2} width="100%">
                <Box display="flex" gap={2}>
                    <TextInput 
                        source="fullName" 
                        label="Full Name" 
                        validate={required()} 
                        fullWidth 
                    />
                    <TextInput 
                        source="nationalId" 
                        label="National ID" 
                        validate={required()} 
                        fullWidth 
                    />
                </Box>
                <Box display="flex" gap={2}>
                    <TextInput 
                        source="email" 
                        label="Email Address" 
                        validate={[required(), email()]} 
                        fullWidth 
                    />
                    <TextInput 
                        source="mobile" 
                        label="Mobile Number" 
                        fullWidth 
                    />
                </Box>
            </Box>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Professional Information
            </Typography>
            <Box display="flex" flexDirection="column" gap={2} width="100%">
                <Box display="flex" gap={2}>
                    <TextInput 
                        source="syndicateNumber" 
                        label="Syndicate Number" 
                        validate={required()} 
                        fullWidth 
                    />
                    <SelectInput 
                        source="specialization" 
                        label="Specialization" 
                        choices={specializationChoices} 
                        validate={required()} 
                        fullWidth 
                    />
                </Box>
                <Box display="flex" gap={2}>
                    <TextInput 
                        source="qualification" 
                        label="Qualification" 
                        fullWidth 
                    />
                    <TextInput 
                        source="yearsOfExperience" 
                        label="Years of Experience" 
                        fullWidth 
                    />
                </Box>
                <Box display="flex" gap={2}>
                    <SelectInput 
                        source="status" 
                        label="Status" 
                        choices={statusChoices} 
                        defaultValue="Pending"
                        fullWidth 
                    />
                    <TextInput 
                        source="workAddress" 
                        label="Work Address" 
                        fullWidth 
                    />
                </Box>
            </Box>
        </SimpleForm>
    </Create>
);

// Edit Component
export const DoctorEdit = () => (
    <Edit title="Edit Doctor">
        <SimpleForm toolbar={<CustomToolbar />}>
            <Typography variant="h6" gutterBottom>
                Personal Information
            </Typography>
            <Box display="flex" flexDirection="column" gap={2} width="100%">
                <Box display="flex" gap={2}>
                    <TextInput 
                        source="fullName" 
                        label="Full Name" 
                        validate={required()} 
                        fullWidth 
                    />
                    <TextInput 
                        source="nationalId" 
                        label="National ID" 
                        validate={required()} 
                        fullWidth 
                    />
                </Box>
                <Box display="flex" gap={2}>
                    <TextInput 
                        source="email" 
                        label="Email Address" 
                        validate={[required(), email()]} 
                        fullWidth 
                    />
                    <TextInput 
                        source="mobile" 
                        label="Mobile Number" 
                        fullWidth 
                    />
                </Box>
            </Box>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Professional Information
            </Typography>
            <Box display="flex" flexDirection="column" gap={2} width="100%">
                <Box display="flex" gap={2}>
                    <TextInput 
                        source="syndicateNumber" 
                        label="Syndicate Number" 
                        validate={required()} 
                        fullWidth 
                    />
                    <SelectInput 
                        source="specialization" 
                        label="Specialization" 
                        choices={specializationChoices} 
                        validate={required()} 
                        fullWidth 
                    />
                </Box>
                <Box display="flex" gap={2}>
                    <TextInput 
                        source="qualification" 
                        label="Qualification" 
                        fullWidth 
                    />
                    <TextInput 
                        source="yearsOfExperience" 
                        label="Years of Experience" 
                        fullWidth 
                    />
                </Box>
                <Box display="flex" gap={2}>
                    <SelectInput 
                        source="status" 
                        label="Status" 
                        choices={statusChoices} 
                        fullWidth 
                    />
                    <TextInput 
                        source="workAddress" 
                        label="Work Address" 
                        fullWidth 
                    />
                </Box>
            </Box>
        </SimpleForm>
    </Edit>
);

// Show Component
export const DoctorShow = () => (
    <Show title="Doctor Details">
        <SimpleShowLayout>
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid size={12}>
                            <Typography variant="h5" gutterBottom>
                                <LocalHospitalIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
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
                            <Typography variant="h5" gutterBottom>
                                Professional Information
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">Syndicate Number</Typography>
                            <TextField source="syndicateNumber" />
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
                            <Typography variant="subtitle2" color="textSecondary">Work Address</Typography>
                            <TextField source="workAddress" />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            
            <Card>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid size={12}>
                            <Typography variant="h5" gutterBottom>
                                Registry Information
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">Registry ID (OS
ID)</Typography>
                            <TextField source="osid" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">Created At</Typography>
                            <DateField source="osCreatedAt" showTime />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary">Updated At</Typography>
                            <DateField source="osUpdatedAt" showTime />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </SimpleShowLayout>
    </Show>
);

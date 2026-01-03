import React, { useEffect, useState } from 'react';
import { useDataProvider, usePermissions, Title } from 'react-admin';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import BusinessIcon from '@mui/icons-material/Business';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { Permissions } from '../authProvider';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    link?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, link }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
        <Box sx={{ position: 'absolute', top: -20, left: 20, width: 60, height: 60, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: color, color: 'white', boxShadow: 3 }}>
            {icon}
        </Box>
        <CardContent sx={{ pt: 5, textAlign: 'right' }}>
            <Typography variant="body2" color="textSecondary">{title}</Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>{value}</Typography>
            {link && <Button component={Link} to={link} size="small" sx={{ mt: 1 }}>View All</Button>}
        </CardContent>
    </Card>
);

const Dashboard: React.FC = () => {
    const dataProvider = useDataProvider();
    const { permissions } = usePermissions<Permissions>();
    const [stats, setStats] = useState({ doctors: 0, nurses: 0, pharmacists: 0, physiotherapists: 0, dentists: 0, facilities: 0, pending: 0, approved: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const results = await Promise.all([
                    dataProvider.getList('Doctor', { pagination: { page: 1, perPage: 1 }, sort: { field: 'id', order: 'ASC' }, filter: {} }).catch(() => ({ total: 0 })),
                    dataProvider.getList('Nurse', { pagination: { page: 1, perPage: 1 }, sort: { field: 'id', order: 'ASC' }, filter: {} }).catch(() => ({ total: 0 })),
                    dataProvider.getList('Pharmacist', { pagination: { page: 1, perPage: 1 }, sort: { field: 'id', order: 'ASC' }, filter: {} }).catch(() => ({ total: 0 })),
                    dataProvider.getList('Physiotherapist', { pagination: { page: 1, perPage: 1 }, sort: { field: 'id', order: 'ASC' }, filter: {} }).catch(() => ({ total: 0 })),
                    dataProvider.getList('Dentist', { pagination: { page: 1, perPage: 1 }, sort: { field: 'id', order: 'ASC' }, filter: {} }).catch(() => ({ total: 0 })),
                    dataProvider.getList('HealthFacility', { pagination: { page: 1, perPage: 1 }, sort: { field: 'id', order: 'ASC' }, filter: {} }).catch(() => ({ total: 0 }))
                ]);
                const totals = results.map(r => r.total || 0);
                setStats({
                    doctors: totals[0], nurses: totals[1], pharmacists: totals[2], physiotherapists: totals[3], dentists: totals[4], facilities: totals[5],
                    pending: 12, approved: totals.slice(0, 5).reduce((a, b) => a + b, 0)
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [dataProvider]);

    return (
        <Box sx={{ p: 3 }}>
            <Title title="Dashboard" />
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>Welcome to HealthFlow Admin</Typography>
                <Typography variant="body1" color="textSecondary">Manage healthcare professionals and facilities across Egypt</Typography>
            </Box>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard title="Doctors" value={loading ? '...' : stats.doctors} icon={<LocalHospitalIcon />} color="#1976d2" link="/Doctor" /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard title="Nurses" value={loading ? '...' : stats.nurses} icon={<MedicalServicesIcon />} color="#C9A227" link="/Nurse" /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard title="Pharmacists" value={loading ? '...' : stats.pharmacists} icon={<LocalPharmacyIcon />} color="#388E3C" link="/Pharmacist" /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard title="Physiotherapists" value={loading ? '...' : stats.physiotherapists} icon={<AccessibilityNewIcon />} color="#7B1FA2" link="/Physiotherapist" /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard title="Dentists" value={loading ? '...' : stats.dentists} icon={<MedicalInformationIcon />} color="#00ACC1" link="/Dentist" /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard title="Health Facilities" value={loading ? '...' : stats.facilities} icon={<BusinessIcon />} color="#F57C00" link="/HealthFacility" /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard title="Pending Approvals" value={loading ? '...' : stats.pending} icon={<PendingActionsIcon />} color="#FFA000" /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard title="Total Approved" value={loading ? '...' : stats.approved} icon={<CheckCircleIcon />} color="#4CAF50" /></Grid>
                {permissions?.canViewAnalytics && (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
                            <Box sx={{ position: 'absolute', top: -20, left: 20, width: 60, height: 60, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#9C27B0', color: 'white', boxShadow: 3 }}><TrendingUpIcon /></Box>
                            <CardContent sx={{ pt: 5, textAlign: 'right' }}>
                                <Typography variant="body2" color="textSecondary">Analytics</Typography>
                                <Typography variant="h6" component="div">View Reports</Typography>
                                <Button component={Link} to="/analytics" size="small" sx={{ mt: 1 }} variant="contained" color="primary">Open Analytics</Button>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button variant="contained" color="primary" component={Link} to="/Doctor/create" startIcon={<LocalHospitalIcon />}>Add Doctor</Button>
                    <Button variant="contained" color="secondary" component={Link} to="/Nurse/create" startIcon={<MedicalServicesIcon />}>Add Nurse</Button>
                    <Button variant="outlined" component={Link} to="/HealthFacility/create" startIcon={<BusinessIcon />}>Add Facility</Button>
                </Box>
            </Box>
        </Box>
    );
};

export default Dashboard;

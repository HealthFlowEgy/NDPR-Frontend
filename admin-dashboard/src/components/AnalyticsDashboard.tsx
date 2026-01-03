import React, { useEffect, useState } from 'react';
import { useDataProvider, Title } from 'react-admin';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';

interface BarChartProps {
    data: { label: string; value: number; color: string }[];
    title: string;
}

const SimpleBarChart: React.FC<BarChartProps> = ({ data, title }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>{title}</Typography>
                <Box sx={{ mt: 2 }}>
                    {data.map((item, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2">{item.label}</Typography>
                                <Typography variant="body2" fontWeight="bold">{item.value}</Typography>
                            </Box>
                            <Box sx={{ height: 24, bgcolor: '#e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
                                <Box sx={{ height: '100%', width: `${(item.value / maxValue) * 100}%`, bgcolor: item.color, borderRadius: 1 }} />
                            </Box>
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
};

interface ActivityItem {
    id: string;
    type: string;
    name: string;
    action: string;
    date: string;
    status: 'approved' | 'pending' | 'rejected';
}

const RecentActivityTable: React.FC<{ activities: ActivityItem[] }> = ({ activities }) => (
    <Card>
        <CardContent>
            <Typography variant="h6" gutterBottom>Recent Activity</Typography>
            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Action</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {activities.map((activity) => (
                            <TableRow key={activity.id}>
                                <TableCell>{activity.type}</TableCell>
                                <TableCell>{activity.name}</TableCell>
                                <TableCell>{activity.action}</TableCell>
                                <TableCell>{activity.date}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={activity.status}
                                        size="small"
                                        color={activity.status === 'approved' ? 'success' : activity.status === 'pending' ? 'warning' : 'error'}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </CardContent>
    </Card>
);

const AnalyticsDashboard: React.FC = () => {
    const dataProvider = useDataProvider();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ doctors: 0, nurses: 0, pharmacists: 0, physiotherapists: 0, dentists: 0, facilities: 0 });

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
                setStats({
                    doctors: results[0].total || 0,
                    nurses: results[1].total || 0,
                    pharmacists: results[2].total || 0,
                    physiotherapists: results[3].total || 0,
                    dentists: results[4].total || 0,
                    facilities: results[5].total || 0
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [dataProvider]);

    const professionalData = [
        { label: 'Doctors', value: stats.doctors, color: '#1976d2' },
        { label: 'Nurses', value: stats.nurses, color: '#C9A227' },
        { label: 'Pharmacists', value: stats.pharmacists, color: '#388E3C' },
        { label: 'Physiotherapists', value: stats.physiotherapists, color: '#7B1FA2' },
        { label: 'Dentists', value: stats.dentists, color: '#00ACC1' }
    ];

    const recentActivities: ActivityItem[] = [
        { id: '1', type: 'Doctor', name: 'Dr. Ahmed Hassan', action: 'Registration', date: '2026-01-03', status: 'approved' },
        { id: '2', type: 'Nurse', name: 'Sarah Mohamed', action: 'Registration', date: '2026-01-03', status: 'pending' },
        { id: '3', type: 'Pharmacist', name: 'Omar Ali', action: 'License Renewal', date: '2026-01-02', status: 'approved' },
        { id: '4', type: 'Dentist', name: 'Dr. Fatma Ibrahim', action: 'Registration', date: '2026-01-02', status: 'pending' },
        { id: '5', type: 'Physiotherapist', name: 'Khaled Mahmoud', action: 'Registration', date: '2026-01-01', status: 'approved' }
    ];

    if (loading) {
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px"><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Title title="Analytics Dashboard" />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>Analytics Dashboard</Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>Overview of healthcare professional registrations</Typography>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <SimpleBarChart data={professionalData} title="Professionals by Type" />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Summary</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                {professionalData.map((item, i) => (
                                    <Box key={i} sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 2, minWidth: 100 }}>
                                        <Typography variant="h4" sx={{ color: item.color }}>{item.value}</Typography>
                                        <Typography variant="body2">{item.label}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={12}>
                    <RecentActivityTable activities={recentActivities} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default AnalyticsDashboard;

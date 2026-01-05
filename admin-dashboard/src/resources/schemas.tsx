import {
    List,
    Datagrid,
    TextField,
    DateField,
    Show,
    SimpleShowLayout,
    ShowButton,
    Filter,
    SearchInput,
    TextInput,
    useRecordContext,
    TopToolbar,
    ExportButton,
} from 'react-admin';
import { Box, Chip, Typography, Card, CardContent } from '@mui/material';
import SchemaIcon from '@mui/icons-material/Schema';
import CodeIcon from '@mui/icons-material/Code';

// Custom status field
const StatusField = () => {
    const record = useRecordContext();
    if (!record) return null;
    const statusColors: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
        'Active': 'success',
        'Draft': 'warning',
        'Deprecated': 'error',
    };
    return (
        <Chip
            label={record.status || 'Active'}
            color={statusColors[record.status] || 'default'}
            size="small"
        />
    );
};

// Filter component
const SchemaFilter = (props: any) => (
    <Filter {...props}>
        <SearchInput source="q" alwaysOn placeholder="Search schemas..." />
        <TextInput source="name" label="Schema Name" />
        <TextInput source="version" label="Version" />
    </Filter>
);

// List actions
const ListActions = () => (
    <TopToolbar>
        <ExportButton />
    </TopToolbar>
);

// Schema List
export const SchemaList = () => (
    <List
        filters={<SchemaFilter />}
        actions={<ListActions />}
        sort={{ field: 'authored', order: 'DESC' }}
        perPage={25}
    >
        <Datagrid rowClick="show">
            <TextField source="name" label="Schema Name" />
            <TextField source="version" label="Version" />
            <TextField source="author" label="Author" />
            <DateField source="authored" label="Created" />
            <StatusField />
            <ShowButton />
        </Datagrid>
    </List>
);

// Schema Show
export const SchemaShow = () => (
    <Show>
        <SimpleShowLayout>
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                        <SchemaIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                        <Box>
                            <Typography variant="h5">
                                <TextField source="name" />
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Version: <TextField source="version" />
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Schema Information
                            </Typography>
                            <Box mb={1}>
                                <Typography variant="caption" color="text.secondary">ID</Typography>
                                <Typography><TextField source="id" /></Typography>
                            </Box>
                            <Box mb={1}>
                                <Typography variant="caption" color="text.secondary">Author</Typography>
                                <Typography><TextField source="author" /></Typography>
                            </Box>
                            <Box mb={1}>
                                <Typography variant="caption" color="text.secondary">Authored Date</Typography>
                                <Typography><DateField source="authored" /></Typography>
                            </Box>
                            <Box mb={1}>
                                <Typography variant="caption" color="text.secondary">Status</Typography>
                                <Box><StatusField /></Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Schema Definition
                            </Typography>
                            <Box 
                                sx={{ 
                                    bgcolor: '#f5f5f5', 
                                    p: 2, 
                                    borderRadius: 1,
                                    fontFamily: 'monospace',
                                    fontSize: '12px',
                                    overflow: 'auto',
                                    maxHeight: '400px'
                                }}
                            >
                                <pre style={{ margin: 0 }}>
                                    <TextField source="schema" />
                                </pre>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </SimpleShowLayout>
    </Show>
);

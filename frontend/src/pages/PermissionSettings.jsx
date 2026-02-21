import React, { useEffect, useState } from 'react';
import { Box, Button, Switch, List, ListItem, ListItemText, ListItemSecondaryAction, Divider, Typography, Paper, Grid } from '@mui/material';
import { Security, Save, RestartAlt } from '@mui/icons-material';
import { getCashierPermissions, bulkUpdateCashierPermissions } from '../api/permissionsApi';
import { toast } from 'react-toastify';
import { PageHeader, DashboardCard, AnimatedContainer } from '../components';

const MODULE_LABELS = {
    DASHBOARD: 'Dashboard',
    PRODUCTS: 'Products',
    INVENTORY_CONVERT: 'Inventory Conversion',
    CREDIT_CUSTOMERS: 'Credit Customers',
    CHEQUES: 'Cheques',
    ORDERS: 'Orders',
    SALES: 'Sales History',
    SUPPLIERS: 'Suppliers',
    PURCHASE_ORDERS: 'Purchase Orders',
    TRASH: 'Trash / Recycle Bin',
    REPORTS: 'Reports & Analytics'
};

export default function PermissionSettings() {
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const fetchPermissions = async () => {
        setLoading(true);
        try {
            const { data } = await getCashierPermissions();
            // data is { role, permissions }
            setPermissions(data.permissions || {});
        } catch (error) {
            console.error(error);
            toast.error('Failed to load permissions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    const handleToggle = (moduleKey) => {
        setPermissions(prev => ({
            ...prev,
            [moduleKey]: !prev[moduleKey]
        }));
    };

    const handleSave = async () => {
        setSubmitting(true);
        try {
            await bulkUpdateCashierPermissions(permissions);
            toast.success('Cashier permissions updated successfully');
            // Update local cache if needed, though refresh is recommended
        } catch (error) {
            console.error(error);
            toast.error('Failed to update permissions');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        fetchPermissions();
        toast.info('Changes discarded');
    };

    return (
        <AnimatedContainer delay={0.1}>
            <PageHeader
                title="Access Control"
                subtitle="Manage module permissions for Cashier role"
                breadcrumbs={[{ label: 'Settings', path: '#' }, { label: 'Permissions', path: '/settings/permissions' }]}
                actions={
                    <Box display="flex" gap={1}>
                        <Button
                            variant="outlined"
                            startIcon={<RestartAlt />}
                            onClick={handleReset}
                            disabled={loading || submitting}
                        >
                            Reset
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Save />}
                            onClick={handleSave}
                            disabled={loading || submitting}
                        >
                            Save Changes
                        </Button>
                    </Box>
                }
            />

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <DashboardCard
                        title="Cashier Module Access"
                        subtitle="Toggle which parts of the system are accessible to cashiers"
                        icon={Security}
                    >
                        <List>
                            {Object.entries(MODULE_LABELS).map(([key, label], index) => (
                                <React.Fragment key={key}>
                                    <ListItem>
                                        <ListItemText
                                            primary={label}
                                            secondary={`Module Key: ${key}`}
                                        />
                                        <ListItemSecondaryAction>
                                            <Switch
                                                edge="end"
                                                onChange={() => handleToggle(key)}
                                                checked={!!permissions[key]}
                                                disabled={loading || submitting}
                                                color="primary"
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    {index < Object.entries(MODULE_LABELS).length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </DashboardCard>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Security Tip
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Restricting access to sensitive modules like Reports, Trash, and Suppliers helps maintain data integrity and prevents unauthorized information leakage.
                        </Typography>
                        <Box mt={2}>
                            <Typography variant="caption" sx={{ fontStyle: 'italic', opacity: 0.7 }}>
                                * Changes take effect for cashiers upon their next page refresh or login.
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </AnimatedContainer>
    );
}

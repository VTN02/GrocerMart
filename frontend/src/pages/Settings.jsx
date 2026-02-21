import React, { useState } from 'react';
import {
    Box, Typography, Button, TextField, Alert,
    Divider, Grid, Paper, alpha, useTheme
} from '@mui/material';
import { DeleteSweep, Warning, Security } from '@mui/icons-material';
import { AnimatedContainer, DashboardCard, ConfirmDialog } from '../components';
import { resetSystem } from '../api/admin';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [confirmText, setConfirmText] = useState('');
    const [openConfirm, setOpenConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (confirmText !== 'RESET') {
            toast.error("Please type 'RESET' exactly to confirm.");
            return;
        }

        setLoading(true);
        try {
            await resetSystem(confirmText);
            toast.success("System reset successfully. All data wiped except Admin.");
            setOpenConfirm(false);
            // Optionally redirect to login or reload
            setTimeout(() => {
                localStorage.clear();
                window.location.href = '/login';
            }, 2000);
        } catch (error) {
            console.error("Reset failed", error);
            toast.error(error.response?.data?.message || "System reset failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatedContainer>
            <Box mb={4}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    System Settings ⚙️
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Advanced administrative controls for GrocerSmart AI.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <DashboardCard
                        title="System Reset"
                        subtitle="DANGER ZONE: This will permanently erase all records."
                    >
                        {/* existing reset logic */}
                        <Alert
                            severity="error"
                            icon={<Warning />}
                            sx={{ mb: 3, borderRadius: 2 }}
                        >
                            Performing a system reset will delete all Orders, Sales, Products, Customers, Cheques, and Suppliers.
                            The default admin account "VTNV" will be preserved. <strong>This action cannot be undone.</strong>
                        </Alert>

                        <Box p={2} border={1} borderColor="error.light" borderRadius={2} bgcolor={alpha(theme.palette.error.main, 0.04)}>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom color="error.main">
                                Confirm System Wipe
                            </Typography>
                            <Typography variant="body2" mb={2}>
                                To prevent accidental resets, please type <b>RESET</b> in the box below to enable the button.
                            </Typography>

                            <Box display="flex" gap={2} alignItems="center">
                                <TextField
                                    size="small"
                                    placeholder="Type 'RESET' here"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    sx={{ bgcolor: 'background.paper' }}
                                />
                                <Button
                                    variant="contained"
                                    color="error"
                                    startIcon={<DeleteSweep />}
                                    disabled={confirmText !== 'RESET'}
                                    onClick={() => setOpenConfirm(true)}
                                >
                                    Factory Reset System
                                </Button>
                            </Box>
                        </Box>
                    </DashboardCard>
                </Grid>

                <Grid item xs={12} md={4}>
                    <DashboardCard title="Maintenance Info" sx={{ height: 'auto' }}>
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Box display="flex" gap={2} alignItems="flex-start">
                                <Security color="primary" />
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={600}>Admin Preservation</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        The VTNV account is never deleted during a reset to ensure you don't lose access.
                                    </Typography>
                                </Box>
                            </Box>
                            <Divider />
                            <Box display="flex" gap={2} alignItems="flex-start">
                                <DeleteSweep color="warning" />
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={600}>Trash Cleanup</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        A system reset also empties the Recycle Bin permanently.
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </DashboardCard>
                </Grid>

                <Grid item xs={12} md={8}>
                    <DashboardCard
                        title="Staff Permissions"
                        subtitle="Granular access control for the Cashier role."
                        sx={{ height: 'auto' }}
                    >
                        <Box sx={{ py: 1 }}>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                Define which modules (Sales, Inventory, Reports, etc.) are visible and accessible to staff members using Cashier accounts.
                            </Typography>
                            <Box sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                                border: (theme) => `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={600}>Role: CASHIER</Typography>
                                    <Typography variant="caption" color="text.secondary">Default role for floor staff</Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/settings/permissions')}
                                    startIcon={<Security />}
                                    sx={{
                                        borderRadius: 2,
                                        px: 3,
                                        background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                                    }}
                                >
                                    Configure Access
                                </Button>
                            </Box>
                        </Box>
                    </DashboardCard>
                </Grid>
            </Grid>

            <ConfirmDialog
                open={openConfirm}
                onClose={() => setOpenConfirm(false)}
                onConfirm={handleReset}
                title="FINAL WARNING: Wipe System?"
                message="This will immediately and permanently delete ALL data in the system. Are you absolutely certain?"
                confirmText="Yes, Wipe Everything"
                loading={loading}
                severity="error"
            />
        </AnimatedContainer>
    );
}

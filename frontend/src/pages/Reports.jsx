import React, { useState } from 'react';
import { Grid, Typography, Button, TextField, MenuItem, Box, Stack, Divider } from '@mui/material';
import { PictureAsPdf, Assessment, ReceiptLong, Inventory, AccountBalanceWallet } from '@mui/icons-material';
import { PageHeader, DashboardCard, AnimatedContainer } from '../components';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import {
    getSalesReportPdf,
    getInventoryReportPdf,
    getChequeReportPdf,
    downloadBlob
} from '../api/reportsApi';

export default function Reports() {
    const [salesDates, setSalesDates] = useState({ from: format(new Date(), 'yyyy-MM-01'), to: format(new Date(), 'yyyy-MM-dd') });
    const [invStatus, setInvStatus] = useState('ACTIVE');
    const [chequeStatus, setChequeStatus] = useState('PENDING');
    const [loading, setLoading] = useState(false);

    const handleDownloadSales = async () => {
        setLoading(true);
        try {
            const { data } = await getSalesReportPdf(salesDates.from, salesDates.to);
            downloadBlob(data, `Sales_Report_${salesDates.from}_to_${salesDates.to}.pdf`);
            toast.success("Sales report downloaded");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate sales report");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInventory = async () => {
        setLoading(true);
        try {
            const { data } = await getInventoryReportPdf(invStatus === 'ALL' ? null : invStatus);
            downloadBlob(data, `Inventory_Report_${invStatus}.pdf`);
            toast.success("Inventory report downloaded");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate inventory report");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCheques = async () => {
        setLoading(true);
        try {
            const { data } = await getChequeReportPdf(chequeStatus === 'ALL' ? null : chequeStatus);
            downloadBlob(data, `Cheque_Report_${chequeStatus}.pdf`);
            toast.success("Cheque report downloaded");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate cheque report");
        } finally {
            setLoading(false);
        }
    };

    const reportCards = [
        {
            title: "Sales Analytics",
            subtitle: "Download comprehensive sales history with totals",
            icon: <Assessment color="primary" fontSize="large" />,
            action: handleDownloadSales,
            controls: (
                <Stack direction="row" spacing={2}>
                    <TextField
                        type="date"
                        label="From"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={salesDates.from}
                        onChange={(e) => setSalesDates({ ...salesDates, from: e.target.value })}
                    />
                    <TextField
                        type="date"
                        label="To"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={salesDates.to}
                        onChange={(e) => setSalesDates({ ...salesDates, to: e.target.value })}
                    />
                </Stack>
            )
        },
        {
            title: "Inventory Stock",
            subtitle: "Full listing of product stock and reorder levels",
            icon: <Inventory color="success" fontSize="large" />,
            action: handleDownloadInventory,
            controls: (
                <TextField
                    select
                    label="Stock Status"
                    size="small"
                    fullWidth
                    value={invStatus}
                    onChange={(e) => setInvStatus(e.target.value)}
                >
                    <MenuItem value="ACTIVE">Active Only</MenuItem>
                    <MenuItem value="DISCONTINUED">Archived Only</MenuItem>
                    <MenuItem value="ALL">All Products</MenuItem>
                </TextField>
            )
        },
        {
            title: "Cheque Lifecycle",
            subtitle: "Current status and due dates of all customer cheques",
            icon: <AccountBalanceWallet color="warning" fontSize="large" />,
            action: handleDownloadCheques,
            controls: (
                <TextField
                    select
                    label="Cheque Status"
                    size="small"
                    fullWidth
                    value={chequeStatus}
                    onChange={(e) => setChequeStatus(e.target.value)}
                >
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="CLEARED">Cleared</MenuItem>
                    <MenuItem value="BOUNCED">Bounced</MenuItem>
                    <MenuItem value="ALL">View All</MenuItem>
                </TextField>
            )
        }
    ];

    return (
        <AnimatedContainer delay={0.1}>
            <PageHeader
                title="Management Reports"
                subtitle="Generate and export system data for offline audit"
                breadcrumbs={[{ label: 'Reports', path: '/reports' }]}
            />

            <Grid container spacing={3}>
                {reportCards.map((report, index) => (
                    <Grid item xs={12} md={6} lg={4} key={index}>
                        <DashboardCard
                            title={report.title}
                            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        >
                            <Box display="flex" alignItems="center" mb={2} gap={2}>
                                {report.icon}
                                <Typography variant="body2" color="text.secondary">
                                    {report.subtitle}
                                </Typography>
                            </Box>

                            <Box sx={{ flexGrow: 1, mb: 3 }}>
                                {report.controls}
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<PictureAsPdf />}
                                onClick={report.action}
                                disabled={loading}
                            >
                                Generate PDF
                            </Button>
                        </DashboardCard>
                    </Grid>
                ))}
            </Grid>
        </AnimatedContainer>
    );
}

import React, { useState, useMemo } from 'react';
import { Box, Button, TextField, IconButton, Tooltip, Grid, Typography, Paper, ToggleButtonGroup, ToggleButton, Divider, Stack, InputAdornment, MenuItem } from '@mui/material';
import { Add, Edit, Delete, Payment, Visibility, VisibilityOff, PictureAsPdf, Search, CleaningServices } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, addPayment, getCreditCustomersSummary } from '../api/creditCustomersApi';
import { toast } from 'react-toastify';
import { PageHeader, DataTable, FormDialog, ConfirmDialog, StatusChip, DashboardCard, AnimatedContainer, CreditCustomerDetailsDialog, KpiCard } from '../components';
import { AccountBalance, AttachMoney, TrendingUp } from '@mui/icons-material';
import { getCustomerLedgerPdf, getCustomerProfilePdf, getCreditCustomerReportPdf, downloadBlob } from '../api/reportsApi';

const initialFormData = {
    name: '',
    phone: '',
    address: '',
    creditLimit: '',
    paymentTermsDays: 30,
    authorizedThreshold: 0,
    customerType: 'CREDIT'
};

const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(Number(val || 0));
};

export default function CreditCustomers() {
    const queryClient = useQueryClient();

    // Table & Filter State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ACTIVE');
    const [orderBy, setOrderBy] = useState('id');
    const [orderDirection, setOrderDirection] = useState('desc');

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const [paymentData, setPaymentData] = useState({ customerId: null, amount: 0, note: '', currentBalance: 0 });

    // Data Fetching
    const { data, isLoading } = useQuery({
        queryKey: ['creditCustomers', page, rowsPerPage, search, statusFilter, orderBy, orderDirection],
        queryFn: async () => {
            const params = {
                page,
                size: rowsPerPage,
                search: search || undefined,
                status: statusFilter === 'ALL' ? undefined : statusFilter,
                sort: `${orderBy},${orderDirection}`
            };
            const response = await getCustomers(params);
            return response.data || response;
        },
        keepPreviousData: true
    });

    const { data: summaryData, isLoading: summaryLoading } = useQuery({
        queryKey: ['creditCustomers', 'summary'],
        queryFn: async () => {
            const res = await getCreditCustomersSummary();
            return res.data || res;
        }
    });

    const customers = data?.content || [];
    const totalCount = data?.totalElements || 0;

    // Mutations
    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries(['creditCustomers']);
            handleCloseDialog();
            setPaymentDialogOpen(false);
            setDeleteDialogOpen(false);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const createMutation = useMutation({ mutationFn: createCustomer, ...mutationOptions, onSuccess: () => { toast.success('Customer created'); mutationOptions.onSuccess(); } });
    const updateMutation = useMutation({ mutationFn: (data) => updateCustomer(editId || data.id, data), ...mutationOptions, onSuccess: () => { toast.success('Customer updated'); mutationOptions.onSuccess(); } });
    const deleteMutation = useMutation({ mutationFn: deleteCustomer, ...mutationOptions, onSuccess: () => { toast.success('Customer deleted'); mutationOptions.onSuccess(); } });
    const paymentMutation = useMutation({
        mutationFn: (data) => addPayment(data.customerId, { amount: data.amount, note: data.note }),
        ...mutationOptions,
        onSuccess: () => { toast.success('Payment recorded'); mutationOptions.onSuccess(); }
    });

    // Handlers
    const handleOpenDialog = (customer = null) => {
        if (customer) {
            setEditId(customer.id);
            setFormData({
                name: customer.name,
                phone: customer.phone,
                address: customer.address,
                creditLimit: customer.creditLimit,
                paymentTermsDays: customer.paymentTermsDays || 30,
                authorizedThreshold: customer.authorizedThreshold || 0,
                customerType: customer.customerType || 'CREDIT'
            });
        } else {
            setEditId(null);
            setFormData(initialFormData);
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditId(null);
        setFormData(initialFormData);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editId) updateMutation.mutate(formData);
        else createMutation.mutate(formData);
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        paymentMutation.mutate(paymentData);
    };

    const handleSort = (property) => {
        const isAsc = orderBy === property && orderDirection === 'asc';
        setOrderDirection(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleExportAll = async () => {
        try {
            const res = await getCreditCustomerReportPdf();
            downloadBlob(res.data, `Credit_Customers_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success("Report downloaded");
        } catch (e) { toast.error("Export failed"); }
    };

    const handleDownloadLedger = async (customer) => {
        try {
            const res = await getCustomerLedgerPdf(customer.id);
            downloadBlob(res.data, `Ledger_${customer.name}.pdf`);
            toast.success("Ledger downloaded");
        } catch (e) { toast.error("Download failed"); }
    };

    const handleDownloadProfile = async (customer) => {
        try {
            const res = await getCustomerProfilePdf(customer.id);
            downloadBlob(res.data, `Profile_${customer.name}.pdf`);
            toast.success("Profile downloaded");
        } catch (e) { toast.error("Download failed"); }
    };

    const columns = useMemo(() => [
        { id: 'publicId', label: 'ID', minWidth: 90, sortable: true },
        { id: 'name', label: 'Customer Name', minWidth: 150, sortable: true },
        { id: 'phone', label: 'Phone', minWidth: 120, sortable: true },
        {
            id: 'creditLimit', label: 'Limit', minWidth: 120, align: 'right', sortable: true,
            render: (val) => formatCurrency(val)
        },
        {
            id: 'outstandingBalance', label: 'Outstanding', minWidth: 150, align: 'right', sortable: true,
            render: (val) => (
                <Typography fontWeight={600} color={Number(val) > 0 ? 'error.main' : 'success.main'}>
                    {formatCurrency(val)}
                </Typography>
            )
        },
        {
            id: 'availableCredit', label: 'Available', minWidth: 150, align: 'right', sortable: false,
            render: (_, row) => {
                const available = Math.max(0, Number(row.creditLimit || 0) - Number(row.outstandingBalance || 0));
                return <Typography fontWeight={600} color={available <= 0 ? 'error.main' : 'success.main'}>{formatCurrency(available)}</Typography>;
            }
        },
        { id: 'status', label: 'Status', minWidth: 100, sortable: true, render: (val) => <StatusChip status={val} /> }
    ], []);

    return (
        <AnimatedContainer>
            <PageHeader
                title="Credit Customers" subtitle="Manage customer credit accounts and payments"
                breadcrumbs={[{ label: 'Credit Customers', path: '/credit-customers' }]}
                actions={
                    <Stack direction="row" spacing={1}>
                        <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={handleExportAll}>Export All</Button>
                        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add Customer</Button>
                    </Stack>
                }
            />

            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={4}><KpiCard title="Total Credit Limit" value={formatCurrency(summaryData?.totalLimit)} icon={AccountBalance} color="primary" loading={summaryLoading} /></Grid>
                <Grid item xs={12} sm={4}><KpiCard title="Total Outstanding" value={formatCurrency(summaryData?.totalOutstanding)} icon={AttachMoney} color="error" loading={summaryLoading} /></Grid>
                <Grid item xs={12} sm={4}><KpiCard title="Available Credit" value={formatCurrency(summaryData?.totalAvailable)} icon={TrendingUp} color="success" loading={summaryLoading} /></Grid>
            </Grid>

            <DashboardCard title="Credit Accounts">
                <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
                    <TextField
                        size="small" label="Search" placeholder="Name, Phone, ID" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        sx={{ minWidth: 250 }} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                    />
                    <Stack direction="row" spacing={2} alignItems="center">
                        <ToggleButtonGroup value={statusFilter} exclusive onChange={(e, v) => v && setStatusFilter(v)} size="small" color="primary">
                            <ToggleButton value="ACTIVE">Active</ToggleButton>
                            <ToggleButton value="INACTIVE">Inactive</ToggleButton>
                            <ToggleButton value="ALL">All</ToggleButton>
                        </ToggleButtonGroup>
                        <Button startIcon={<CleaningServices />} onClick={() => { setSearch(''); setStatusFilter('ACTIVE'); setPage(0); }}>Clear</Button>
                    </Stack>
                </Box>

                <DataTable
                    serverSide columns={columns} data={customers} loading={isLoading}
                    totalCount={totalCount} page={page} rowsPerPage={rowsPerPage}
                    onPageChange={setPage} onRowsPerPageChange={setRowsPerPage}
                    orderBy={orderBy} orderDirection={orderDirection} onSortChange={handleSort}
                    actions={(row) => (
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="View Details">
                                <IconButton size="small" color="info" onClick={() => { setSelectedCustomer(row); setDetailsOpen(true); }}>
                                    <Visibility fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                                <IconButton size="small" color="primary" onClick={() => handleOpenDialog(row)}>
                                    <Edit fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Payment">
                                <IconButton size="small" color="success" onClick={() => { setPaymentData({ customerId: row.id, amount: 0, note: '', currentBalance: Number(row.outstandingBalance || 0) }); setPaymentDialogOpen(true); }}>
                                    <Payment fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={row.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}>
                                <IconButton size="small" color={row.status === 'ACTIVE' ? 'warning' : 'info'} onClick={() => updateMutation.mutate({ ...row, status: row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}>
                                    {row.status === 'ACTIVE' ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                                <IconButton size="small" color="error" onClick={() => { setDeleteId(row.id); setDeleteDialogOpen(true); }}>
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    )}
                />
            </DashboardCard>

            <FormDialog open={dialogOpen} onClose={handleCloseDialog} onSubmit={handleSubmit} title={editId ? 'Edit Customer' : 'Add New Customer'} loading={createMutation.isLoading || updateMutation.isLoading} maxWidth="sm">
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}><TextField fullWidth label="Customer Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required autoFocus /></Grid>
                    <Grid item xs={12} md={6}><TextField fullWidth label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} multiline rows={2} /></Grid>
                    <Grid item xs={12} md={6}><TextField fullWidth type="number" label="Credit Limit (₹)" value={formData.creditLimit} onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })} required inputProps={{ min: 0, step: 0.01 }} /></Grid>
                    <Grid item xs={12} md={6}><TextField fullWidth type="number" label="Payment Terms (Days)" value={formData.paymentTermsDays} onChange={(e) => setFormData({ ...formData, paymentTermsDays: parseInt(e.target.value) || 0 })} required /></Grid>
                    <Grid item xs={12} md={6}>
                        <TextField select fullWidth label="Customer Type" value={formData.customerType} onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}>
                            <MenuItem value="CREDIT">Credit Customer</MenuItem>
                            <MenuItem value="CASH">Cash Customer</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </FormDialog>

            <FormDialog
                open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} onSubmit={handlePaymentSubmit}
                title="Add Payment" subtitle="Record a payment from customer" loading={paymentMutation.isLoading}
                submitDisabled={paymentData.amount <= 0 || paymentData.amount > paymentData.currentBalance} submitText="Record Payment" maxWidth="xs"
            >
                <Stack spacing={3}>
                    <TextField fullWidth type="number" label="Amount (₹)" value={paymentData.amount || ''} onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })} required autoFocus helperText={`Max: ${formatCurrency(paymentData.currentBalance)}`} />
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
                        <Box display="flex" justifyContent="space-between" mb={1}><Typography variant="body2">Current Debt:</Typography><Typography variant="body2" fontWeight={600}>{formatCurrency(paymentData.currentBalance)}</Typography></Box>
                        <Box display="flex" justifyContent="space-between" mb={1} color="success.main"><Typography variant="body2">Payment:</Typography><Typography variant="body2" fontWeight={600}>- {formatCurrency(paymentData.amount)}</Typography></Box>
                        <Divider sx={{ my: 1 }} />
                        <Box display="flex" justifyContent="space-between"><Typography variant="subtitle2">New Debt:</Typography><Typography variant="subtitle2" fontWeight={700} color="info.main">{formatCurrency(Math.max(0, paymentData.currentBalance - paymentData.amount))}</Typography></Box>
                    </Paper>
                    <TextField fullWidth label="Note (Optional)" value={paymentData.note} onChange={(e) => setPaymentData({ ...paymentData, note: e.target.value })} multiline rows={2} />
                </Stack>
            </FormDialog>

            <ConfirmDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={() => deleteMutation.mutate(deleteId)} title="Delete Customer" message="Are you sure you want to delete this customer? This action cannot be undone." severity="error" loading={deleteMutation.isLoading} />
            <CreditCustomerDetailsDialog
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                customer={selectedCustomer}
                onEdit={(row) => { setDetailsOpen(false); handleOpenDialog(row); }}
                onPay={(row) => {
                    setDetailsOpen(false);
                    setPaymentData({ customerId: row.id, amount: 0, note: '', currentBalance: Number(row.outstandingBalance || 0) });
                    setPaymentDialogOpen(true);
                }}
                onDelete={(id) => { setDetailsOpen(false); setDeleteId(id); setDeleteDialogOpen(true); }}
                onStatusToggle={(row) => updateMutation.mutate({ ...row, status: row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
            />
        </AnimatedContainer >
    );
}


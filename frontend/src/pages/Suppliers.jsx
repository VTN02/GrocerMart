import React, { useState, useMemo } from 'react';
import { Box, Button, TextField, IconButton, Tooltip, Grid, Stack, InputAdornment, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Add, Delete, Edit, Visibility, PictureAsPdf, Search, CleaningServices, LocalShipping, CheckCircle, Cancel } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, getSuppliersSummary } from '../api/suppliersApi';
import { getSupplierPurchaseHistoryPdf, getSupplierProfilePdf, getSupplierListReportPdf, downloadBlob } from '../api/reportsApi';
import { toast } from 'react-toastify';
import { PageHeader, DataTable, FormDialog, ConfirmDialog, StatusChip, DashboardCard, AnimatedContainer, GenericDetailsDialog, KpiCard } from '../components';

const initialFormData = {
    name: '',
    phone: '',
    address: '',
    email: '',
    status: 'ACTIVE'
};

export default function Suppliers() {
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
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState(initialFormData);

    // Data Fetching
    const { data, isLoading } = useQuery({
        queryKey: ['suppliers', page, rowsPerPage, search, statusFilter, orderBy, orderDirection],
        queryFn: async () => {
            const params = {
                page,
                size: rowsPerPage,
                search: search || undefined,
                status: statusFilter === 'ALL' ? undefined : statusFilter,
                sort: `${orderBy},${orderDirection}`
            };
            const response = await getSuppliers(params);
            return response.data || response;
        },
        keepPreviousData: true
    });

    const { data: summaryData, isLoading: summaryLoading } = useQuery({
        queryKey: ['suppliers', 'summary'],
        queryFn: async () => {
            const res = await getSuppliersSummary();
            return res.data || res;
        }
    });

    const suppliers = data?.content || [];
    const totalCount = data?.totalElements || 0;

    // Mutations
    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries(['suppliers']);
            setDialogOpen(false);
            setDeleteDialogOpen(false);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const createMutation = useMutation({ mutationFn: createSupplier, ...mutationOptions, onSuccess: () => { toast.success('Supplier created'); mutationOptions.onSuccess(); } });
    const updateMutation = useMutation({ mutationFn: (data) => updateSupplier(editId || data.id, data), ...mutationOptions, onSuccess: () => { toast.success('Supplier updated'); mutationOptions.onSuccess(); } });
    const deleteMutation = useMutation({ mutationFn: deleteSupplier, ...mutationOptions, onSuccess: () => { toast.success('Supplier deleted'); mutationOptions.onSuccess(); } });

    // Handlers
    const handleOpenDialog = (supplier = null) => {
        if (supplier) {
            setEditId(supplier.id);
            setFormData({
                name: supplier.name,
                phone: supplier.phone || '',
                address: supplier.address || '',
                email: supplier.email || '',
                status: supplier.status || 'ACTIVE'
            });
        } else {
            setEditId(null);
            setFormData(initialFormData);
        }
        setDialogOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editId) updateMutation.mutate(formData);
        else createMutation.mutate(formData);
    };

    const handleSort = (property) => {
        const isAsc = orderBy === property && orderDirection === 'asc';
        setOrderDirection(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleDownloadPurchaseHistory = async (supplier) => {
        try {
            const { data } = await getSupplierPurchaseHistoryPdf(supplier.id);
            downloadBlob(data, `Purchase_History_${supplier.name}.pdf`);
            toast.success("Report downloaded");
        } catch (e) { toast.error("Download failed"); }
    };

    const handleDownloadProfile = async (supplier) => {
        try {
            const { data } = await getSupplierProfilePdf(supplier.id);
            downloadBlob(data, `Profile_${supplier.name}.pdf`);
            toast.success("Profile downloaded");
        } catch (e) { toast.error("Download failed"); }
    };

    const handleExportAll = async () => {
        try {
            const { data } = await getSupplierListReportPdf();
            downloadBlob(data, `Suppliers_List.pdf`);
            toast.success("Report downloaded");
        } catch (e) { toast.error("Export failed"); }
    };

    const columns = useMemo(() => [
        { id: 'publicId', label: 'ID', minWidth: 90, sortable: true },
        { id: 'name', label: 'Supplier Name', minWidth: 180, sortable: true },
        { id: 'phone', label: 'Phone', minWidth: 120, sortable: true },
        { id: 'address', label: 'Address', minWidth: 200, sortable: true },
        { id: 'email', label: 'Email', minWidth: 150, sortable: true },
        { id: 'status', label: 'Status', minWidth: 100, sortable: true, render: (val) => <StatusChip status={val} /> }
    ], []);

    return (
        <AnimatedContainer>
            <PageHeader
                title="Suppliers" subtitle="Manage vendors and suppliers"
                breadcrumbs={[{ label: 'Suppliers', path: '/suppliers' }]}
                actions={
                    <Stack direction="row" spacing={1}>
                        <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={handleExportAll}>Export PDF</Button>
                        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add Supplier</Button>
                    </Stack>
                }
            />

            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={4}><KpiCard title="Total Suppliers" value={summaryData?.total || 0} icon={LocalShipping} color="primary" loading={summaryLoading} /></Grid>
                <Grid item xs={12} sm={4}><KpiCard title="Active Suppliers" value={summaryData?.active || 0} icon={CheckCircle} color="success" loading={summaryLoading} /></Grid>
                <Grid item xs={12} sm={4}><KpiCard title="Inactive Suppliers" value={summaryData?.inactive || 0} icon={Cancel} color="warning" loading={summaryLoading} /></Grid>
            </Grid>

            <DashboardCard title="Supplier List">
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
                    serverSide columns={columns} data={suppliers} loading={isLoading}
                    totalCount={totalCount} page={page} rowsPerPage={rowsPerPage}
                    onPageChange={setPage} onRowsPerPageChange={setRowsPerPage}
                    orderBy={orderBy} orderDirection={orderDirection} onSortChange={handleSort}
                    actions={(row) => (
                        <Stack direction="row" spacing={0.5}>
                            <Tooltip title="View"><IconButton size="small" color="info" onClick={() => { setSelectedSupplier(row); setDetailsOpen(true); }}><Visibility fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpenDialog(row)}><Edit fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Print Profile">
                                <IconButton size="small" color="primary" onClick={() => handleDownloadProfile(row)}>
                                    <PictureAsPdf fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Purchase History">
                                <IconButton size="small" color="secondary" onClick={() => handleDownloadPurchaseHistory(row)}>
                                    <LocalShipping fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { setDeleteId(row.id); setDeleteDialogOpen(true); }}><Delete fontSize="small" /></IconButton></Tooltip>
                        </Stack>
                    )}
                />
            </DashboardCard>

            <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={handleSubmit} title={editId ? "Edit Supplier" : "Add New Supplier"} loading={createMutation.isLoading || updateMutation.isLoading} maxWidth="sm">
                <Grid container spacing={2}>
                    <Grid item xs={12}><TextField fullWidth label="Supplier Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required autoFocus /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} multiline rows={2} /></Grid>
                    {editId && (
                        <Grid item xs={12}>
                            <TextField fullWidth select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} SelectProps={{ native: true }}>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </TextField>
                        </Grid>
                    )}
                </Grid>
            </FormDialog>

            <ConfirmDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={() => deleteMutation.mutate(deleteId)} title="Delete Supplier" message="Are you sure you want to delete this supplier? This action cannot be undone." severity="error" loading={deleteMutation.isLoading} />
            <GenericDetailsDialog open={detailsOpen} onClose={() => setDetailsOpen(false)} data={selectedSupplier} title="Supplier Details" />
        </AnimatedContainer>
    );
}

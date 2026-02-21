import React, { useState, useMemo } from 'react';
import { Box, Button, TextField, MenuItem, IconButton, Tooltip, Grid, Stack, InputAdornment, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material';
import { Add, Delete, Edit, AccountBalance, Visibility, PictureAsPdf, Search, CleaningServices, History, CheckCircle, ErrorOutline, Timer } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCheques, createCheque, updateCheque, updateChequeStatus, deleteCheque, getChequesSummary } from '../api/chequesApi';
import { getCreditCustomers } from '../api/creditCustomersApi';
import { getChequeReportPdf, downloadBlob } from '../api/reportsApi';
import { toast } from 'react-toastify';
import { PageHeader, DataTable, FormDialog, ConfirmDialog, DashboardCard, AnimatedContainer, GenericDetailsDialog, KpiCard } from '../components';

const initialFormData = {
    chequeNumber: '',
    customerId: '',
    bankName: '',
    amount: 0,
    issueDate: '',
    dueDate: '',
    status: 'PENDING',
    note: '',
};

export default function Cheques() {
    const queryClient = useQueryClient();

    // Table & Filter State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [orderBy, setOrderBy] = useState('id');
    const [orderDirection, setOrderDirection] = useState('desc');

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedCheque, setSelectedCheque] = useState(null);
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [statusData, setStatusData] = useState({ id: null, status: '', depositDate: '', clearedDate: '', bouncedDate: '', bounceReason: '' });

    // Data Fetching
    const { data: chequeData, isLoading } = useQuery({
        queryKey: ['cheques', page, rowsPerPage, search, statusFilter, orderBy, orderDirection],
        queryFn: async () => {
            const params = {
                page,
                size: rowsPerPage,
                search: search || undefined,
                status: statusFilter === 'ALL' ? undefined : statusFilter,
                sort: `${orderBy},${orderDirection}`
            };
            const res = await getCheques(params);
            return res.data || res;
        },
        keepPreviousData: true
    });

    const { data: customerData } = useQuery({
        queryKey: ['creditCustomers', 'active'],
        queryFn: async () => {
            const res = await getCreditCustomers({ status: 'ACTIVE', size: 1000 });
            const data = res.data || res;
            return Array.isArray(data) ? data : (data.content || []);
        }
    });

    const { data: summaryData, isLoading: summaryLoading } = useQuery({
        queryKey: ['cheques', 'summary'],
        queryFn: async () => {
            const res = await getChequesSummary();
            return res.data || res;
        }
    });

    const cheques = chequeData?.content || [];
    const totalCount = chequeData?.totalElements || 0;
    const customers = customerData || [];

    // Mutations
    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries(['cheques']);
            setDialogOpen(false);
            setDeleteDialogOpen(false);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const createMutation = useMutation({ mutationFn: createCheque, ...mutationOptions, onSuccess: () => { toast.success('Cheque added'); mutationOptions.onSuccess(); } });
    const updateMutation = useMutation({ mutationFn: (data) => updateCheque(editId || data.id, data), ...mutationOptions, onSuccess: () => { toast.success('Cheque updated'); mutationOptions.onSuccess(); } });
    const statusMutation = useMutation({
        mutationFn: ({ id, ...data }) => updateChequeStatus(id, data),
        ...mutationOptions,
        onSuccess: () => {
            toast.success('Status updated');
            setStatusDialogOpen(false);
            mutationOptions.onSuccess();
        }
    });
    const deleteMutation = useMutation({ mutationFn: deleteCheque, ...mutationOptions, onSuccess: () => { toast.success('Cheque deleted'); mutationOptions.onSuccess(); } });

    // Handlers
    const handleOpenDialog = (item = null) => {
        if (item) {
            setEditId(item.id);
            setFormData({ ...item, customerId: item.customerId || '' });
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

    const handleExportPDF = async () => {
        try {
            const { data } = await getChequeReportPdf(statusFilter === 'ALL' ? null : statusFilter);
            downloadBlob(data, `Cheque_Report_${statusFilter}.pdf`);
            toast.success("Report downloaded");
        } catch (e) { toast.error("Export failed"); }
    };

    const formatCurrency = (val) => {
        const num = Number(val);
        return Number.isFinite(num) ? `₹${num.toFixed(2)}` : '—';
    };

    const columns = useMemo(() => [
        { id: 'publicId', label: 'ID', minWidth: 90, sortable: true },
        { id: 'chequeNumber', label: 'Cheque No', minWidth: 120, sortable: true },
        {
            id: 'customerId', label: 'Customer', minWidth: 150, sortable: true,
            render: (val) => customerData?.find(c => c.id === val)?.name || `Customer #${val}`
        },
        { id: 'bankName', label: 'Bank Name', minWidth: 150, sortable: true },
        { id: 'amount', label: 'Amount', minWidth: 120, align: 'right', sortable: true, render: (val) => formatCurrency(val) },
        { id: 'issueDate', label: 'Issue Date', minWidth: 110, sortable: true },
        { id: 'dueDate', label: 'Due Date', minWidth: 110, sortable: true },
        {
            id: 'status', label: 'Status', minWidth: 150, sortable: true,
            render: (val, row) => (
                <Button
                    size="small" variant="outlined"
                    color={val === 'CLEARED' ? 'success' : val === 'BOUNCED' ? 'error' : 'warning'}
                    onClick={() => {
                        setStatusData({
                            id: row.id,
                            status: val,
                            depositDate: row.depositDate || new Date().toISOString().split('T')[0],
                            clearedDate: row.clearedDate || '',
                            bouncedDate: row.bouncedDate || '',
                            bounceReason: row.bounceReason || ''
                        });
                        setStatusDialogOpen(true);
                    }}
                >
                    {val}
                </Button>
            )
        }
    ], []);

    return (
        <AnimatedContainer>
            <PageHeader
                title="Cheques" subtitle="Post-dated cheque lifecycle management"
                breadcrumbs={[{ label: 'Cheques', path: '/cheques' }]}
                actions={
                    <Stack direction="row" spacing={1}>
                        <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={handleExportPDF}>Export PDF</Button>
                        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add Cheque</Button>
                    </Stack>
                }
            />

            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={3}><KpiCard title="Total Volume" value={formatCurrency(summaryData?.totalAmount || 0)} icon={AccountBalance} color="primary" loading={summaryLoading} /></Grid>
                <Grid item xs={12} sm={3}><KpiCard title="Pending" value={summaryData?.pending || 0} icon={Timer} color="warning" loading={summaryLoading} /></Grid>
                <Grid item xs={12} sm={3}><KpiCard title="Cleared" value={summaryData?.cleared || 0} icon={CheckCircle} color="success" loading={summaryLoading} /></Grid>
                <Grid item xs={12} sm={3}><KpiCard title="Bounced" value={summaryData?.bounced || 0} icon={ErrorOutline} color="error" loading={summaryLoading} /></Grid>
            </Grid>

            <DashboardCard title="Cheque Records">
                <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
                    <TextField
                        size="small" label="Search" placeholder="Cheque #, Bank, ID" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        sx={{ minWidth: 250 }} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                    />
                    <Stack direction="row" spacing={2} alignItems="center">
                        <ToggleButtonGroup value={statusFilter} exclusive onChange={(e, v) => v && setStatusFilter(v)} size="small" color="primary">
                            <ToggleButton value="PENDING">Pending</ToggleButton>
                            <ToggleButton value="CLEARED">Cleared</ToggleButton>
                            <ToggleButton value="BOUNCED">Bounced</ToggleButton>
                            <ToggleButton value="ALL">All</ToggleButton>
                        </ToggleButtonGroup>
                        <Button startIcon={<CleaningServices />} onClick={() => { setSearch(''); setStatusFilter('ALL'); setPage(0); }}>Clear</Button>
                    </Stack>
                </Box>

                <DataTable
                    serverSide columns={columns} data={cheques} loading={isLoading}
                    totalCount={totalCount} page={page} rowsPerPage={rowsPerPage}
                    onPageChange={setPage} onRowsPerPageChange={setRowsPerPage}
                    orderBy={orderBy} orderDirection={orderDirection} onSortChange={handleSort}
                    actions={(row) => (
                        <Stack direction="row" spacing={0.5}>
                            <Tooltip title="View"><IconButton size="small" color="info" onClick={() => { setSelectedCheque(row); setDetailsOpen(true); }}><Visibility fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpenDialog(row)}><Edit fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title={row.status === 'PENDING' ? "Delete" : "Only PENDING can be deleted"}>
                                <span><IconButton size="small" color="error" disabled={row.status !== 'PENDING'} onClick={() => { setDeleteId(row.id); setDeleteDialogOpen(true); }}><Delete fontSize="small" /></IconButton></span>
                            </Tooltip>
                        </Stack>
                    )}
                />
            </DashboardCard>

            <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={handleSubmit} title={editId ? 'Edit Cheque' : 'Add New Cheque'} loading={createMutation.isLoading || updateMutation.isLoading} maxWidth="sm">
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Cheque Number" value={formData.chequeNumber} onChange={(e) => setFormData({ ...formData, chequeNumber: e.target.value })} required /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Bank Name" value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} required /></Grid>
                    <Grid item xs={12}>
                        <TextField select fullWidth label="Linked Customer" value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value })} helperText="Optional - link to credit customer">
                            <MenuItem value=""><em>None</em></MenuItem>
                            {customers.map(cu => <MenuItem key={cu.id} value={cu.id}>{cu.name} ({cu.publicId})</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12}><TextField fullWidth type="number" label="Amount (₹)" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })} required inputProps={{ min: 0, step: 0.01 }} /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth type="date" label="Issue Date" InputLabelProps={{ shrink: true }} value={formData.issueDate} onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })} required /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth type="date" label="Due Date" InputLabelProps={{ shrink: true }} value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} required /></Grid>
                    <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Note" value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} placeholder="Optional notes..." /></Grid>
                </Grid>
            </FormDialog>

            <ConfirmDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={() => deleteMutation.mutate(deleteId)} title="Delete Cheque" message="Are you sure you want to delete this cheque record? This action cannot be undone." severity="error" loading={deleteMutation.isLoading} />

            <FormDialog
                open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}
                onSubmit={(e) => { e.preventDefault(); statusMutation.mutate(statusData); }}
                title="Update Cheque Status" loading={statusMutation.isLoading} maxWidth="xs"
            >
                <Stack spacing={2}>
                    <TextField select fullWidth label="Status" value={statusData.status} onChange={(e) => setStatusData({ ...statusData, status: e.target.value })}>
                        <MenuItem value="PENDING">PENDING</MenuItem>
                        <MenuItem value="DEPOSITED">DEPOSITED</MenuItem>
                        <MenuItem value="CLEARED">CLEARED</MenuItem>
                        <MenuItem value="BOUNCED">BOUNCED</MenuItem>
                    </TextField>

                    {statusData.status === 'DEPOSITED' && (
                        <TextField fullWidth type="date" label="Deposit Date" InputLabelProps={{ shrink: true }} value={statusData.depositDate} onChange={(e) => setStatusData({ ...statusData, depositDate: e.target.value })} required />
                    )}

                    {statusData.status === 'CLEARED' && (
                        <TextField fullWidth type="date" label="Cleared Date" InputLabelProps={{ shrink: true }} value={statusData.clearedDate} onChange={(e) => setStatusData({ ...statusData, clearedDate: e.target.value })} required />
                    )}

                    {statusData.status === 'BOUNCED' && (
                        <>
                            <TextField fullWidth type="date" label="Bounced Date" InputLabelProps={{ shrink: true }} value={statusData.bouncedDate} onChange={(e) => setStatusData({ ...statusData, bouncedDate: e.target.value })} required />
                            <TextField fullWidth multiline rows={2} label="Bounce Reason" value={statusData.bounceReason} onChange={(e) => setStatusData({ ...statusData, bounceReason: e.target.value })} required />
                        </>
                    )}
                </Stack>
            </FormDialog>

            <GenericDetailsDialog open={detailsOpen} onClose={() => setDetailsOpen(false)} data={selectedCheque} title="Cheque Details" />
        </AnimatedContainer>
    );
}

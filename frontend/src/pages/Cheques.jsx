import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, MenuItem, IconButton, Tooltip, Grid, Paper } from '@mui/material';
import { Add, Delete, Edit, AccountBalance } from '@mui/icons-material';
import { getCheques, createCheque, updateCheque, updateChequeStatus, deleteCheque } from '../api/chequesApi';
import { getCustomers } from '../api/creditCustomersApi';
import { toast } from 'react-toastify';
import { PageHeader, DataTable, FormDialog, ConfirmDialog, DashboardCard, AnimatedContainer } from '../components';

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
    const [cheques, setCheques] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const [submitting, setSubmitting] = useState(false);
    const [searchId, setSearchId] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cRes, custRes] = await Promise.all([
                getCheques(searchId ? { id: searchId } : undefined),
                getCustomers()
            ]);
            setCheques(Array.isArray(cRes.data) ? cRes.data : (cRes.data ? [cRes.data] : []));
            setCustomers(Array.isArray(custRes.data) ? custRes.data : []);
        } catch (e) {
            console.error(e);
            setCheques([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [searchId]);

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

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditId(null);
        setFormData(initialFormData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editId) {
                await updateCheque(editId, formData);
                toast.success('Cheque updated successfully');
            } else {
                await createCheque(formData);
                toast.success('Cheque created successfully');
            }
            handleCloseDialog();
            fetchData();
        } catch (e) {
            console.error(e);
            toast.error('Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await updateChequeStatus(id, status);
            toast.success('Status updated successfully');
            fetchData();
        } catch (e) {
            console.error(e);
            toast.error('Status update failed');
        }
    };

    const handleOpenDeleteDialog = (id) => {
        setDeleteId(id);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            await deleteCheque(deleteId);
            toast.success('Cheque deleted successfully');
            setDeleteDialogOpen(false);
            setDeleteId(null);
            fetchData();
        } catch (e) {
            console.error(e);
            toast.error('Delete failed');
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (val) => {
        const num = Number(val);
        if (Number.isFinite(num)) return `₹${num.toFixed(2)}`;
        return '—';
    };

    const columns = [
        { id: 'id', label: 'ID', minWidth: 60 },
        { id: 'chequeNumber', label: 'Cheque No', minWidth: 120 },
        { id: 'customerId', label: 'Customer ID', minWidth: 100 },
        { id: 'bankName', label: 'Bank Name', minWidth: 150 },
        {
            id: 'amount',
            label: 'Amount',
            minWidth: 120,
            align: 'right',
            render: (val) => formatCurrency(val)
        },
        { id: 'issueDate', label: 'Issue Date', minWidth: 100 },
        { id: 'dueDate', label: 'Due Date', minWidth: 100 },
        {
            id: 'status',
            label: 'Status',
            minWidth: 150,
            render: (val, row) => (
                <TextField
                    select
                    size="small"
                    variant="standard"
                    value={val}
                    onChange={(e) => handleStatusChange(row.id, e.target.value)}
                    sx={{ minWidth: 120 }}
                >
                    <MenuItem value="PENDING">PENDING</MenuItem>
                    <MenuItem value="DEPOSITED">DEPOSITED</MenuItem>
                    <MenuItem value="CLEARED">CLEARED</MenuItem>
                    <MenuItem value="BOUNCED">BOUNCED</MenuItem>
                </TextField>
            )
        },
        { id: 'note', label: 'Note', minWidth: 150 },
        {
            id: 'createdAt',
            label: 'Created At',
            minWidth: 150,
            render: (val) => val ? new Date(val).toLocaleString() : '—'
        },
        {
            id: 'updatedAt',
            label: 'Updated At',
            minWidth: 150,
            render: (val) => val ? new Date(val).toLocaleString() : '—'
        },
    ];

    return (
        <AnimatedContainer delay={0.1}>
            <PageHeader
                title="Cheques"
                subtitle="Post-dated cheque lifecycle management"
                breadcrumbs={[{ label: 'Cheques', path: '/cheques' }]}
                actions={
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                    >
                        Add Cheque
                    </Button>
                }
            />

            <DashboardCard title="Cheque Records" subtitle="Track and manage post-dated cheques">
                {/* Filter Bar */}
                <Box mb={3} display="flex" gap={2} alignItems="center">
                    <TextField
                        size="small"
                        label="Search by Cheque ID"
                        type="number"
                        placeholder="Enter ID"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        sx={{ width: 250 }}
                    />
                    {searchId && (
                        <Button
                            color="inherit"
                            onClick={() => setSearchId('')}
                        >
                            Clear
                        </Button>
                    )}
                </Box>

                <DataTable
                    columns={columns}
                    data={cheques}
                    searchKey="chequeNumber"
                    loading={loading}
                    emptyTitle="No cheques found"
                    emptyDescription="Start by adding your first cheque record."
                    emptyAction={
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => handleOpenDialog()}
                        >
                            Add First Cheque
                        </Button>
                    }
                    actions={(row) => (
                        <>
                            <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => handleOpenDialog(row)}>
                                    <Edit fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleOpenDeleteDialog(row.id)}
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                />
            </DashboardCard>

            {/* Create/Edit Dialog */}
            <FormDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                onSubmit={handleSubmit}
                title={editId ? 'Edit Cheque' : 'Add New Cheque'}
                subtitle={editId ? 'Update cheque information' : 'Enter cheque details'}
                loading={submitting}
                maxWidth="sm"
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Cheque Number"
                            value={formData.chequeNumber}
                            onChange={(e) => setFormData({ ...formData, chequeNumber: e.target.value })}
                            required
                            disabled={submitting}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Bank Name"
                            value={formData.bankName}
                            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                            required
                            disabled={submitting}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            select
                            label="Customer"
                            value={formData.customerId}
                            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                            disabled={submitting}
                            helperText="Optional - link to credit customer"
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {customers.map(cu => (
                                <MenuItem key={cu.id} value={cu.id}>{cu.name}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Amount (₹)"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                            required
                            disabled={submitting}
                            inputProps={{ min: 0, step: 0.01 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Issue Date"
                            InputLabelProps={{ shrink: true }}
                            value={formData.issueDate}
                            onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                            required
                            disabled={submitting}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Due Date"
                            InputLabelProps={{ shrink: true }}
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            required
                            disabled={submitting}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Note"
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            disabled={submitting}
                            placeholder="Optional notes..."
                        />
                    </Grid>
                </Grid>
            </FormDialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Delete Cheque"
                message="Are you sure you want to delete this cheque record? This action cannot be undone."
                confirmText="Delete"
                severity="error"
                loading={submitting}
            />
        </AnimatedContainer>
    );
}

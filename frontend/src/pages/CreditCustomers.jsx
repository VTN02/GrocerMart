import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, IconButton, Tooltip, Grid, Typography, Paper } from '@mui/material';
import { Add, Edit, Delete, Payment } from '@mui/icons-material';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, addPayment } from '../api/creditCustomersApi';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import FormDialog from '../components/FormDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusChip from '../components/StatusChip';

const initialFormData = {
    name: '',
    phone: '',
    address: '',
    creditLimit: 0,
};

export default function CreditCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const [paymentData, setPaymentData] = useState({ customerId: null, amount: 0, note: '' });
    const [submitting, setSubmitting] = useState(false);
    const [searchId, setSearchId] = useState('');

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const { data } = await getCustomers(searchId ? { id: searchId } : undefined);
            setCustomers(Array.isArray(data) ? data : [data]);
        } catch (error) {
            console.error(error);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => {
        const num = Number(val);
        if (Number.isFinite(num)) return `₹${num.toFixed(2)}`;
        return '—';
    };

    useEffect(() => {
        fetchCustomers();
    }, [searchId]);

    const handleOpenDialog = (customer = null) => {
        if (customer) {
            setEditId(customer.id);
            setFormData({
                name: customer.name,
                phone: customer.phone,
                address: customer.address,
                creditLimit: customer.creditLimit,
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editId) {
                await updateCustomer(editId, formData);
                toast.success('Customer updated successfully');
            } else {
                await createCustomer(formData);
                toast.success('Customer created successfully');
            }
            handleCloseDialog();
            fetchCustomers();
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenDeleteDialog = (id) => {
        setDeleteId(id);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            await deleteCustomer(deleteId);
            toast.success('Customer deleted successfully');
            setDeleteDialogOpen(false);
            setDeleteId(null);
            fetchCustomers();
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenPaymentDialog = (customer) => {
        setPaymentData({ customerId: customer.id, amount: 0, note: '' });
        setPaymentDialogOpen(true);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await addPayment(paymentData.customerId, {
                amount: paymentData.amount,
                note: paymentData.note,
            });
            toast.success('Payment recorded successfully');
            setPaymentDialogOpen(false);
            setPaymentData({ customerId: null, amount: 0, note: '' });
            fetchCustomers();
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        { id: 'id', label: 'ID', minWidth: 60 },
        { id: 'name', label: 'Customer Name', minWidth: 150 },
        { id: 'phone', label: 'Phone', minWidth: 120 },
        { id: 'address', label: 'Address', minWidth: 180 },
        {
            id: 'creditLimit',
            label: 'Credit Limit',
            minWidth: 120,
            align: 'right',
            render: (val) => formatCurrency(val),
        },
        {
            id: 'outstandingBalance',
            label: 'Outstanding Balance',
            minWidth: 150,
            align: 'right',
            render: (val) => (
                <Typography
                    fontWeight={600}
                    color={Number(val) > 0 ? 'error.main' : 'success.main'}
                >
                    {formatCurrency(val)}
                </Typography>
            ),
        },
        {
            id: 'status',
            label: 'Status',
            minWidth: 100,
            render: (val) => <StatusChip status={val} />,
        },
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
        <Box>
            <PageHeader
                title="Credit Customers"
                subtitle="Manage customer credit accounts and payments"
                breadcrumbs={[{ label: 'Credit Customers', path: '/credit-customers' }]}
                actions={
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                        size="large"
                    >
                        Add Customer
                    </Button>
                }
            />

            {/* Filter Bar */}
            <Box mb={3} display="flex" gap={2} p={2} component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <TextField
                    size="small"
                    label="Search by Customer ID"
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
                data={customers}
                searchKey="name"
                loading={loading}
                emptyTitle="No credit customers found"
                emptyDescription="Start by adding your first credit customer."
                emptyAction={
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                    >
                        Add First Customer
                    </Button>
                }
                actions={(row) => (
                    <>
                        <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleOpenDialog(row)}>
                                <Edit fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Add Payment">
                            <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleOpenPaymentDialog(row)}
                            >
                                <Payment fontSize="small" />
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

            {/* Create/Edit Dialog */}
            <FormDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                onSubmit={handleSubmit}
                title={editId ? 'Edit Customer' : 'Add New Customer'}
                subtitle={editId ? 'Update customer information' : 'Enter customer details'}
                loading={submitting}
                maxWidth="sm"
            >
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Customer Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            disabled={submitting}
                            autoFocus
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            disabled={submitting}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            disabled={submitting}
                            multiline
                            rows={2}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Credit Limit (₹)"
                            value={formData.creditLimit}
                            onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) })}
                            required
                            disabled={submitting}
                            inputProps={{ min: 0, step: 0.01 }}
                        />
                    </Grid>
                </Grid>
            </FormDialog>

            {/* Payment Dialog */}
            <FormDialog
                open={paymentDialogOpen}
                onClose={() => {
                    setPaymentDialogOpen(false);
                    setPaymentData({ customerId: null, amount: 0, note: '' });
                }}
                onSubmit={handlePaymentSubmit}
                title="Add Payment"
                subtitle="Record a payment from customer"
                loading={submitting}
                submitText="Record Payment"
                maxWidth="xs"
            >
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Payment Amount (₹)"
                            value={paymentData.amount}
                            onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
                            required
                            disabled={submitting}
                            inputProps={{ min: 0, step: 0.01 }}
                            autoFocus
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Note (Optional)"
                            value={paymentData.note}
                            onChange={(e) => setPaymentData({ ...paymentData, note: e.target.value })}
                            disabled={submitting}
                            multiline
                            rows={2}
                        />
                    </Grid>
                </Grid>
            </FormDialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Delete Customer"
                message="Are you sure you want to delete this customer? This action cannot be undone."
                confirmText="Delete"
                severity="error"
                loading={submitting}
            />
        </Box>
    );
}

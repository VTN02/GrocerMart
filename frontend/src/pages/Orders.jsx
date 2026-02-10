import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, MenuItem, IconButton, Tooltip, Grid, Paper, Chip } from '@mui/material';
import { Add, Delete, Visibility } from '@mui/icons-material';
import { getOrders, createOrder, deleteOrder } from '../api/ordersApi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PageHeader, DataTable, FormDialog, ConfirmDialog, StatusChip } from '../components';

const initialFormData = {
    invoiceNo: '',
    paymentType: 'CASH',
};

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const [submitting, setSubmitting] = useState(false);
    const [searchId, setSearchId] = useState('');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await getOrders(searchId ? { id: searchId } : undefined);
            setOrders(Array.isArray(data) ? data : [data]);
        } catch (e) {
            console.error(e);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [searchId]);

    const handleOpenDialog = () => {
        setFormData(initialFormData);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setFormData(initialFormData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await createOrder(formData);
            toast.success('Order draft created successfully');
            handleCloseDialog();
            fetchOrders();
        } catch (e) {
            console.error(e);
            toast.error('Operation failed');
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
            await deleteOrder(deleteId);
            toast.success('Order voided successfully');
            setDeleteDialogOpen(false);
            setDeleteId(null);
            fetchOrders();
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
        { id: 'invoiceNo', label: 'Invoice No', minWidth: 120 },
        {
            id: 'orderDate',
            label: 'Order Date',
            minWidth: 150,
            render: (val) => new Date(val).toLocaleString()
        },
        { id: 'paymentType', label: 'Payment', minWidth: 100 },
        {
            id: 'totalAmount',
            label: 'Total Amount',
            minWidth: 120,
            align: 'right',
            render: (val) => formatCurrency(val)
        },
        {
            id: 'status',
            label: 'Status',
            minWidth: 100,
            render: (val) => <StatusChip status={val} />
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
                title="Orders"
                subtitle="Sales orders and invoicing"
                breadcrumbs={[{ label: 'Orders', path: '/orders' }]}
                actions={
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleOpenDialog}
                    >
                        New Order
                    </Button>
                }
            />

            {/* Filter Bar */}
            <Box mb={3} display="flex" gap={2} p={2} component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <TextField
                    size="small"
                    label="Search by Order ID"
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
                data={orders}
                searchKey="invoiceNo"
                loading={loading}
                emptyTitle="No orders found"
                emptyDescription="Start by creating your first order."
                emptyAction={
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleOpenDialog}
                    >
                        Create First Order
                    </Button>
                }
                actions={(row) => (
                    <>
                        <Tooltip title="View Details">
                            <Button
                                component={Link}
                                to={`/orders/${row.id}/items`}
                                startIcon={<Visibility />}
                                size="small"
                                variant="outlined"
                            >
                                Details
                            </Button>
                        </Tooltip>
                        {row.status === 'DRAFT' && (
                            <Tooltip title="Delete">
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleOpenDeleteDialog(row.id)}
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </>
                )}
            />

            {/* Create Dialog */}
            <FormDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                onSubmit={handleSubmit}
                title="Create New Order"
                subtitle="Start a new invoice draft"
                loading={submitting}
                submitText="Create Draft"
                maxWidth="xs"
            >
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Invoice Number"
                            value={formData.invoiceNo}
                            onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                            required
                            disabled={submitting}
                            autoFocus
                            helperText="Unique invoice identifier"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            select
                            label="Payment Type"
                            value={formData.paymentType}
                            onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                            required
                            disabled={submitting}
                        >
                            <MenuItem value="CASH">CASH</MenuItem>
                            <MenuItem value="CARD">CARD</MenuItem>
                            <MenuItem value="CREDIT">CREDIT</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </FormDialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Void Order"
                message="Are you sure you want to void this order? This action cannot be undone."
                confirmText="Void Order"
                severity="error"
                loading={submitting}
            />
        </Box>
    );
}

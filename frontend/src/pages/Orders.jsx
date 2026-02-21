import React, { useState, useMemo } from 'react';
import { Box, Button, TextField, MenuItem, IconButton, Tooltip, Grid, Typography, Chip, Stack, InputAdornment, Autocomplete, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Add, Delete, Visibility, Search, Clear, FilterList, RemoveCircleOutline } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, createOrder, deleteOrder } from '../api/ordersApi';
import { getProducts } from '../api/productsApi';
import { getCreditCustomers } from '../api/creditCustomersApi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PageHeader, DataTable, FormDialog, ConfirmDialog, StatusChip, DashboardCard, AnimatedContainer } from '../components';
import { format } from 'date-fns';

const initialItemState = {
    productId: '',
    qty: 1,
    unitPrice: 0,
    lineTotal: 0
};

const initialFormData = {
    invoiceNo: '',
    paymentType: 'CASH',
    creditCustomerId: '',
    items: [{ ...initialItemState }]
};

export default function Orders() {
    const queryClient = useQueryClient();

    // Table & Filter State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPaymentType, setFilterPaymentType] = useState('');
    const [orderBy, setOrderBy] = useState('id');
    const [orderDirection, setOrderDirection] = useState('desc');

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [formData, setFormData] = useState(initialFormData);

    // Data Fetching
    const { data, isLoading } = useQuery({
        queryKey: ['orders', page, rowsPerPage, search, filterStatus, filterPaymentType, orderBy, orderDirection],
        queryFn: async () => {
            const params = {
                page,
                size: rowsPerPage,
                search: search || undefined,
                status: filterStatus || undefined,
                paymentType: filterPaymentType || undefined,
                sort: `${orderBy},${orderDirection}`
            };
            const response = await getOrders(params);
            return response.data || response;
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

    const { data: productsData } = useQuery({
        queryKey: ['products', 'active'],
        queryFn: async () => {
            const res = await getProducts({ status: 'ACTIVE', size: 1000 });
            const data = res.data || res;
            return Array.isArray(data) ? data : (data.content || []);
        }
    });

    const orders = data?.content || [];
    const totalCount = data?.totalElements || 0;
    const creditCustomers = customerData || [];
    const products = productsData || [];

    // Mutations
    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries(['orders']);
            handleCloseDialog();
            setDeleteDialogOpen(false);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const createMutation = useMutation({ mutationFn: createOrder, ...mutationOptions, onSuccess: () => { toast.success('Order draft created'); mutationOptions.onSuccess(); } });
    const deleteMutation = useMutation({ mutationFn: deleteOrder, ...mutationOptions, onSuccess: () => { toast.success('Order voided'); mutationOptions.onSuccess(); } });

    const handleOpenDialog = () => {
        setFormData(initialFormData);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setFormData(initialFormData);
    };

    const handleAddItem = () => {
        setFormData({ ...formData, items: [...formData.items, { ...initialItemState }] });
    };

    const handleRemoveItem = (index) => {
        setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        const item = { ...newItems[index], [field]: value };

        if (field === 'productId') {
            const prod = products.find(p => p.id === value);
            if (prod) item.unitPrice = prod.unitPrice;
        }

        if (field === 'qty' || field === 'unitPrice' || field === 'productId') {
            item.lineTotal = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
        }

        newItems[index] = item;
        setFormData({ ...formData, items: newItems });
    };

    const calculateTotal = () => formData.items.reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0);

    const isCreditLimitExceeded = () => {
        if (formData.paymentType !== 'CREDIT' || !formData.creditCustomerId) return false;
        const customer = creditCustomers.find(c => c.id === formData.creditCustomerId);
        if (!customer) return false;
        const available = (customer.creditLimit || 0) - (customer.outstandingBalance || 0);
        return calculateTotal() > available;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.paymentType === 'CREDIT' && !formData.creditCustomerId) {
            return toast.error("Credit Customer is required for CREDIT orders");
        }
        if (isCreditLimitExceeded()) {
            return toast.error("Credit limit exceeded for this customer");
        }
        if (formData.items.length === 0) {
            return toast.error("At least one item is required");
        }
        createMutation.mutate(formData);
    };

    const handleSort = (property) => {
        const isAsc = orderBy === property && orderDirection === 'asc';
        setOrderDirection(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const formatCurrency = (val) => {
        const num = Number(val);
        return Number.isFinite(num) ? `₹${num.toFixed(2)}` : '—';
    };

    const columns = useMemo(() => [
        { id: 'publicId', label: 'ID', minWidth: 100, sortable: true, render: (val) => <Typography variant="body2" fontWeight="bold">{val}</Typography> },
        { id: 'invoiceNo', label: 'Invoice #', minWidth: 100, sortable: true },
        { id: 'orderDate', label: 'Order Date', minWidth: 150, sortable: true, render: (val) => format(new Date(val), 'MMM dd, yyyy HH:mm') },
        {
            id: 'paymentType', label: 'Payment', minWidth: 100, sortable: true,
            render: (val) => <Chip label={val} color={val === 'CREDIT' ? 'warning' : 'success'} size="small" variant="outlined" />
        },
        { id: 'totalAmount', label: 'Total Amount', minWidth: 120, align: 'right', sortable: true, render: (val) => formatCurrency(val) },
        { id: 'status', label: 'Status', minWidth: 100, sortable: true, render: (val) => <StatusChip status={val} /> }
    ], []);

    return (
        <AnimatedContainer>
            <PageHeader
                title="Orders"
                subtitle="Sales orders and invoicing"
                breadcrumbs={[{ label: 'Orders', path: '/orders' }]}
                actions={<Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>New Order</Button>}
            />

            <DashboardCard title="Order Management">
                <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth size="small" label="Search" placeholder="Invoice #, ID"
                            value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <TextField
                            select fullWidth size="small" label="Status"
                            value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
                        >
                            <MenuItem value="">All Statuses</MenuItem>
                            <MenuItem value="DRAFT">DRAFT</MenuItem>
                            <MenuItem value="CONFIRMED">CONFIRMED</MenuItem>
                            <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <TextField
                            select fullWidth size="small" label="Payment"
                            value={filterPaymentType} onChange={(e) => { setFilterPaymentType(e.target.value); setPage(0); }}
                        >
                            <MenuItem value="">All Payments</MenuItem>
                            <MenuItem value="CASH">CASH</MenuItem>
                            <MenuItem value="CARD">CARD</MenuItem>
                            <MenuItem value="CREDIT">CREDIT</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Button
                            startIcon={<Clear />} color="inherit"
                            disabled={!search && !filterStatus && !filterPaymentType}
                            onClick={() => { setSearch(''); setFilterStatus(''); setFilterPaymentType(''); setPage(0); }}
                        >
                            Clear
                        </Button>
                    </Grid>
                </Grid>

                <DataTable
                    serverSide
                    columns={columns}
                    data={orders}
                    loading={isLoading}
                    totalCount={totalCount}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setPage}
                    onRowsPerPageChange={setRowsPerPage}
                    orderBy={orderBy}
                    orderDirection={orderDirection}
                    onSortChange={handleSort}
                    actions={(row) => (
                        <Stack direction="row" spacing={0.5}>
                            <Tooltip title="View Items">
                                <Button component={Link} to={`/orders/${row.id}/items`} startIcon={<Visibility />} size="small" variant="outlined">Details</Button>
                            </Tooltip>
                            {row.status === 'DRAFT' && (
                                <Tooltip title="Void">
                                    <IconButton size="small" color="error" onClick={() => { setDeleteId(row.id); setDeleteDialogOpen(true); }}><Delete fontSize="small" /></IconButton>
                                </Tooltip>
                            )}
                        </Stack>
                    )}
                />
            </DashboardCard>

            <FormDialog
                open={dialogOpen} onClose={handleCloseDialog} onSubmit={handleSubmit}
                title="Create New Order" subtitle="Start a invoice draft" loading={createMutation.isLoading}
                maxWidth="lg"
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}><TextField fullWidth label="Invoice Number" value={formData.invoiceNo} onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })} required autoFocus /></Grid>
                    <Grid item xs={12} md={4}>
                        <TextField select fullWidth label="Payment Type" value={formData.paymentType} onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })} required>
                            <MenuItem value="CASH">CASH</MenuItem>
                            <MenuItem value="CARD">CARD</MenuItem>
                            <MenuItem value="CREDIT">CREDIT</MenuItem>
                        </TextField>
                    </Grid>
                    {formData.paymentType === 'CREDIT' && (
                        <Grid item xs={12} md={4}>
                            <TextField select fullWidth label="Credit Customer" value={formData.creditCustomerId} onChange={(e) => setFormData({ ...formData, creditCustomerId: e.target.value })} required>
                                {creditCustomers.map((c) => (
                                    <MenuItem key={c.id} value={c.id}>{c.name} (Available: ₹{(c.creditLimit - c.outstandingBalance || 0).toFixed(2)})</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Order Items</Typography>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Product</TableCell>
                                        <TableCell width="120">Qty</TableCell>
                                        <TableCell width="150">Unit Price</TableCell>
                                        <TableCell width="150" align="right">Total</TableCell>
                                        <TableCell width="50"></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {formData.items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Autocomplete
                                                    size="small"
                                                    fullWidth
                                                    options={products}
                                                    getOptionLabel={(p) => `${p.name} (Stock: ${p.unitQty}) - ₹${p.unitPrice}`}
                                                    value={products.find(p => p.id === item.productId) || null}
                                                    onChange={(e, newVal) => handleItemChange(index, 'productId', newVal ? newVal.id : '')}
                                                    renderInput={(params) => <TextField {...params} required placeholder="Search..." />}
                                                    autoHighlight
                                                />
                                            </TableCell>
                                            <TableCell><TextField type="number" size="small" value={item.qty} onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value) || 0)} inputProps={{ min: 1 }} /></TableCell>
                                            <TableCell><TextField type="number" size="small" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)} inputProps={{ min: 0, step: 0.01 }} /></TableCell>
                                            <TableCell align="right">₹{Number(item.lineTotal).toFixed(2)}</TableCell>
                                            <TableCell><IconButton size="small" color="error" onClick={() => handleRemoveItem(index)}><RemoveCircleOutline fontSize="small" /></IconButton></TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow><TableCell colSpan={5}><Button startIcon={<Add />} onClick={handleAddItem}>Add Item</Button></TableCell></TableRow>
                                    <TableRow>
                                        <TableCell colSpan={3} align="right"><Typography fontWeight="bold">Grand Total:</Typography></TableCell>
                                        <TableCell align="right"><Typography fontWeight="bold" color={isCreditLimitExceeded() ? 'error.main' : 'primary'}>₹{calculateTotal().toFixed(2)}</Typography></TableCell>
                                        <TableCell />
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            </FormDialog>

            <ConfirmDialog
                open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={() => deleteMutation.mutate(deleteId)}
                title="Void Order" message="Void this order draft?" loading={deleteMutation.isLoading} severity="error"
            />
        </AnimatedContainer>
    );
}


import React, { useState, useMemo } from 'react';
import {
    Box, Button, TextField, MenuItem, IconButton, Tooltip, Grid, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Chip, Divider, Stack, InputAdornment, Autocomplete
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSales, createSale, updateSale, deleteSale } from '../api/salesApi';
import { getProducts } from '../api/productsApi';
import { getCreditCustomers } from '../api/creditCustomersApi';
import { getSalesReportPdf, getInvoicePdf, downloadBlob } from '../api/reportsApi';
import { toast } from 'react-toastify';
import { Add, Edit, Delete, Visibility, RemoveCircleOutline, CleaningServices, PictureAsPdf, FileDownload, Search, Clear } from '@mui/icons-material';
import { PageHeader, DataTable, FormDialog, ConfirmDialog, DashboardCard, AnimatedContainer, SalesDetailsDialog } from '../components';
import { format } from 'date-fns';

const initialItemState = {
    productId: '',
    qtySold: 1,
    unitPrice: 0,
    lineTotal: 0
};

const initialFormData = {
    salesDate: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'CASH',
    creditCustomerId: null,
    note: '',
    items: [initialItemState]
};

export default function Sales() {
    const queryClient = useQueryClient();

    // Table & Filter State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [orderBy, setOrderBy] = useState('id');
    const [orderDirection, setOrderDirection] = useState('desc');

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [formData, setFormData] = useState(initialFormData);

    // Data Fetching
    const { data, isLoading } = useQuery({
        queryKey: ['sales', page, rowsPerPage, search, minAmount, maxAmount, fromDate, toDate, orderBy, orderDirection],
        queryFn: async () => {
            const params = {
                page,
                size: rowsPerPage,
                search: search || undefined,
                minAmount: minAmount || undefined,
                maxAmount: maxAmount || undefined,
                from: fromDate || undefined,
                to: toDate || undefined,
                sort: `${orderBy},${orderDirection}`
            };
            const response = await getSales(params);
            return response.data || response;
        },
        keepPreviousData: true
    });

    const { data: productsData } = useQuery({
        queryKey: ['products', 'active'],
        queryFn: async () => {
            const res = await getProducts({ status: 'ACTIVE', size: 1000 });
            const data = res.data || res;
            return Array.isArray(data) ? data : (data.content || []);
        }
    });

    const { data: customersData } = useQuery({
        queryKey: ['creditCustomers', 'active'],
        queryFn: async () => {
            const res = await getCreditCustomers({ status: 'ACTIVE', size: 1000 });
            const data = res.data || res;
            return Array.isArray(data) ? data : (data.content || []);
        }
    });

    const sales = data?.content || [];
    const totalCount = data?.totalElements || 0;
    const products = productsData || [];
    const creditCustomers = customersData || [];

    // Mutations
    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries(['sales']);
            handleCloseDialog();
            setDeleteDialogOpen(false);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const createMutation = useMutation({ mutationFn: createSale, ...mutationOptions, onSuccess: () => { toast.success('Sale recorded'); mutationOptions.onSuccess(); } });
    const updateMutation = useMutation({ mutationFn: (data) => updateSale(editId, data), ...mutationOptions, onSuccess: () => { toast.success('Sale updated'); mutationOptions.onSuccess(); } });
    const deleteMutation = useMutation({ mutationFn: deleteSale, ...mutationOptions, onSuccess: () => { toast.success('Sale deleted'); mutationOptions.onSuccess(); } });

    // Handlers
    const handleOpenDialog = (sale = null) => {
        if (sale) {
            setEditId(sale.id);
            setFormData({
                salesDate: sale.salesDate,
                paymentMethod: sale.paymentMethod || 'CASH',
                creditCustomerId: sale.creditCustomerId || '',
                note: sale.note || '',
                items: sale.items.map(item => ({
                    productId: item.productId,
                    qtySold: item.qtySold,
                    unitPrice: item.unitPrice,
                    lineTotal: item.lineTotal
                }))
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

        if (field === 'qtySold' || field === 'unitPrice' || field === 'productId') {
            item.lineTotal = (Number(item.qtySold) || 0) * (Number(item.unitPrice) || 0);
        }

        newItems[index] = item;
        setFormData({ ...formData, items: newItems });
    };

    const calculateTotal = () => formData.items.reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0);

    const isCreditLimitExceeded = () => {
        if (formData.paymentMethod !== 'CREDIT' || !formData.creditCustomerId) return false;
        const customer = creditCustomers.find(c => c.id === formData.creditCustomerId);
        if (!customer) return false;
        const available = Math.max(0, (customer.creditLimit || 0) - Math.abs(customer.outstandingBalance || 0));
        return calculateTotal() > available;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.paymentMethod === 'CREDIT' && !formData.creditCustomerId) return toast.error("Select a credit customer");
        if (isCreditLimitExceeded()) return toast.error("Credit limit exceeded");
        if (editId) updateMutation.mutate(formData);
        else createMutation.mutate(formData);
    };

    const handleSort = (property) => {
        const isAsc = orderBy === property && orderDirection === 'asc';
        setOrderDirection(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handlePrintInvoice = async (sale) => {
        try {
            const res = await getInvoicePdf(sale.id);
            downloadBlob(res.data, `Invoice_${sale.publicId || sale.invoiceId}.pdf`);
            toast.success("Invoice downloaded");
        } catch (e) { toast.error("Download failed"); }
    };

    const handleExportReport = async () => {
        try {
            const res = await getSalesReportPdf(fromDate, toDate);
            downloadBlob(res.data, `Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success("Report downloaded");
        } catch (e) { toast.error("Report failed"); }
    };

    const columns = useMemo(() => [
        { id: 'publicId', label: 'ID', minWidth: 100, sortable: true, render: (val) => <Typography variant="body2" fontWeight="bold">{val}</Typography> },
        { id: 'salesDate', label: 'Date', minWidth: 100, sortable: true, render: (val) => format(new Date(val), 'MMM dd, yyyy') },
        {
            id: 'paymentMethod', label: 'Payment', minWidth: 100, sortable: true,
            render: (val) => <Chip label={val} color={val === 'CREDIT' ? 'warning' : 'success'} size="small" variant="outlined" />
        },
        { id: 'totalItemsSold', label: 'Items', minWidth: 80, align: 'right', sortable: true },
        { id: 'totalRevenue', label: 'Amount', minWidth: 120, align: 'right', sortable: true, render: (val) => `₹${Number(val).toFixed(2)}` }
    ], []);

    return (
        <AnimatedContainer>
            <PageHeader
                title="Sales History" subtitle="Manage invoices and daily sales"
                breadcrumbs={[{ label: 'Sales', path: '/sales' }]}
                actions={
                    <Stack direction="row" spacing={1}>
                        <Button variant="outlined" startIcon={<FileDownload />} onClick={handleExportReport}>Export PDF</Button>
                        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>New Sale</Button>
                    </Stack>
                }
            />

            <DashboardCard title="Sales Records">
                <Box mb={3} p={2} bgcolor="action.hover" borderRadius={2}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Search" placeholder="Invoice #, ID" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} /></Grid>
                        <Grid item xs={6} md={1.5}><TextField fullWidth size="small" type="number" label="Min ₹" value={minAmount} onChange={(e) => { setMinAmount(e.target.value); setPage(0); }} /></Grid>
                        <Grid item xs={6} md={1.5}><TextField fullWidth size="small" type="number" label="Max ₹" value={maxAmount} onChange={(e) => { setMaxAmount(e.target.value); setPage(0); }} /></Grid>
                        <Grid item xs={6} md={2}><TextField fullWidth size="small" type="date" label="From" InputLabelProps={{ shrink: true }} value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(0); }} /></Grid>
                        <Grid item xs={6} md={2}><TextField fullWidth size="small" type="date" label="To" InputLabelProps={{ shrink: true }} value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(0); }} /></Grid>
                        <Grid item xs={12} md={2}><Button fullWidth variant="text" color="inherit" startIcon={<CleaningServices />} onClick={() => { setSearch(''); setMinAmount(''); setMaxAmount(''); setFromDate(''); setToDate(''); setPage(0); }}>Clear</Button></Grid>
                    </Grid>
                </Box>

                <DataTable
                    serverSide columns={columns} data={sales} loading={isLoading}
                    totalCount={totalCount} page={page} rowsPerPage={rowsPerPage}
                    onPageChange={setPage} onRowsPerPageChange={setRowsPerPage}
                    orderBy={orderBy} orderDirection={orderDirection} onSortChange={handleSort}
                    actions={(row) => (
                        <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Print"><IconButton size="small" color="secondary" onClick={() => handlePrintInvoice(row)}><PictureAsPdf fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="View"><IconButton size="small" color="primary" onClick={() => { setSelectedSale(row); setDetailsOpen(true); }}><Visibility fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpenDialog(row)}><Edit fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { setDeleteId(row.id); setDeleteDialogOpen(true); }}><Delete fontSize="small" /></IconButton></Tooltip>
                        </Stack>
                    )}
                />
            </DashboardCard>

            <FormDialog
                open={dialogOpen} onClose={handleCloseDialog} onSubmit={handleSubmit}
                title={editId ? `Edit Sale (#${formData.invoiceId || '...'})` : 'Record New Sale'} maxWidth="lg" loading={createMutation.isLoading || updateMutation.isLoading}
            >
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}><TextField fullWidth type="date" label="Sales Date" InputLabelProps={{ shrink: true }} value={formData.salesDate} onChange={(e) => setFormData({ ...formData, salesDate: e.target.value })} required /></Grid>
                    <Grid item xs={12} md={4}>
                        <TextField select fullWidth label="Payment Method" value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}>
                            <MenuItem value="CASH">Cash</MenuItem>
                            <MenuItem value="CREDIT">Credit</MenuItem>
                        </TextField>
                    </Grid>
                    {formData.paymentMethod === 'CREDIT' && (
                        <Grid item xs={12} md={4}>
                            <TextField select fullWidth label="Credit Customer" value={formData.creditCustomerId || ''} onChange={(e) => setFormData({ ...formData, creditCustomerId: e.target.value })} required>
                                {creditCustomers.map(c => <MenuItem key={c.id} value={c.id}>{c.name} (Avail: ₹{Math.max(0, (c.creditLimit || 0) - Math.abs(c.outstandingBalance || 0)).toFixed(2)})</MenuItem>)}
                            </TextField>
                        </Grid>
                    )}
                    <Grid item xs={12}><TextField fullWidth label="Note" value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} placeholder="Optional note" multiline rows={2} /></Grid>
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Items</Typography>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead><TableRow><TableCell>Product</TableCell><TableCell width="120">Qty</TableCell><TableCell width="150">Unit Price</TableCell><TableCell width="150" align="right">Total</TableCell><TableCell width="50"></TableCell></TableRow></TableHead>
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
                                                    onChange={(e, newVal) => {
                                                        const value = newVal ? newVal.id : '';
                                                        handleItemChange(index, 'productId', value);
                                                    }}
                                                    renderInput={(params) => <TextField {...params} required placeholder="Search product..." />}
                                                    autoHighlight
                                                />
                                            </TableCell>
                                            <TableCell><TextField type="number" size="small" value={item.qtySold} onChange={(e) => handleItemChange(index, 'qtySold', parseInt(e.target.value) || 0)} inputProps={{ min: 1 }} /></TableCell>
                                            <TableCell><TextField type="number" size="small" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)} inputProps={{ min: 0, step: 0.01 }} /></TableCell>
                                            <TableCell align="right">₹{Number(item.lineTotal).toFixed(2)}</TableCell>
                                            <TableCell><IconButton size="small" color="error" onClick={() => handleRemoveItem(index)}><RemoveCircleOutline fontSize="small" /></IconButton></TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow><TableCell colSpan={5}><Button startIcon={<Add />} onClick={handleAddItem}>Add Item</Button></TableCell></TableRow>
                                    <TableRow>
                                        <TableCell colSpan={3} align="right"><Typography fontWeight="bold">Total Revenue:</Typography></TableCell>
                                        <TableCell align="right"><Typography fontWeight="bold" color={isCreditLimitExceeded() ? 'error.main' : 'primary'}>₹{calculateTotal().toFixed(2)}</Typography></TableCell>
                                        <TableCell />
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            </FormDialog>

            <SalesDetailsDialog open={detailsOpen} onClose={() => setDetailsOpen(false)} sale={selectedSale} />
            <ConfirmDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={() => deleteMutation.mutate(deleteId)} title="Delete Sale Record" message="Are you sure you want to delete this sales record?" severity="error" loading={deleteMutation.isLoading} />
        </AnimatedContainer >
    );
}


import React, { useState, useMemo } from 'react';
import { Box, Button, TextField, MenuItem, IconButton, Tooltip, Grid, CircularProgress, Switch, Stack, InputAdornment, Typography } from '@mui/material';
import { Add, Delete, Edit, Visibility, FileUpload, PictureAsPdf, Search, Clear } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, createProduct, updateProduct, deleteProduct, importCsv } from '../api/productsApi';
import { getInventoryReportPdf, getProductDetailsPdf, downloadBlob } from '../api/reportsApi';
import { toast } from 'react-toastify';
import { PageHeader, DataTable, FormDialog, ConfirmDialog, StatusChip, DashboardCard, AnimatedContainer, GenericDetailsDialog } from '../components';

const initialFormData = {
    name: '',
    category: '',
    unitPrice: 0,
    bulkPrice: 0,
    purchasePrice: 0,
    bulkQty: 0,
    unitQty: 0,
    unitsPerBulk: 1,
    reorderLevel: 10,
    status: 'ACTIVE',
};

export default function Products() {
    const queryClient = useQueryClient();

    // Table & Filter State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const [orderBy, setOrderBy] = useState('id');
    const [orderDirection, setOrderDirection] = useState('desc');

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [formData, setFormData] = useState(initialFormData);

    // Data Fetching
    const { data, isLoading } = useQuery({
        queryKey: ['products', page, rowsPerPage, search, filterCategory, showArchived, orderBy, orderDirection],
        queryFn: async () => {
            const params = {
                page,
                size: rowsPerPage,
                search: search || undefined,
                category: filterCategory || undefined,
                status: showArchived ? 'DISCONTINUED' : 'ACTIVE',
                sort: `${orderBy},${orderDirection}`
            };
            const response = await getProducts(params);
            return response.data || response;
        },
        keepPreviousData: true
    });

    const products = data?.content || [];
    const totalCount = data?.totalElements || 0;

    // Mutations
    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            handleCloseDialog();
            setDeleteDialogOpen(false);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const createMutation = useMutation({ mutationFn: createProduct, ...mutationOptions, onSuccess: () => { toast.success('Product created'); mutationOptions.onSuccess(); } });
    const updateMutation = useMutation({ mutationFn: (data) => updateProduct(editId, data), ...mutationOptions, onSuccess: () => { toast.success('Product updated'); mutationOptions.onSuccess(); } });
    const deleteMutation = useMutation({ mutationFn: deleteProduct, ...mutationOptions, onSuccess: () => { toast.success('Product deleted'); mutationOptions.onSuccess(); } });
    const importMutation = useMutation({
        mutationFn: importCsv,
        onSuccess: (res) => {
            const data = res.data || res;
            toast.success(`Imported ${data.imported} items. Summary: Total ${data.totalRows}, Updated ${data.skippedDuplicates}, Failed ${data.failedRows}`);
            queryClient.invalidateQueries(['products']);
        },
        onError: () => toast.error('Import failed')
    });

    const handleOpenDialog = (product = null) => {
        if (product) {
            setEditId(product.id);
            setFormData({
                name: product.name,
                category: product.category,
                unitPrice: product.unitPrice,
                bulkPrice: product.bulkPrice,
                purchasePrice: product.purchasePrice || 0,
                bulkQty: product.bulkQty,
                unitQty: product.unitQty,
                unitsPerBulk: product.unitsPerBulk,
                reorderLevel: product.reorderLevel || 10,
                status: product.status,
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

    const handleToggleStatus = (product) => {
        const nextStatus = product.status === 'ACTIVE' ? 'DISCONTINUED' : 'ACTIVE';
        updateMutation.mutate({ ...product, status: nextStatus }, {
            onSuccess: () => {
                toast.success(nextStatus === 'ACTIVE' ? 'Activated' : 'Deactivated');
                queryClient.invalidateQueries(['products']);
            }
        });
    };

    const handleSort = (property) => {
        const isAsc = orderBy === property && orderDirection === 'asc';
        setOrderDirection(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleImportCsv = (event) => {
        const file = event.target.files[0];
        if (file) importMutation.mutate(file);
        event.target.value = '';
    };

    const handleExportPDF = async () => {
        try {
            const status = showArchived ? 'DISCONTINUED' : 'ACTIVE';
            const { data } = await getInventoryReportPdf(status);
            downloadBlob(data, `Inventory_${status}_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success("Downloaded");
        } catch (error) { toast.error("Export failed"); }
    };

    const handleDownloadProductPdf = async (row) => {
        try {
            const { data } = await getProductDetailsPdf(row.id);
            downloadBlob(data, `Product_${row.publicId || row.id}.pdf`);
            toast.success("Product PDF downloaded");
        } catch (error) { toast.error("Download failed"); }
    };

    const formatCurrency = (val) => Number.isFinite(Number(val)) ? `₹${Number(val).toFixed(2)}` : '—';

    const columns = useMemo(() => [
        { id: 'publicId', label: 'ID', minWidth: 90, sortable: true },
        { id: 'name', label: 'Product Name', minWidth: 180, sortable: true },
        { id: 'category', label: 'Category', minWidth: 120, sortable: true },
        { id: 'purchasePrice', label: 'Purchase', minWidth: 100, align: 'right', sortable: true, render: (val) => formatCurrency(val) },
        { id: 'unitPrice', label: 'Unit Price', minWidth: 100, align: 'right', sortable: true, render: (val) => formatCurrency(val) },
        { id: 'unitQty', label: 'Stock', minWidth: 100, align: 'right', sortable: true },
        { id: 'reorderLevel', label: 'Reorder', minWidth: 100, align: 'right', sortable: true },
        {
            id: 'activeToggle', label: 'Active', minWidth: 90,
            render: (_, row) => <Switch checked={row.status === 'ACTIVE'} onChange={() => handleToggleStatus(row)} color="success" size="small" />
        },
        { id: 'status', label: 'Status', minWidth: 100, sortable: true, render: (val) => <StatusChip status={val} /> },
    ], []);

    return (
        <AnimatedContainer>
            <PageHeader
                title="Products" subtitle="Manage catalog and inventory"
                breadcrumbs={[{ label: 'Products', path: '/products' }]}
                actions={
                    <Stack direction="row" spacing={1}>
                        <input type="file" accept=".csv" style={{ display: 'none' }} id="csv-upload" onChange={handleImportCsv} />
                        <label htmlFor="csv-upload">
                            <Button variant="outlined" component="span" startIcon={importMutation.isLoading ? <CircularProgress size={20} /> : <FileUpload />} disabled={importMutation.isLoading}>Import</Button>
                        </label>
                        <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={handleExportPDF}>Report</Button>
                        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add Product</Button>
                    </Stack>
                }
            />

            <DashboardCard title="Inventory Management">
                <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth size="small" label="Search" placeholder="Name, ID"
                            value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <TextField
                            fullWidth size="small" label="Category" placeholder="Category"
                            value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(0); }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Switch checked={showArchived} onChange={(e) => { setShowArchived(e.target.checked); setPage(0); }} color="warning" size="small" />
                            <Typography variant="body2">{showArchived ? "Archived" : "Active Only"}</Typography>
                        </Stack>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Button startIcon={<Clear />} color="inherit" disabled={!search && !filterCategory && !showArchived} onClick={() => { setSearch(''); setFilterCategory(''); setShowArchived(false); setPage(0); }}>Clear</Button>
                    </Grid>
                </Grid>

                <DataTable
                    serverSide columns={columns} data={products} loading={isLoading}
                    totalCount={totalCount} page={page} rowsPerPage={rowsPerPage}
                    onPageChange={setPage} onRowsPerPageChange={setRowsPerPage}
                    orderBy={orderBy} orderDirection={orderDirection} onSortChange={handleSort}
                    actions={(row) => (
                        <Stack direction="row" spacing={0.5}>
                            <Tooltip title="View"><IconButton size="small" color="info" onClick={() => { setSelectedProduct(row); setDetailsOpen(true); }}><Visibility fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Print Data Sheet">
                                <IconButton size="small" color="secondary" onClick={() => handleDownloadProductPdf(row)}>
                                    <PictureAsPdf fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpenDialog(row)}><Edit fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { setDeleteId(row.id); setDeleteDialogOpen(true); }}><Delete fontSize="small" /></IconButton></Tooltip>
                        </Stack>
                    )}
                />
            </DashboardCard>

            <FormDialog
                open={dialogOpen} onClose={handleCloseDialog} onSubmit={handleSubmit}
                title={editId ? 'Edit Product' : 'Add Product'} loading={createMutation.isLoading || updateMutation.isLoading} maxWidth="md"
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Product Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required /></Grid>
                    <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Unit Price (₹)" value={formData.unitPrice} onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })} required /></Grid>
                    <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Bulk Price (₹)" value={formData.bulkPrice} onChange={(e) => setFormData({ ...formData, bulkPrice: parseFloat(e.target.value) })} required /></Grid>
                    <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Purchase Price (₹)" value={formData.purchasePrice} onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })} required /></Grid>
                    <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Unit Stock" value={formData.unitQty} onChange={(e) => setFormData({ ...formData, unitQty: parseInt(e.target.value) })} required /></Grid>
                    <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Bulk Stock" value={formData.bulkQty} onChange={(e) => setFormData({ ...formData, bulkQty: parseFloat(e.target.value) })} required /></Grid>
                    <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Units Per Bulk" value={formData.unitsPerBulk} onChange={(e) => setFormData({ ...formData, unitsPerBulk: parseInt(e.target.value) })} required /></Grid>
                    <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Reorder Level" value={formData.reorderLevel} onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) })} required /></Grid>
                    <Grid item xs={12} sm={8}><TextField select fullWidth label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} required><MenuItem value="ACTIVE">Active</MenuItem><MenuItem value="DISCONTINUED">Discontinued</MenuItem></TextField></Grid>
                </Grid>
            </FormDialog>

            <ConfirmDialog
                open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={() => deleteMutation.mutate(deleteId)}
                title="Delete Product" message="Archive this product? (Use deactivate instead if you want to keep records)." loading={deleteMutation.isLoading} severity="error"
            />

            <GenericDetailsDialog open={detailsOpen} onClose={() => setDetailsOpen(false)} data={selectedProduct} title="Product Details" />
        </AnimatedContainer>
    );
}


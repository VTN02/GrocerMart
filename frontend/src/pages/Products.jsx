import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, MenuItem, IconButton, Tooltip, Grid, Paper, FormControlLabel, Switch } from '@mui/material';
import { getProducts, createProduct, updateProduct, deleteProduct, importCsv } from '../api/productsApi';
import { toast } from 'react-toastify';
import { Add, Edit, Delete, Inventory, FileUpload, ContentCopy, CheckCircle, Warning } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import FormDialog from '../components/FormDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusChip from '../components/StatusChip';
import DashboardCard from '../components/DashboardCard';
import AnimatedContainer from '../components/AnimatedContainer';

const initialFormData = {
    name: '',
    category: '',
    unitPrice: 0,
    bulkPrice: 0,
    bulkQty: 0,
    unitQty: 0,
    unitsPerBulk: 1,
    status: 'ACTIVE',
};

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const [submitting, setSubmitting] = useState(false);

    // Filtering state
    const [filterCategory, setFilterCategory] = useState('');
    const [searchId, setSearchId] = useState('');
    const [importing, setImporting] = useState(false);
    const [showArchived, setShowArchived] = useState(false);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // If searching by ID, use the specific endpoint
            if (searchId) {
                const { data } = await getProducts({ id: searchId }); // The backend handles 'id' param in /api/products too now
                setProducts(Array.isArray(data) ? data : [data]);
            } else {
                const { data } = await getProducts({
                    category: filterCategory || undefined,
                    status: showArchived ? undefined : 'ACTIVE',
                    size: 100 // Get a larger set for client-side table
                });
                setProducts(Array.isArray(data) ? data : (data ? [data] : []));
            }
        } catch (error) {
            console.error(error);
            setProducts([]); // Clear on error
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => {
        const num = Number(val);
        if (Number.isFinite(num)) return `₹${num.toFixed(2)}`;
        return '—';
    };

    const formatNumber = (val) => {
        const num = Number(val);
        if (Number.isFinite(num)) return num.toLocaleString();
        return '—';
    };

    useEffect(() => {
        fetchProducts();
    }, [filterCategory, searchId, showArchived]);

    const handleOpenDialog = (product = null) => {
        if (product) {
            setEditId(product.id);
            setFormData({
                name: product.name,
                category: product.category,
                unitPrice: product.unitPrice,
                bulkPrice: product.bulkPrice,
                bulkQty: product.bulkQty,
                unitQty: product.unitQty,
                unitsPerBulk: product.unitsPerBulk,
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

    const handleImportCsv = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setImporting(true);
        try {
            const { data } = await importCsv(file);
            if (data && data.success) {
                const { imported, skippedDuplicates, failedRows, totalRows } = data;
                toast.success(
                    <div>
                        <strong>Import Summary:</strong>
                        <br /> Total: {totalRows}
                        <br /> Imported: {imported}
                        <br /> Updated: {skippedDuplicates}
                        <br /> Failed: {failedRows}
                    </div>,
                    { autoClose: 5000 }
                );
                fetchProducts();
            } else {
                toast.error(result.message || 'Import failed');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred during import');
        } finally {
            setImporting(false);
            event.target.value = ''; // Reset input
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editId) {
                await updateProduct(editId, formData);
                toast.success('Product updated successfully');
            } else {
                await createProduct(formData);
                toast.success('Product created successfully');
            }
            handleCloseDialog();
            fetchProducts();
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
            await deleteProduct(deleteId);
            toast.success('Product deleted successfully');
            setDeleteDialogOpen(false);
            setDeleteId(null);
            fetchProducts();
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (product) => {
        setSubmitting(true);
        try {
            const nextStatus = product.status === 'ACTIVE' ? 'DISCONTINUED' : 'ACTIVE';
            await updateProduct(product.id, {
                name: product.name,
                category: product.category,
                unitPrice: product.unitPrice,
                bulkPrice: product.bulkPrice,
                bulkQty: product.bulkQty,
                unitQty: product.unitQty,
                unitsPerBulk: product.unitsPerBulk,
                status: nextStatus,
            });
            toast.success(nextStatus === 'ACTIVE' ? 'Product activated' : 'Product deactivated');
            fetchProducts();
        } catch (error) {
            console.error(error);
            toast.error('Status update failed');
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        { id: 'id', label: 'ID', minWidth: 60 },
        { id: 'name', label: 'Product Name', minWidth: 180 },
        { id: 'category', label: 'Category', minWidth: 120 },
        { id: 'unitType', label: 'Unit Type', minWidth: 100 },
        {
            id: 'unitPrice',
            label: 'Unit Price',
            minWidth: 100,
            align: 'right',
            render: (val) => formatCurrency(val)
        },
        {
            id: 'bulkPrice',
            label: 'Bulk Price',
            minWidth: 100,
            align: 'right',
            render: (val) => formatCurrency(val)
        },
        {
            id: 'unitQty',
            label: 'Unit Stock',
            minWidth: 100,
            align: 'right',
            render: (val) => formatNumber(val)
        },
        {
            id: 'bulkQty',
            label: 'Bulk Stock',
            minWidth: 100,
            align: 'right',
            render: (val) => formatNumber(val)
        },
        {
            id: 'reorderLevel',
            label: 'Reorder Level',
            minWidth: 100,
            align: 'right',
            render: (val) => formatNumber(val)
        },
        {
            id: 'activeToggle',
            label: 'Active',
            minWidth: 90,
            render: (_val, row) => (
                <Switch
                    checked={row.status === 'ACTIVE'}
                    onChange={() => handleToggleStatus(row)}
                    disabled={submitting}
                    color="success"
                    size="small"
                />
            )
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
        <AnimatedContainer delay={0.1}>
            <PageHeader
                title="Products"
                subtitle="Manage your product catalog and inventory"
                breadcrumbs={[{ label: 'Products', path: '/products' }]}
                actions={
                    <Box display="flex" gap={1}>
                        <input
                            type="file"
                            accept=".csv"
                            style={{ display: 'none' }}
                            id="csv-upload-input"
                            onChange={handleImportCsv}
                        />
                        <label htmlFor="csv-upload-input">
                            <Button
                                variant="outlined"
                                component="span"
                                startIcon={importing ? <CircularProgress size={20} /> : <FileUpload />}
                                disabled={importing}
                            >
                                {importing ? 'Importing...' : 'Import CSV'}
                            </Button>
                        </label>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => handleOpenDialog()}
                        >
                            Add Product
                        </Button>
                    </Box>
                }
            />

            <DashboardCard title="Product List" subtitle="Search, filter, and manage your inventory items">
                {/* Filter Bar */}
                <Box mb={3} display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                        size="small"
                        label="Filter by Category"
                        placeholder="e.g. Rice, Grains"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        sx={{ width: 200 }}
                    />
                    <TextField
                        size="small"
                        label="Search by Product ID"
                        type="number"
                        placeholder="Enter ID"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        sx={{ width: 180 }}
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={showArchived}
                                onChange={(e) => setShowArchived(e.target.checked)}
                                color="warning"
                            />
                        }
                        label="Show Archived"
                    />

                    {(filterCategory || searchId || showArchived) && (
                        <Button
                            color="inherit"
                            onClick={() => { setFilterCategory(''); setSearchId(''); setShowArchived(false); }}
                        >
                            Clear Filters
                        </Button>
                    )}
                </Box>

                <DataTable
                    columns={columns}
                    data={products}
                    searchKey="name"
                    loading={loading}
                    emptyTitle="No products found"
                    emptyDescription="Start by adding your first product to the catalog."
                    emptyAction={
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => handleOpenDialog()}
                        >
                            Add First Product
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
                title={editId ? 'Edit Product' : 'Add New Product'}
                subtitle={editId ? 'Update product information' : 'Enter product details'}
                loading={submitting}
                maxWidth="md"
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Product Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            disabled={submitting}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                            disabled={submitting}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Unit Price (₹)"
                            value={formData.unitPrice}
                            onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                            required
                            disabled={submitting}
                            inputProps={{ min: 0, step: 0.01 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Bulk Price (₹)"
                            value={formData.bulkPrice}
                            onChange={(e) => setFormData({ ...formData, bulkPrice: parseFloat(e.target.value) })}
                            required
                            disabled={submitting}
                            inputProps={{ min: 0, step: 0.01 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Unit Quantity"
                            value={formData.unitQty}
                            onChange={(e) => setFormData({ ...formData, unitQty: parseInt(e.target.value) })}
                            required
                            disabled={submitting}
                            inputProps={{ min: 0 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Bulk Quantity"
                            value={formData.bulkQty}
                            onChange={(e) => setFormData({ ...formData, bulkQty: parseFloat(e.target.value) })}
                            required
                            disabled={submitting}
                            inputProps={{ min: 0, step: 0.01 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Units Per Bulk"
                            value={formData.unitsPerBulk}
                            onChange={(e) => setFormData({ ...formData, unitsPerBulk: parseInt(e.target.value) })}
                            required
                            disabled={submitting}
                            inputProps={{ min: 1 }}
                            helperText="How many units in one bulk item"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            select
                            label="Status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            required
                            disabled={submitting}
                        >
                            <MenuItem value="ACTIVE">Active</MenuItem>
                            <MenuItem value="DISCONTINUED">Discontinued</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </FormDialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Delete Product"
                message="Are you sure you want to delete this product? This action cannot be undone."
                confirmText="Delete"
                severity="error"
                loading={submitting}
            />
        </AnimatedContainer>
    );
}

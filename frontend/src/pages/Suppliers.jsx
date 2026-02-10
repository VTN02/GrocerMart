import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, IconButton, Tooltip, Grid, Paper, FormControlLabel, Switch, MenuItem } from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api/suppliersApi';
import { toast } from 'react-toastify';
import { PageHeader, DataTable, FormDialog, ConfirmDialog, StatusChip } from '../components';

const initialFormData = {
    name: '',
    phone: '',
    address: '',
    email: '',
    status: 'ACTIVE'
};

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const [submitting, setSubmitting] = useState(false);
    const [searchId, setSearchId] = useState('');
    const [showArchived, setShowArchived] = useState(false);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const { data } = await getSuppliers({
                id: searchId || undefined,
                status: showArchived ? 'INACTIVE' : 'ACTIVE'
            });
            setSuppliers(Array.isArray(data) ? data : [data]);
        } catch (e) {
            console.error(e);
            setSuppliers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, [searchId, showArchived]);

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
                await updateSupplier(editId, formData);
                toast.success('Supplier updated successfully');
            } else {
                await createSupplier(formData);
                toast.success('Supplier created successfully');
            }
            handleCloseDialog();
            fetchSuppliers();
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
            await deleteSupplier(deleteId);
            toast.success('Supplier deleted successfully');
            setDeleteDialogOpen(false);
            setDeleteId(null);
            fetchSuppliers();
        } catch (e) {
            console.error(e);
            toast.error('Delete failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (supplier) => {
        setSubmitting(true);
        try {
            const nextStatus = supplier.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            await updateSupplier(supplier.id, {
                name: supplier.name,
                phone: supplier.phone || '',
                address: supplier.address || '',
                email: supplier.email || '',
                status: nextStatus,
            });
            toast.success(nextStatus === 'ACTIVE' ? 'Supplier activated' : 'Supplier deactivated');
            fetchSuppliers();
        } catch (e) {
            console.error(e);
            toast.error('Status update failed');
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        { id: 'id', label: 'ID', minWidth: 60 },
        { id: 'name', label: 'Supplier Name', minWidth: 180 },
        { id: 'phone', label: 'Phone', minWidth: 120 },
        { id: 'address', label: 'Address', minWidth: 180 },
        { id: 'email', label: 'Email', minWidth: 150 },
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
        <Box>
            <PageHeader
                title="Suppliers"
                subtitle="Manage vendors and suppliers"
                breadcrumbs={[{ label: 'Suppliers', path: '/suppliers' }]}
                actions={
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                    >
                        Add Supplier
                    </Button>
                }
            />

            {/* Filter Bar */}
            <Box mb={3} display="flex" gap={2} p={2} component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <TextField
                    size="small"
                    label="Search by Supplier ID"
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

                <Box flexGrow={1} />

                <FormControlLabel
                    control={
                        <Switch
                            checked={showArchived}
                            onChange={(e) => setShowArchived(e.target.checked)}
                            color="warning"
                        />
                    }
                    label="Show Inactive"
                />
            </Box>

            <DataTable
                columns={columns}
                data={suppliers}
                searchKey="name"
                loading={loading}
                emptyTitle="No suppliers found"
                emptyDescription="Start by adding your first supplier."
                emptyAction={
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleOpenDialog}
                    >
                        Add First Supplier
                    </Button>
                }
                actions={(row) => (
                    <>
                        <Tooltip title="Edit">
                            <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(row)}
                            >
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

            {/* Create Dialog */}
            <FormDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                onSubmit={handleSubmit}
                title={editId ? "Edit Supplier" : "Add New Supplier"}
                subtitle={editId ? "Update supplier details" : "Enter supplier details"}
                loading={submitting}
                maxWidth="sm"
            >
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Supplier Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            disabled={submitting}
                            autoFocus
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            disabled={submitting}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                            select
                            label="Status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            required
                            disabled={submitting}
                        >
                            <MenuItem value="ACTIVE">Active</MenuItem>
                            <MenuItem value="INACTIVE">Inactive</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </FormDialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Delete Supplier"
                message="Are you sure you want to delete this supplier? This action cannot be undone."
                confirmText="Delete"
                severity="error"
                loading={submitting}
            />
        </Box>
    );
}

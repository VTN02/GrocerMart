import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, MenuItem, Paper, Tooltip } from '@mui/material';
import { Add, Visibility } from '@mui/icons-material';
import { getPOs, createPO } from '../api/purchaseOrdersApi';
import { getSuppliers } from '../api/suppliersApi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PageHeader, DataTable, FormDialog, StatusChip } from '../components';

export default function PurchaseOrders() {
    const [pos, setPos] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [supplierId, setSupplierId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [searchId, setSearchId] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [poRes, supRes] = await Promise.all([
                getPOs(searchId ? { id: searchId } : undefined),
                getSuppliers()
            ]);
            setPos(Array.isArray(poRes.data) ? poRes.data : (poRes.data ? [poRes.data] : []));
            setSuppliers(Array.isArray(supRes.data) ? supRes.data : (supRes.data ? [supRes.data] : []));
        } catch (e) {
            console.error(e);
            setPos([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [searchId]);

    const handleOpenDialog = () => {
        setSupplierId('');
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSupplierId('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await createPO({ supplierId });
            toast.success('Purchase order created successfully');
            handleCloseDialog();
            fetchData();
        } catch (e) {
            console.error(e);
            toast.error('Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (val) => {
        const num = Number(val);
        if (Number.isFinite(num)) return `₹${num.toFixed(2)}`;
        return '—';
    };

    // Enhance PO data with Supplier Name
    const enrichedPos = pos.map(p => ({
        ...p,
        supplierName: suppliers.find(s => s.id === p.supplierId)?.name || p.supplierId
    }));

    const columns = [
        { id: 'id', label: 'PO ID', minWidth: 60 },
        { id: 'supplierId', label: 'Supplier ID', minWidth: 100 },
        { id: 'supplierName', label: 'Supplier', minWidth: 180 },
        {
            id: 'poDate',
            label: 'PO Date',
            minWidth: 120,
            render: (val) => new Date(val).toLocaleString()
        },
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
                title="Purchase Orders"
                subtitle="Manage supplier purchase orders"
                breadcrumbs={[{ label: 'Purchase Orders', path: '/purchase-orders' }]}
                actions={
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleOpenDialog}
                    >
                        New PO
                    </Button>
                }
            />

            {/* Filter Bar */}
            <Box mb={3} display="flex" gap={2} p={2} component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <TextField
                    size="small"
                    label="Search by PO ID"
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
                data={enrichedPos}
                searchKey="supplierName"
                loading={loading}
                emptyTitle="No purchase orders found"
                emptyDescription="Start by creating your first purchase order."
                emptyAction={
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleOpenDialog}
                    >
                        Create First PO
                    </Button>
                }
                actions={(row) => (
                    <Tooltip title="View Details">
                        <Button
                            component={Link}
                            to={`/purchase-orders/${row.id}/items`}
                            startIcon={<Visibility />}
                            size="small"
                            variant="outlined"
                        >
                            Details
                        </Button>
                    </Tooltip>
                )}
            />

            {/* Create Dialog */}
            <FormDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                onSubmit={handleSubmit}
                title="Create Purchase Order"
                subtitle="Select supplier to create a new PO"
                loading={submitting}
                submitText="Create Draft"
                maxWidth="xs"
            >
                <TextField
                    fullWidth
                    select
                    label="Supplier"
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    required
                    disabled={submitting}
                    autoFocus
                    helperText="Select the supplier for this purchase order"
                >
                    {suppliers.map(s => (
                        <MenuItem key={s.id} value={s.id}>
                            {s.name}
                        </MenuItem>
                    ))}
                </TextField>
            </FormDialog>
        </Box>
    );
}

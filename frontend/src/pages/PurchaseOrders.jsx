import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, MenuItem, Paper, Tooltip, IconButton, Autocomplete } from '@mui/material';
import { Add, Visibility, PictureAsPdf } from '@mui/icons-material';
import { getPOs, createPO } from '../api/purchaseOrdersApi';
import { getSuppliers } from '../api/suppliersApi';
import { getPurchaseOrderReportPdf, getPurchaseOrderPdf, downloadBlob } from '../api/reportsApi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PageHeader, DataTable, FormDialog, StatusChip, DashboardCard, AnimatedContainer } from '../components';

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
            const params = {};
            if (searchId) {
                if (isNaN(searchId)) {
                    params.publicId = searchId;
                } else {
                    params.id = searchId;
                }
            }
            const [poRes, supRes] = await Promise.all([
                getPOs(params),
                getSuppliers({ size: 1000 })
            ]);

            const poData = poRes.data?.content || (Array.isArray(poRes.data) ? poRes.data : []);
            const supData = supRes.data?.content || (Array.isArray(supRes.data) ? supRes.data : []);

            setPos(poData);
            setSuppliers(supData);
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

    const handleExportAll = async () => {
        try {
            const { data } = await getPurchaseOrderReportPdf(null, null);
            downloadBlob(data, `Purchase_Orders_Report_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success("Purchase orders report downloaded");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate report");
        }
    };

    const handleDownloadPoPdf = async (id) => {
        try {
            const { data } = await getPurchaseOrderPdf(id);
            downloadBlob(data, `Purchase_Order_${id}.pdf`);
            toast.success("Purchase Order PDF downloaded");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate PO PDF");
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
        { id: 'publicId', label: 'ID', minWidth: 90 },
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
        <AnimatedContainer delay={0.1}>
            <PageHeader
                title="Purchase Orders"
                subtitle="Manage supplier purchase orders"
                breadcrumbs={[{ label: 'Purchase Orders', path: '/purchase-orders' }]}
                actions={
                    <Box display="flex" gap={1}>
                        <Button
                            variant="outlined"
                            startIcon={<PictureAsPdf />}
                            onClick={handleExportAll}
                        >
                            Export List
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={handleOpenDialog}
                        >
                            New PO
                        </Button>
                    </Box>
                }
            />

            <DashboardCard title="PO Management" subtitle="Create and track supplier orders">
                {/* Filter Bar */}
                <Box mb={3} display="flex" gap={2} alignItems="center">
                    <TextField
                        size="small"
                        label="Search by PO ID"
                        type="text"
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
                        <>
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
                            <Tooltip title="Print PO">
                                <IconButton
                                    size="small"
                                    color="secondary"
                                    onClick={() => handleDownloadPoPdf(row.id)}
                                >
                                    <PictureAsPdf fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                />
            </DashboardCard>

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
                <Autocomplete
                    fullWidth
                    options={suppliers}
                    getOptionLabel={(option) => `${option.name} (${option.publicId})`}
                    value={suppliers.find(s => s.id === supplierId) || null}
                    onChange={(event, newValue) => {
                        setSupplierId(newValue ? newValue.id : '');
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Supplier"
                            required
                            error={!supplierId && submitting}
                            helperText="Search and select a supplier"
                        />
                    )}
                    disabled={submitting}
                    autoHighlight
                />
            </FormDialog>
        </AnimatedContainer>
    );
}

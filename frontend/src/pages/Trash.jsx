import React, { useState } from 'react';
import {
    Box, Tabs, Tab, Tooltip, IconButton, Chip, Typography,
    useTheme, Button
} from '@mui/material';
import {
    RestoreFromTrash, DeleteForever,
    People, Inventory, LocalShipping, CreditCard,
    Warning
} from '@mui/icons-material';
import { format } from 'date-fns';
import {
    AnimatedContainer,
    DashboardCard,
    DataTable,
    ConfirmDialog
} from '../components';
import {
    useDeletedUsers, useRestoreUser, useDeleteUserPermanent,
    useDeletedProducts, useRestoreProduct, useDeleteProductPermanent,
    useDeletedSuppliers, useRestoreSupplier, useDeleteSupplierPermanent,
    useDeletedCustomers, useRestoreCustomer, useDeleteCustomerPermanent
} from '../hooks/useTrash';

export default function Trash() {
    const theme = useTheme();
    const [tabIndex, setTabIndex] = useState(0);

    // Confirmation States
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmType, setConfirmType] = useState(null); // 'restore' or 'delete'
    const [selectedItem, setSelectedItem] = useState(null);

    // Hooks for each entity
    const usersQuery = useDeletedUsers();
    const productsQuery = useDeletedProducts();
    const suppliersQuery = useDeletedSuppliers();
    const customersQuery = useDeletedCustomers();

    // Mutation Hooks
    const restoreUser = useRestoreUser();
    const deleteUser = useDeleteUserPermanent();
    const restoreProduct = useRestoreProduct();
    const deleteProduct = useDeleteProductPermanent();
    const restoreSupplier = useRestoreSupplier();
    const deleteSupplier = useDeleteSupplierPermanent();
    const restoreCustomer = useRestoreCustomer();
    const deleteCustomer = useDeleteCustomerPermanent();

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const handleAction = (type, item) => {
        setSelectedItem(item);
        setConfirmType(type);
        setConfirmOpen(true);
    };

    const handleConfirm = async () => {
        if (!selectedItem || !confirmType) return;

        let mutation;
        let query;

        // Determine mutation and query
        if (tabIndex === 0) {
            mutation = confirmType === 'restore' ? restoreUser : deleteUser;
            query = usersQuery;
        } else if (tabIndex === 1) {
            mutation = confirmType === 'restore' ? restoreProduct : deleteProduct;
            query = productsQuery;
        } else if (tabIndex === 2) {
            mutation = confirmType === 'restore' ? restoreSupplier : deleteSupplier;
            query = suppliersQuery;
        } else if (tabIndex === 3) {
            mutation = confirmType === 'restore' ? restoreCustomer : deleteCustomer;
            query = customersQuery;
        }

        if (mutation) {
            try {
                // Use deletedId for operations
                await mutation.mutateAsync(selectedItem.deletedId);

                // Refresh data
                if (query && query.refetch) {
                    await query.refetch();
                }

                setConfirmOpen(false);
                setSelectedItem(null);
            } catch (error) {
                console.error("Operation failed:", error);
            }
        }
    };

    const getColumns = () => [
        { id: 'entityName', label: 'Item Name', minWidth: 200 },
        { id: 'originalId', label: 'Original ID', minWidth: 100 },
        { id: 'reason', label: 'Deletion Reason', minWidth: 150 },
        {
            id: 'deletedAt',
            label: 'Deleted At',
            minWidth: 180,
            render: (value) => value ? format(new Date(value), 'PPpp') : '-'
        },
        {
            id: 'status',
            label: 'Status',
            minWidth: 120,
            render: () => (
                <Chip
                    label="Deleted"
                    color="error"
                    size="small"
                    variant="outlined"
                />
            )
        }
    ];

    const getCurrentData = () => {
        switch (tabIndex) {
            case 0: return usersQuery.data || [];
            case 1: return productsQuery.data || [];
            case 2: return suppliersQuery.data || [];
            case 3: return customersQuery.data || [];
            default: return [];
        }
    };

    const getCurrentLoading = () => {
        switch (tabIndex) {
            case 0: return usersQuery.isLoading;
            case 1: return productsQuery.isLoading;
            case 2: return suppliersQuery.isLoading;
            case 3: return customersQuery.isLoading;
            default: return false;
        }
    };

    const getTabIcon = (index) => {
        switch (index) {
            case 0: return <People fontSize="small" />;
            case 1: return <Inventory fontSize="small" />;
            case 2: return <LocalShipping fontSize="small" />;
            case 3: return <CreditCard fontSize="small" />;
            default: return null;
        }
    };

    const getEntityName = () => {
        switch (tabIndex) {
            case 0: return 'User';
            case 1: return 'Product';
            case 2: return 'Supplier';
            case 3: return 'Credit Customer';
            default: return 'Item';
        }
    };

    return (
        <AnimatedContainer>
            <Box mb={4}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Trash / Recycle Bin 🗑️
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage deleted items. You can restore them or permanently delete them.
                </Typography>
            </Box>

            <DashboardCard>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs
                        value={tabIndex}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        textColor="primary"
                        indicatorColor="primary"
                    >
                        <Tab icon={<People />} label="Users" iconPosition="start" />
                        <Tab icon={<Inventory />} label="Products" iconPosition="start" />
                        <Tab icon={<LocalShipping />} label="Suppliers" iconPosition="start" />
                        <Tab icon={<CreditCard />} label="Credit Customers" iconPosition="start" />
                    </Tabs>
                </Box>

                <DataTable
                    columns={getColumns()}
                    data={getCurrentData()}
                    loading={getCurrentLoading()}
                    searchKey="entityName"
                    emptyTitle={`No deleted ${getEntityName().toLowerCase()}s`}
                    emptyDescription={`Trash is empty for ${getEntityName().toLowerCase()}s.`}
                    actions={(row) => (
                        <>
                            <Tooltip title="Restore">
                                <IconButton
                                    color="success"
                                    onClick={() => handleAction('restore', row)}
                                >
                                    <RestoreFromTrash />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Permanently">
                                <IconButton
                                    color="error"
                                    onClick={() => handleAction('delete', row)}
                                >
                                    <DeleteForever />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                />
            </DashboardCard>

            <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirm}
                title={confirmType === 'restore' ? `Restore ${getEntityName()}?` : `Permanently Delete ${getEntityName()}?`}
                message={
                    confirmType === 'restore'
                        ? `Are you sure you want to restore "${selectedItem?.entityName}"? It will be moved back to the active list.`
                        : `Are you sure you want to permanently delete "${selectedItem?.entityName}"? This action cannot be undone.`
                }
                confirmText={confirmType === 'restore' ? "Restore" : "Delete Forever"}
                severity={confirmType === 'restore' ? "info" : "error"}
            />
        </AnimatedContainer>
    );
}

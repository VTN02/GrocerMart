import React, { useState } from 'react';
import {
    Box, Tabs, Tab, Tooltip, IconButton, Chip, Typography,
    useTheme
} from '@mui/material';
import {
    RestoreFromTrash, DeleteForever,
    People, Inventory, LocalShipping, CreditCard,
    Receipt, PointOfSale, AccountBalance
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
    useDeletedCustomers, useRestoreCustomer, useDeleteCustomerPermanent,
    useDeletedOrders, useRestoreOrder, useDeleteOrderPermanent,
    useDeletedSales, useRestoreSale, useDeleteSalePermanent,
    useDeletedCheques, useRestoreCheque, useDeleteChequePermanent
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
    const ordersQuery = useDeletedOrders();
    const salesQuery = useDeletedSales();
    const chequesQuery = useDeletedCheques();

    // Mutation Hooks
    const restoreUser = useRestoreUser();
    const deleteUser = useDeleteUserPermanent();
    const restoreProduct = useRestoreProduct();
    const deleteProduct = useDeleteProductPermanent();
    const restoreSupplier = useRestoreSupplier();
    const deleteSupplier = useDeleteSupplierPermanent();
    const restoreCustomer = useRestoreCustomer();
    const deleteCustomer = useDeleteCustomerPermanent();
    const restoreOrder = useRestoreOrder();
    const deleteOrder = useDeleteOrderPermanent();
    const restoreSale = useRestoreSale();
    const deleteSale = useDeleteSalePermanent();
    const restoreCheque = useRestoreCheque();
    const deleteCheque = useDeleteChequePermanent();

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const handleAction = (type, item) => {
        setSelectedItem(item);
        setConfirmType(type);
        setConfirmOpen(true);
    };

    const handleConfirm = async () => {
        if (!selectedItem || !confirmType || !selectedItem.id) return; // Use 'id' from DTO which is deletedId

        let mutation;
        let query;

        // Determine mutation and query
        // Order of tabs: Users, Products, Suppliers, Customers, Orders, Sales, Cheques
        switch (tabIndex) {
            case 0: // Users
                mutation = confirmType === 'restore' ? restoreUser : deleteUser;
                query = usersQuery;
                break;
            case 1: // Products
                mutation = confirmType === 'restore' ? restoreProduct : deleteProduct;
                query = productsQuery;
                break;
            case 2: // Suppliers
                mutation = confirmType === 'restore' ? restoreSupplier : deleteSupplier;
                query = suppliersQuery;
                break;
            case 3: // Credit Customers
                mutation = confirmType === 'restore' ? restoreCustomer : deleteCustomer;
                query = customersQuery;
                break;
            case 4: // Orders
                mutation = confirmType === 'restore' ? restoreOrder : deleteOrder;
                query = ordersQuery;
                break;
            case 5: // Sales
                mutation = confirmType === 'restore' ? restoreSale : deleteSale;
                query = salesQuery;
                break;
            case 6: // Cheques
                mutation = confirmType === 'restore' ? restoreCheque : deleteCheque;
                query = chequesQuery;
                break;
            default:
                break;
        }

        if (mutation) {
            try {
                // Use 'id' which corresponds to the ID in the deleted table
                await mutation.mutateAsync(selectedItem.id);

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
        { id: 'name', label: 'Item Name / ID', minWidth: 180 },
        { id: 'description', label: 'Details', minWidth: 200, render: (val) => val || '—' },
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
            case 4: return ordersQuery.data || [];
            case 5: return salesQuery.data || [];
            case 6: return chequesQuery.data || [];
            default: return [];
        }
    };

    const getCurrentLoading = () => {
        switch (tabIndex) {
            case 0: return usersQuery.isLoading;
            case 1: return productsQuery.isLoading;
            case 2: return suppliersQuery.isLoading;
            case 3: return customersQuery.isLoading;
            case 4: return ordersQuery.isLoading;
            case 5: return salesQuery.isLoading;
            case 6: return chequesQuery.isLoading;
            default: return false;
        }
    };

    const getEntityName = () => {
        switch (tabIndex) {
            case 0: return 'User';
            case 1: return 'Product';
            case 2: return 'Supplier';
            case 3: return 'Credit Customer';
            case 4: return 'Order';
            case 5: return 'Sale';
            case 6: return 'Cheque';
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
                        <Tab icon={<CreditCard />} label="Credit Cust." iconPosition="start" />
                        <Tab icon={<Receipt />} label="Orders" iconPosition="start" />
                        <Tab icon={<PointOfSale />} label="Sales" iconPosition="start" />
                        <Tab icon={<AccountBalance />} label="Cheques" iconPosition="start" />
                    </Tabs>
                </Box>

                <DataTable
                    columns={getColumns()}
                    data={getCurrentData()}
                    loading={getCurrentLoading()}
                    searchKey="name"
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
                        ? `Are you sure you want to restore "${selectedItem?.name}"? It will be moved back to the active list.`
                        : `Are you sure you want to permanently delete "${selectedItem?.name}"? This action cannot be undone.`
                }
                confirmText={confirmType === 'restore' ? "Restore" : "Delete Forever"}
                severity={confirmType === 'restore' ? "info" : "error"}
            />
        </AnimatedContainer>
    );
}

import React, { useEffect, useState } from 'react';
import {
    Box, Button, IconButton, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, Typography, MenuItem, Grid, Autocomplete
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder, addOrderItem, confirmOrder } from '../api/ordersApi';
import { getProducts } from '../api/productsApi';
import { toast } from 'react-toastify';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import { getCustomerBalance } from '../api/creditCustomersApi';
import { getInvoicePdf, downloadBlob } from '../api/reportsApi';
import { PageHeader, StatusChip, DashboardCard, AnimatedContainer } from '../components';
import { PictureAsPdf } from '@mui/icons-material';

export default function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [products, setProducts] = useState([]);
    const [customerBalance, setCustomerBalance] = useState(null);
    const [itemData, setItemData] = useState({ productId: '', qty: 1, unitPrice: 0 });

    const fetchData = async () => {
        try {
            const oRes = await getOrder(id);
            const currentOrder = oRes.data;
            setOrder(currentOrder);

            if (currentOrder.paymentType === 'CREDIT' && currentOrder.creditCustomerId) {
                const bRes = await getCustomerBalance(currentOrder.creditCustomerId);
                setCustomerBalance(bRes.data);
            }

            const pRes = await getProducts({ size: 1000 });
            const pData = pRes.data || pRes;
            setProducts(Array.isArray(pData) ? pData : (pData.content || []));
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchData(); }, [id]);

    const handleAddItem = async () => {
        try {
            await addOrderItem(id, itemData);
            toast.success("Item Added");
            setItemData({ ...itemData, qty: 1, unitPrice: 0 });
            fetchData();
        } catch (e) { toast.error("Failed to add item"); }
    };

    const handleConfirm = async () => {
        try {
            await confirmOrder(id);
            toast.success("Order Confirmed");
            fetchData();
        } catch (e) {
            const msg = e.response?.data?.message || "Error confirming order";
            toast.error(msg);
        }
    };

    const handleDownloadInvoice = async () => {
        try {
            const res = await getInvoicePdf(id);
            downloadBlob(res.data, `Invoice_${order.invoiceNo}.pdf`);
            toast.success("Invoice downloaded");
        } catch (e) {
            toast.error("Download failed");
        }
    };

    const isLimitExceeded = () => {
        if (!order || order.paymentType !== 'CREDIT' || !customerBalance) return false;
        const total = order.totalAmount || 0;
        return total > customerBalance.availableCredit;
    };

    if (!order) return <Typography>Loading...</Typography>;

    return (
        <AnimatedContainer delay={0.1}>
            <PageHeader
                title={`Invoice #${order.invoiceNo}`}
                subtitle={`Date: ${new Date(order.orderDate).toLocaleDateString()}`}
                breadcrumbs={[
                    { label: 'Orders', path: '/orders' },
                    { label: `Invoice #${order.invoiceNo}` }
                ]}
                actions={
                    <Box display="flex" gap={2} alignItems="center">
                        <StatusChip status={order.status} />
                        {order.status !== 'DRAFT' && (
                            <Button
                                variant="outlined"
                                startIcon={<PictureAsPdf />}
                                onClick={handleDownloadInvoice}
                            >
                                Print Invoice
                            </Button>
                        )}
                        {order.status === 'DRAFT' && (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<CheckIcon />}
                                onClick={handleConfirm}
                                disabled={isLimitExceeded()}
                            >
                                {isLimitExceeded() ? "Limit Exceeded" : "Confirm Order"}
                            </Button>
                        )}
                    </Box>
                }
            />

            {order.paymentType === 'CREDIT' && customerBalance && (
                <Box mb={3}>
                    <DashboardCard title="Credit Info" sx={{ bgcolor: 'action.hover' }}>
                        <Grid container spacing={2}>
                            <Grid item xs={4}>
                                <Typography variant="caption" color="text.secondary">Customer</Typography>
                                <Typography variant="body1" fontWeight={600}>{order.creditCustomerName}</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="caption" color="text.secondary">Credit Limit</Typography>
                                <Typography variant="body1" fontWeight={600}>₹{(customerBalance.creditLimit || 0).toFixed(2)}</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="caption" color="text.secondary">Available Credit</Typography>
                                <Typography variant="body1" fontWeight={600} color={isLimitExceeded() ? 'error.main' : 'success.main'}>
                                    ₹{(customerBalance.availableCredit || 0).toFixed(2)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </DashboardCard>
                </Box>
            )}

            <Grid container spacing={3}>
                {order.status === 'DRAFT' && (
                    <Grid item xs={12}>
                        <DashboardCard title="Add Item" subtitle="Add products to this order">
                            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                                <Autocomplete
                                    fullWidth
                                    options={products}
                                    getOptionLabel={(p) => `${p.name} (Stock: ${p.unitQty}) - ₹${p.unitPrice}`}
                                    value={products.find(p => p.id === itemData.productId) || null}
                                    onChange={(e, newVal) => {
                                        setItemData({
                                            ...itemData,
                                            productId: newVal ? newVal.id : '',
                                            unitPrice: newVal ? newVal.unitPrice : 0
                                        });
                                    }}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Product" required />
                                    )}
                                    sx={{ minWidth: 400, flexGrow: 1 }}
                                    autoHighlight
                                />
                                <TextField
                                    type="number"
                                    label="Qty"
                                    value={itemData.qty}
                                    onChange={(e) => setItemData({ ...itemData, qty: parseInt(e.target.value) })}
                                    sx={{ width: 100 }}
                                />
                                <TextField
                                    type="number"
                                    label="Unit Price"
                                    value={itemData.unitPrice}
                                    onChange={(e) => setItemData({ ...itemData, unitPrice: parseFloat(e.target.value) })}
                                    sx={{ width: 150 }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleAddItem}
                                    size="large"
                                    sx={{ height: 56 }}
                                >
                                    Add
                                </Button>
                            </Box>
                        </DashboardCard>
                    </Grid>
                )}

                <Grid item xs={12}>
                    <DashboardCard title="Order Items" subtitle="List of products in this order">
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Product</TableCell>
                                        <TableCell align="right">Qty</TableCell>
                                        <TableCell align="right">Unit Price</TableCell>
                                        <TableCell align="right">Line Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {order.items?.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{products.find(p => p.id === item.productId)?.name || item.productId}</TableCell>
                                            <TableCell align="right">{item.qty}</TableCell>
                                            <TableCell align="right">{(item.unitPrice || 0).toFixed(2)}</TableCell>
                                            <TableCell align="right">{(item.lineTotal || 0).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={3} align="right"><Typography variant="h6">Total Amount</Typography></TableCell>
                                        <TableCell align="right"><Typography variant="h6" color="primary">{order.totalAmount?.toFixed(2)}</Typography></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DashboardCard>
                </Grid>
            </Grid>
        </AnimatedContainer>
    );
}

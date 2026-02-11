import React, { useEffect, useState } from 'react';
import {
    Box, Button, IconButton, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, Typography, MenuItem, Grid
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder, addOrderItem, confirmOrder } from '../api/ordersApi';
import { getProducts } from '../api/productsApi';
import { toast } from 'react-toastify';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import { PageHeader, StatusChip, DashboardCard, AnimatedContainer } from '../components';

export default function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [products, setProducts] = useState([]);
    const [itemData, setItemData] = useState({ productId: '', qty: 1, unitPrice: 0 });

    const fetchData = async () => {
        try {
            const oRes = await getOrder(id);
            setOrder(oRes.data);
            const pRes = await getProducts();
            setProducts(Array.isArray(pRes.data) ? pRes.data : []);
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
        } catch (e) { toast.error("Error confirming order"); }
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
                        {order.status === 'DRAFT' && (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<CheckIcon />}
                                onClick={handleConfirm}
                            >
                                Confirm Order
                            </Button>
                        )}
                    </Box>
                }
            />

            <Grid container spacing={3}>
                {order.status === 'DRAFT' && (
                    <Grid item xs={12}>
                        <DashboardCard title="Add Item" subtitle="Add products to this order">
                            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                                <TextField
                                    select
                                    label="Product"
                                    value={itemData.productId}
                                    onChange={(e) => setItemData({ ...itemData, productId: e.target.value })}
                                    sx={{ minWidth: 200, flexGrow: 1 }}
                                >
                                    {products.map(p => (
                                        <MenuItem key={p.id} value={p.id}>
                                            {p.name} (Qty: {p.unitQty})
                                        </MenuItem>
                                    ))}
                                </TextField>
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
                                            <TableCell align="right">{item.unitPrice.toFixed(2)}</TableCell>
                                            <TableCell align="right">{item.lineTotal.toFixed(2)}</TableCell>
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

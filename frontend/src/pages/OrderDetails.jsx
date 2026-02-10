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
import PageHeader from '../components/PageHeader';
import StatusChip from '../components/StatusChip';

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
            const product = products.find(p => p.id === itemData.productId);
            if (product && itemData.unitPrice === 0) {
                // Auto-fetch price logic could be here if product had price, 
                // for now user enters it manually as per backend requirement
            }
            await addOrderItem(id, itemData);
            toast.success("Item Added");
            setItemData({ ...itemData, qty: 1, unitPrice: 0 }); // keep productId maybe?
            fetchData();
        } catch (e) { console.error(e); }
    };

    const handleConfirm = async () => {
        try {
            await confirmOrder(id);
            toast.success("Order Confirmed");
            fetchData();
        } catch (e) { window.alert(e.response?.data?.message || "Error confirming"); }
    };

    if (!order) return <Typography>Loading...</Typography>;

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={2} gap={2}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/orders')}>Back</Button>
                <Box flexGrow={1}>
                    <PageHeader title={`Invoice #${order.invoiceNo}`} subtitle={`Date: ${new Date(order.orderDate).toLocaleDateString()}`} />
                </Box>
                <StatusChip status={order.status} />
                {order.status === 'DRAFT' &&
                    <Button variant="contained" color="success" startIcon={<CheckIcon />} onClick={handleConfirm} size="large">
                        Confirm Order
                    </Button>
                }
            </Box>

            {order.status === 'DRAFT' && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" mb={2}>Add Item</Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={5}>
                            <TextField select fullWidth label="Product" value={itemData.productId} onChange={(e) => setItemData({ ...itemData, productId: e.target.value })}>
                                {products.map(p => <MenuItem key={p.id} value={p.id}>{p.name} (Qty: {p.unitQty})</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <TextField fullWidth type="number" label="Qty" value={itemData.qty} onChange={(e) => setItemData({ ...itemData, qty: parseInt(e.target.value) })} />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField fullWidth type="number" label="Unit Price" value={itemData.unitPrice} onChange={(e) => setItemData({ ...itemData, unitPrice: parseFloat(e.target.value) })} />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Button fullWidth variant="contained" size="large" onClick={handleAddItem}>Add</Button>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            <TableContainer component={Paper}>
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
        </Box>
    );
}

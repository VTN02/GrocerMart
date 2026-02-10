import React, { useEffect, useState } from 'react';
import {
    Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TextField, Typography, MenuItem, Grid
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { addItem, receivePO } from '../api/purchaseOrdersApi'; // assuming these exist
import api from '../api/axios';
import { getProducts } from '../api/productsApi';
import { toast } from 'react-toastify';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import PageHeader from '../components/PageHeader';
import StatusChip from '../components/StatusChip';

export default function PurchaseOrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [po, setPo] = useState(null);
    const [products, setProducts] = useState([]);
    const [itemData, setItemData] = useState({ productId: '', qty: 1, unitCost: 0 });

    const fetchData = async () => {
        try {
            // Fetch specific PO
            const res = await api.get(`/purchase-orders/${id}`);
            setPo(res.data);

            const pRes = await getProducts();
            setProducts(Array.isArray(pRes.data) ? pRes.data : []);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchData(); }, [id]);

    const handleAddItem = async () => {
        try {
            await addItem(id, itemData);
            toast.success("Item Added");
            setItemData({ productId: '', qty: 1, unitCost: 0 });
            fetchData();
        } catch (e) { console.error(e); }
    };

    const handleReceive = async () => {
        try {
            await receivePO(id);
            toast.success("PO Received & Stock Updated");
            fetchData();
        } catch (e) { window.alert(e.response?.data?.message || "Error"); }
    };

    if (!po) return <Typography>Loading...</Typography>;

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={2} gap={2}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/purchase-orders')}>Back</Button>
                <Box flexGrow={1}>
                    <PageHeader title={`PO #${po.id}`} subtitle={`Date: ${new Date(po.poDate).toLocaleDateString()}`} />
                </Box>
                <StatusChip status={po.status} />
                {po.status === 'CREATED' &&
                    <Button variant="contained" color="secondary" startIcon={<DownloadIcon />} onClick={handleReceive} size="large">
                        Receive Stock
                    </Button>
                }
            </Box>

            {po.status === 'CREATED' && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" mb={2}>Add Item to PO</Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={5}>
                            <TextField select fullWidth label="Product" value={itemData.productId} onChange={(e) => setItemData({ ...itemData, productId: e.target.value })}>
                                {products.map(p => <MenuItem key={p.id} value={p.id}>{p.name} (Cur Qty: {p.unitQty})</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <TextField fullWidth type="number" label="Qty" value={itemData.qty} onChange={(e) => setItemData({ ...itemData, qty: parseInt(e.target.value) })} />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField fullWidth type="number" label="Unit Cost" value={itemData.unitCost} onChange={(e) => setItemData({ ...itemData, unitCost: parseFloat(e.target.value) })} />
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
                            <TableCell align="right">Unit Cost</TableCell>
                            <TableCell align="right">Line Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {po.items?.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{products.find(p => p.id === item.productId)?.name || item.productId}</TableCell>
                                <TableCell align="right">{item.qty}</TableCell>
                                <TableCell align="right">{item.unitCost.toFixed(2)}</TableCell>
                                <TableCell align="right">{item.lineTotal.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell colSpan={3} align="right"><Typography variant="h6">Total Amount</Typography></TableCell>
                            <TableCell align="right"><Typography variant="h6" color="primary">{po.totalAmount?.toFixed(2)}</Typography></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

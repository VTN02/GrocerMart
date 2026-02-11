import React, { useEffect, useState } from 'react';
import { Box, Button, MenuItem, Paper, TextField, Typography, Grid, Alert } from '@mui/material';
import { SwapHoriz, Inventory } from '@mui/icons-material';
import { getProducts } from '../api/productsApi';
import { convertStock } from '../api/inventoryApi';
import { toast } from 'react-toastify';
import { PageHeader, DashboardCard, AnimatedContainer } from '../components';

export default function InventoryConvert() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [productId, setProductId] = useState('');
    const [fromBulkQty, setFromBulkQty] = useState(0);
    const [toUnitQty, setToUnitQty] = useState(0);
    const [note, setNote] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        getProducts({ size: 200 }).then(res => setProducts(Array.isArray(res.data) ? res.data : []));
    }, []);

    useEffect(() => {
        if (productId) {
            const product = products.find(p => p.id === parseInt(productId));
            setSelectedProduct(product);
        } else {
            setSelectedProduct(null);
        }
    }, [productId, products]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await convertStock({ productId, fromBulkQty, toUnitQty, note });
            toast.success('Stock conversion successful');
            setFromBulkQty(0);
            setToUnitQty(0);
            setNote('');
            setProductId('');
            setSelectedProduct(null);
            // Refresh products to show updated stock
            const res = await getProducts({ size: 200 });
            setProducts(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Conversion failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatedContainer delay={0.1}>
            <PageHeader
                title="Stock Conversion"
                subtitle="Convert bulk items to individual units"
                breadcrumbs={[{ label: 'Inventory', path: '/inventory' }, { label: 'Convert Stock' }]}
            />

            <Box maxWidth="md" mx="auto">
                <DashboardCard
                    title="Conversion Form"
                    subtitle="Select a product and specify conversion quantities"
                >
                    <Box component="form" onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Select Product"
                                    value={productId}
                                    onChange={(e) => setProductId(e.target.value)}
                                    required
                                    disabled={loading}
                                    helperText="Choose the product to convert"
                                >
                                    <MenuItem value="">
                                        <em>Select a product...</em>
                                    </MenuItem>
                                    {products.map(p => (
                                        <MenuItem key={p.id} value={p.id}>
                                            {p.name} — Bulk: {p.bulkQty} | Units: {p.unitQty}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            {selectedProduct && (
                                <Grid item xs={12}>
                                    <Alert severity="info" icon={<Inventory />}>
                                        <Typography variant="body2">
                                            <strong>Current Stock:</strong> {selectedProduct.bulkQty} bulk items, {selectedProduct.unitQty} units
                                            <br />
                                            <strong>Units per Bulk:</strong> {selectedProduct.unitsPerBulk || 1}
                                        </Typography>
                                    </Alert>
                                </Grid>
                            )}

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Subtract Bulk Quantity (-)"
                                    value={fromBulkQty}
                                    onChange={(e) => setFromBulkQty(parseFloat(e.target.value))}
                                    required
                                    disabled={loading}
                                    inputProps={{ min: 0, step: 0.01 }}
                                    color="error"
                                    focused
                                    helperText="Amount to remove from bulk stock"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Add Unit Quantity (+)"
                                    value={toUnitQty}
                                    onChange={(e) => setToUnitQty(parseInt(e.target.value))}
                                    required
                                    disabled={loading}
                                    inputProps={{ min: 0 }}
                                    color="success"
                                    focused
                                    helperText="Amount to add to unit stock"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Note / Reason"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    multiline
                                    rows={3}
                                    disabled={loading}
                                    placeholder="Optional: Add a note about this conversion..."
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    disabled={loading}
                                    startIcon={<SwapHoriz />}
                                >
                                    {loading ? 'Converting...' : 'Execute Conversion'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </DashboardCard>

                <Box mt={3}>
                    <Alert severity="warning">
                        <Typography variant="body2">
                            <strong>Important:</strong> Stock conversion is irreversible. Please verify the quantities before executing.
                        </Typography>
                    </Alert>
                </Box>
            </Box>
        </AnimatedContainer>
    );
}

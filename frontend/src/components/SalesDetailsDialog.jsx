import React, { useMemo } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography,
    Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Divider
} from '@mui/material';
import { Print, Close } from '@mui/icons-material';
import { format } from 'date-fns';

import { toast } from 'react-toastify';
import { getInvoicePdf, downloadBlob } from '../api/reportsApi';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(Number(amount || 0));
};

export default function SalesDetailsDialog({ open, onClose, sale }) {
    if (!sale) return null;

    const handleDownloadInvoice = async () => {
        try {
            const res = await getInvoicePdf(sale.id);
            downloadBlob(res.data, `Invoice_${sale.invoiceId}.pdf`);
            toast.success("Invoice downloaded");
        } catch (e) {
            toast.error("Download failed");
            console.error(e);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={600}>
                        Sale Details
                    </Typography>
                    <Box>
                        <Button startIcon={<Print />} onClick={handleDownloadInvoice}>
                            Print
                        </Button>
                        <Button startIcon={<Close />} onClick={onClose} color="inherit">
                            Close
                        </Button>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ py: 3 }}>
                <Grid container spacing={3}>
                    {/* Header Info */}
                    <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                            <Grid container spacing={2}>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="caption" color="text.secondary">Invoice ID</Typography>
                                    <Typography variant="subtitle1" fontWeight="bold">{sale.invoiceId || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="caption" color="text.secondary">Date</Typography>
                                    <Typography variant="subtitle1">{sale.salesDate ? format(new Date(sale.salesDate), 'MMM dd, yyyy') : 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="caption" color="text.secondary">Payment Status</Typography>
                                    <Box mt={0.5} display="flex" gap={1}>
                                        <Chip
                                            label={sale.paymentMethod || 'CASH'}
                                            color="default"
                                            size="small"
                                            variant="outlined"
                                        />
                                        <Chip
                                            label={sale.paymentStatus || 'PAID'}
                                            color={sale.paymentStatus === 'PAID' ? 'success' : (sale.paymentStatus === 'PARTIAL' ? 'warning' : 'error')}
                                            size="small"
                                            variant="filled"
                                        />
                                    </Box>
                                </Grid>
                                {sale.dueDate && (
                                    <Grid item xs={6} sm={3}>
                                        <Typography variant="caption" color="text.secondary">Due Date</Typography>
                                        <Typography variant="subtitle2" color="error.main">
                                            {format(new Date(sale.dueDate), 'MMM dd, yyyy')}
                                        </Typography>
                                    </Grid>
                                )}
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="caption" color="text.secondary">Total Amount</Typography>
                                    <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                                        {formatCurrency(sale.totalRevenue)}
                                    </Typography>
                                </Grid>
                                {sale.note && (
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="text.secondary">Note</Typography>
                                        <Typography variant="body2">{sale.note}</Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Items Table */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                            Line Items ({sale.totalItemsSold || sale.items?.length || 0})
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead sx={{ bgcolor: 'action.hover' }}>
                                    <TableRow>
                                        <TableCell>Product</TableCell>
                                        <TableCell align="right">Qty</TableCell>
                                        <TableCell align="right">Unit Price</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sale.items?.map((item) => (
                                        <TableRow key={item.id} hover>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2">{item.productNameSnapshot || item.productName}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{item.categorySnapshot}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">
                                                {item.qtySold} <Typography component="span" variant="caption" color="text.secondary">({item.unitOrBulk || 'UNIT'})</Typography>
                                            </TableCell>
                                            <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 500 }}>
                                                {formatCurrency(item.lineTotal)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                            {formatCurrency(sale.totalRevenue)}
                                        </TableCell>
                                    </TableRow>
                                    {sale.paymentStatus !== 'PAID' && (
                                        <>
                                            <TableRow>
                                                <TableCell colSpan={3} align="right" sx={{ color: 'text.secondary' }}>Paid</TableCell>
                                                <TableCell align="right" sx={{ color: 'success.main' }}>
                                                    {formatCurrency(sale.paidAmount)}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Balance Due</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                                    {formatCurrency(sale.totalRevenue - (sale.paidAmount || 0))}
                                                </TableCell>
                                            </TableRow>
                                        </>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            </DialogContent >
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="contained">Done</Button>
            </DialogActions>
        </Dialog >
    );
}

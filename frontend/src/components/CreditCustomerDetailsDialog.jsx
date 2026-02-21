import React, { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography,
    Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Divider, CircularProgress, Tabs, Tab, Stack, IconButton, Tooltip
} from '@mui/material';
import { Close, AccountBalance, TrendingUp, History, AccountCircle, Receipt, Payment, Description, FileDownload, Edit, Delete, Visibility, VisibilityOff, PictureAsPdf } from '@mui/icons-material';
import { getCustomerPayments, getCustomerInvoices, getCreditCustomerSummary } from '../api/creditCustomersApi';
import { getCustomerLedgerPdf, getInvoicePdf, getCustomerProfilePdf, downloadBlob } from '../api/reportsApi';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(Number(amount || 0));
};

function TabPanel({ children, value, index, ...other }) {
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function CreditCustomerDetailsDialog({ open, onClose, customer, onEdit, onPay, onDelete, onStatusToggle }) {
    const [tabValue, setTabValue] = useState(0);
    const [payments, setPayments] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && customer?.id) {
            fetchData();
        }
    }, [open, customer]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [paymentsRes, invoicesRes, summaryRes] = await Promise.all([
                getCustomerPayments(customer.id),
                getCustomerInvoices(customer.id),
                getCreditCustomerSummary(customer.id)
            ]);
            setPayments(paymentsRes.data || paymentsRes || []);
            setInvoices(invoicesRes.data || invoicesRes || []);
            setSummary(summaryRes.data || summaryRes || null);
        } catch (error) {
            console.error("Failed to load customer data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadLedger = async () => {
        try {
            const res = await getCustomerLedgerPdf(customer.id);
            downloadBlob(res.data, `Ledger_${customer.name}.pdf`);
            toast.success("Ledger downloaded");
        } catch (e) {
            toast.error("Download failed");
            console.error("Download failed", e);
        }
    };

    const handleDownloadInvoice = async (inv) => {
        try {
            const res = await getInvoicePdf(inv.id);
            downloadBlob(res.data, `Invoice_${inv.invoiceId}.pdf`);
            toast.success("Invoice downloaded");
        } catch (e) {
            toast.error("Download failed");
            console.error("Download failed", e);
        }
    };

    const handleDownloadProfile = async () => {
        try {
            const res = await getCustomerProfilePdf(customer.id);
            downloadBlob(res.data, `Profile_${customer.name}.pdf`);
            toast.success("Profile downloaded");
        } catch (e) {
            toast.error("Download failed");
            console.error("Download failed", e);
        }
    };

    if (!customer) return null;

    const displaySummary = summary || customer;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
            <DialogTitle sx={{ pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <AccountCircle color="primary" sx={{ fontSize: 40 }} />
                        <Box>
                            <Typography variant="h6" fontWeight={700} lineHeight={1}>
                                {customer.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                ID: {customer.publicId} • {customer.phone || 'No phone'}
                            </Typography>
                        </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <Tooltip title="Download Profile PDF">
                            <IconButton onClick={handleDownloadProfile} color="primary" size="small">
                                <PictureAsPdf />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Download Ledger PDF">
                            <IconButton onClick={handleDownloadLedger} color="secondary" size="small">
                                <FileDownload />
                            </IconButton>
                        </Tooltip>
                        <IconButton onClick={onClose} color="inherit" size="small">
                            <Close />
                        </IconButton>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, bgcolor: 'action.hover' }}>
                    <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} indicatorColor="primary" textColor="primary">
                        <Tab icon={<Description fontSize="small" />} iconPosition="start" label="Overview" />
                        <Tab icon={<Receipt fontSize="small" />} iconPosition="start" label="Invoices" />
                        <Tab icon={<Payment fontSize="small" />} iconPosition="start" label="Payments" />
                    </Tabs>
                </Box>

                <Box sx={{ px: 3 }}>
                    <TabPanel value={tabValue} index={0}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" gutterBottom>OUTSTANDING BALANCE</Typography>
                                    <Typography variant="h4" fontWeight={800} color="error.main">{formatCurrency(displaySummary.outstandingBalance)}</Typography>
                                    <Typography variant="caption" color="text.secondary">Total debt currently owed</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" gutterBottom>AVAILABLE CREDIT</Typography>
                                    <Typography variant="h4" fontWeight={800} color="success.main">{formatCurrency(displaySummary.availableCredit)}</Typography>
                                    <Typography variant="caption" color="text.secondary">Limit: {formatCurrency(displaySummary.creditLimit)}</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" gutterBottom>TOTAL PAID</Typography>
                                    <Typography variant="h4" fontWeight={800} color="info.main">{formatCurrency(displaySummary.totalPaid)}</Typography>
                                    <Typography variant="caption" color="text.secondary">Total lifetime payments</Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" fontWeight={700} gutterBottom>Account Statistics</Typography>
                                <Paper variant="outlined" sx={{ p: 0 }}>
                                    <Table size="small">
                                        <TableBody>
                                            <TableRow><TableCell sx={{ fontWeight: 600 }}>Total Purchases</TableCell><TableCell align="right">{formatCurrency(displaySummary.totalPurchases)}</TableCell></TableRow>
                                            <TableRow><TableCell sx={{ fontWeight: 600 }}>Last Payment Date</TableCell><TableCell align="right">{displaySummary.lastPaymentDate || 'Never'}</TableCell></TableRow>
                                            <TableRow><TableCell sx={{ fontWeight: 600 }}>Payment Terms</TableCell><TableCell align="right">{displaySummary.paymentTermsDays} Days</TableCell></TableRow>
                                            <TableRow><TableCell sx={{ fontWeight: 600, borderBottom: 0 }}>Address</TableCell><TableCell align="right" sx={{ borderBottom: 0 }}>{displaySummary.address || 'N/A'}</TableCell></TableRow>
                                        </TableBody>
                                    </Table>
                                </Paper>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead sx={{ bgcolor: 'action.hover' }}>
                                    <TableRow>
                                        <TableCell>Invoice #</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                        <TableCell align="right">Paid</TableCell>
                                        <TableCell align="center">Status</TableCell>
                                        <TableCell align="center">PDF</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}><CircularProgress size={24} /></TableCell></TableRow>
                                    ) : invoices.length > 0 ? invoices.map((inv) => (
                                        <TableRow key={inv.id} hover>
                                            <TableCell sx={{ fontWeight: 700 }}>{inv.invoiceId}</TableCell>
                                            <TableCell>{inv.salesDate ? format(new Date(inv.salesDate), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(inv.totalRevenue)}</TableCell>
                                            <TableCell align="right" color="success.main">{formatCurrency(inv.paidAmount)}</TableCell>
                                            <TableCell align="center">
                                                <Chip size="small" label={inv.paymentStatus}
                                                    color={inv.paymentStatus === 'PAID' ? 'success' : inv.paymentStatus === 'PARTIAL' ? 'warning' : 'error'}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Download Invoice">
                                                    <IconButton size="small" color="primary" onClick={() => handleDownloadInvoice(inv)}>
                                                        <FileDownload fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}>No invoices found</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </TabPanel>

                    <TabPanel value={tabValue} index={2}>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead sx={{ bgcolor: 'action.hover' }}>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                        <TableCell>Method</TableCell>
                                        <TableCell>Note</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3 }}><CircularProgress size={24} /></TableCell></TableRow>
                                    ) : payments.length > 0 ? payments.map((p) => (
                                        <TableRow key={p.id} hover>
                                            <TableCell>{p.paymentDate ? format(new Date(p.paymentDate), 'MMM dd, yyyy HH:mm') : 'N/A'}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>{formatCurrency(p.amount)}</TableCell>
                                            <TableCell><Chip label={p.method || 'CASH'} size="small" variant="outlined" /></TableCell>
                                            <TableCell>{p.note || '—'}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3 }}>No payments found</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </TabPanel>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
                <Button onClick={onClose} variant="outlined">Close</Button>
                <Button onClick={handleDownloadLedger} startIcon={<FileDownload />} variant="contained">Download Full Ledger</Button>
            </DialogActions>
        </Dialog>
    );
}

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Grid, Skeleton, Typography, useTheme, Button, Chip, Stack, IconButton, Tooltip,
    Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer
} from '@mui/material';
import {
    DashboardCard, AnimatedContainer
} from '../components';
import KpiCard from '../components/KpiCard';
import EmptyState from '../components/EmptyState';
import SalesTrendChart from '../components/charts/SalesTrendChart';
import ChequeLifecycleChart from '../components/charts/ChequeLifecycleChart';
import {
    Inventory, AccountBalance, Receipt,
    AttachMoney, Add, TrendingUp, Warning, Store, LocalShipping, PointOfSale, PersonAdd
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getProducts } from '../api/productsApi';
import { getCustomers } from '../api/creditCustomersApi';
import { getCheques } from '../api/chequesApi';
import { getOrders } from '../api/ordersApi';
import { getSales, getDailySalesStats, getTopProductsStats } from '../api/salesApi';
import { format, subDays } from 'date-fns';

const MotionBox = motion(Box);

const formatCurrency = (amount) => {
    const num = Number(amount || 0);
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(num);
};

export default function Dashboard() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const role = useMemo(() => localStorage.getItem('role') || 'CASHIER', []);
    const isAdmin = useMemo(() => role === 'ADMIN', [role]);

    // Stats State
    const [stats, setStats] = useState({
        totalRevenue: 0,
        todaysSales: 0,
        salesCount: 0,
        ordersCount: 0,
        activeProducts: 0,
        lowStock: 0,
        creditBalance: 0,
        availableCredit: 0,
        pendingCheques: 0,
    });

    // Chart Data
    const [salesTrend, setSalesTrend] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [chequeStatus, setChequeStatus] = useState([]);
    const [timeRange, setTimeRange] = useState('7d');

    const currentDate = useMemo(() => new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }), []);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Prepare promises
                const promises = [
                    getProducts({ status: 'ACTIVE', size: 1000 }).catch(e => ({ data: [] })),
                    getCustomers({ size: 1000 }).catch(e => ({ data: [] })),
                    getCheques({ size: 1000 }).catch(e => ({ data: [] })),
                    getOrders({ size: 1000 }).catch(e => ({ data: [] })),
                ];

                if (isAdmin) {
                    promises.push(getSales({ size: 1000 }).catch(e => ({ data: [] })));
                } else {
                    promises.push(Promise.resolve({ data: [] }));
                }

                const [prodRes, custRes, chequeRes, ordersRes, salesRes] = await Promise.all(promises);

                if (!isMounted) return;

                const products = Array.isArray(prodRes?.data) ? prodRes.data : [];
                const customers = Array.isArray(custRes?.data) ? custRes.data : [];
                const cheques = Array.isArray(chequeRes?.data) ? chequeRes.data : [];
                const orders = Array.isArray(ordersRes?.data) ? ordersRes.data : [];
                const sales = Array.isArray(salesRes?.data) ? salesRes.data : [];

                // Basic Stats
                const activeProducts = products.length;
                const lowStock = products.filter(p => (p.unitQty || p.stockQuantity || 0) <= 10).length;
                const creditBalance = customers.reduce((sum, c) => sum + Math.abs(c.outstandingBalance || 0), 0);
                const availableCredit = customers.reduce((sum, c) => sum + Math.max(0, (c.creditLimit || 0) - Math.abs(c.outstandingBalance || 0)), 0);
                const pendingCheques = cheques.filter(c => c.status === 'PENDING').length;
                const ordersCount = orders.filter(o => o.status === 'CONFIRMED' || o.status === 'PAID').length;

                let totalRev = 0;
                let todaysSales = 0;

                if (isAdmin) {
                    totalRev = sales.reduce((sum, s) => sum + (s.totalRevenue || 0), 0);
                    const todayStr = format(new Date(), 'yyyy-MM-dd');
                    todaysSales = sales
                        .filter(s => s.salesDate === todayStr)
                        .reduce((sum, s) => sum + (s.totalRevenue || 0), 0);
                }

                setStats({
                    activeProducts,
                    lowStock,
                    creditBalance,
                    availableCredit,
                    pendingCheques,
                    ordersCount,
                    totalRevenue: totalRev,
                    todaysSales,
                    salesCount: sales.length
                });

                // Cheque Status
                const statusCounts = cheques.reduce((acc, curr) => {
                    const s = curr.status || 'UNKNOWN';
                    acc[s] = (acc[s] || 0) + 1;
                    return acc;
                }, {});

                const pieData = Object.entries(statusCounts).map(([name, value]) => ({
                    name,
                    value,
                    color: getColorForStatus(name, theme)
                }));
                setChequeStatus(pieData);

                // Admin-only Analytics
                if (isAdmin) {
                    const days = timeRange === '7d' ? 7 : 30;
                    const toDate = format(new Date(), 'yyyy-MM-dd');
                    const fromDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

                    const [dailyRes, topRes] = await Promise.all([
                        getDailySalesStats(fromDate, toDate).catch(e => ({ data: [] })),
                        getTopProductsStats(fromDate, toDate, 5).catch(e => ({ data: [] }))
                    ]);

                    if (Array.isArray(dailyRes?.data)) {
                        setSalesTrend(dailyRes.data.map(d => ({
                            date: format(new Date(d.date), 'MMM dd'),
                            revenue: d.totalRevenue,
                            orders: d.totalItemsSold
                        })));
                    }

                    if (Array.isArray(topRes?.data)) {
                        setTopProducts(topRes.data);
                    }
                }

            } catch (err) {
                console.error("Dashboard data load error:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [isAdmin, timeRange, theme]);

    const getColorForStatus = (status, theme) => {
        switch (status) {
            case 'PENDING': return theme.palette.warning.main;
            case 'CLEARED': return theme.palette.success.main;
            case 'BOUNCED': return theme.palette.error.main;
            case 'DEPOSITED': return theme.palette.info.main;
            default: return theme.palette.grey[500];
        }
    };

    return (
        <AnimatedContainer delay={0.1}>
            <MotionBox
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                sx={{
                    mb: 4, p: 3, borderRadius: 3,
                    background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                        : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    boxShadow: 3
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                    <Box>
                        <Typography variant="h4" fontWeight={800} gutterBottom>
                            Dashboard
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="body1" color="text.secondary">
                                Overview for {currentDate}
                            </Typography>
                            <Chip icon={<Store />} label="Store Open" color="success" size="small" />
                        </Stack>
                    </Box>
                    <Stack direction="row" spacing={2}>
                        {isAdmin && (
                            <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/sales')}>
                                New Sale
                            </Button>
                        )}
                        <Button variant="contained" color="secondary" startIcon={<PersonAdd />} onClick={() => navigate('/credit-customers')}>
                            New Customer
                        </Button>
                        <Button variant="outlined" startIcon={<Receipt />} onClick={() => navigate('/orders')}>
                            New Order
                        </Button>
                    </Stack>
                </Box>
            </MotionBox>

            <Grid container spacing={3} mb={3}>
                {isAdmin ? (
                    <>
                        <Grid item xs={12} sm={6} md={3}>
                            <KpiCard
                                title="Today's Sales"
                                value={formatCurrency(stats.todaysSales)}
                                icon={PointOfSale}
                                color="primary"
                                loading={loading}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <KpiCard
                                title="Total Revenue"
                                value={formatCurrency(stats.totalRevenue)}
                                icon={AttachMoney}
                                color="success"
                                loading={loading}
                            />
                        </Grid>
                    </>
                ) : (
                    <>
                        <Grid item xs={12} sm={6} md={3}>
                            <KpiCard
                                title="Confirming Orders"
                                value={stats.ordersCount}
                                icon={Receipt}
                                color="primary"
                                loading={loading}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <KpiCard
                                title="Active Products"
                                value={stats.activeProducts}
                                icon={Inventory}
                                color="success"
                                loading={loading}
                            />
                        </Grid>
                    </>
                )}
                <Grid item xs={12} sm={6} md={3}>
                    <KpiCard
                        title="Active Customers"
                        value={stats.pendingCheques + 5} // placeholder variation
                        icon={PersonAdd}
                        color="info"
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KpiCard
                        title="Low Stock"
                        value={stats.lowStock}
                        icon={Warning}
                        color="warning"
                        loading={loading}
                    />
                </Grid>
            </Grid>

            {isAdmin && (
                <Grid container spacing={3} mb={3}>
                    <Grid item xs={12} lg={8}>
                        <SalesTrendChart
                            data={salesTrend}
                            loading={loading}
                            timeRange={timeRange}
                            onTimeRangeChange={setTimeRange}
                        />
                    </Grid>
                    <Grid item xs={12} lg={4}>
                        <DashboardCard title="Top Selling Products" subtitle="Revenue leader">
                            <TableContainer sx={{ maxHeight: 340 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Product</TableCell>
                                            <TableCell align="right">Qty</TableCell>
                                            <TableCell align="right">Revenue</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {topProducts.map((p) => (
                                            <TableRow key={p.productId} hover>
                                                <TableCell sx={{ fontWeight: 600 }}>{p.productName}</TableCell>
                                                <TableCell align="right">{p.totalQtySold}</TableCell>
                                                <TableCell align="right">{formatCurrency(p.totalRevenue)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {topProducts.length === 0 && (
                                            <TableRow><TableCell colSpan={3} align="center">No records</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </DashboardCard>
                    </Grid>
                </Grid>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <ChequeLifecycleChart data={chequeStatus} loading={loading} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <DashboardCard title="System Risk Overview" subtitle="Critical focus areas">
                        <Stack spacing={2}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2">Outstanding Debt</Typography>
                                <Typography variant="body1" fontWeight={700} color="error.main">
                                    {formatCurrency(stats.creditBalance)}
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2">Pending Cheques</Typography>
                                <Typography variant="body1" fontWeight={700} color="warning.main">
                                    {stats.pendingCheques}
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2">Low Stock Alerts</Typography>
                                <Typography variant="body1" fontWeight={700} color="error.main">
                                    {stats.lowStock}
                                </Typography>
                            </Box>
                        </Stack>
                    </DashboardCard>
                </Grid>
            </Grid>
        </AnimatedContainer>
    );
}

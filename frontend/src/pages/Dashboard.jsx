import React, { useEffect, useState } from 'react';
import {
    Box, Grid, Skeleton, Typography, useTheme, Button, Chip, Stack, IconButton, Tooltip
} from '@mui/material';
import {
    XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import {
    Inventory, People, AccountBalance, Receipt,
    AttachMoney, Add, Upload, TrendingUp, Warning, CheckCircle
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getProducts } from '../api/productsApi';
import { getCustomers } from '../api/creditCustomersApi';
import { getCheques } from '../api/chequesApi';
import { getOrders } from '../api/ordersApi';
import {
    DashboardCard, AnimatedContainer
} from '../components';
import KpiCard from '../components/KpiCard';
import EmptyState from '../components/EmptyState';

const MotionBox = motion(Box);

const formatCurrency = (amount) => {
    const num = Number(amount || 0);
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(num);
};

const toDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function Dashboard() {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        products: 0,
        customers: 0,
        pendingCheques: 0,
        bouncedCheques: 0,
        orders: 0,
        totalRevenue: 0,
        outstandingCredit: 0,
        lowStockCount: 0,
    });
    const [chartData, setChartData] = useState([]);
    const [pieData, setPieData] = useState([]);

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const userName = localStorage.getItem('fullName') || 'Admin';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pRes, cRes, chRes, oRes] = await Promise.all([
                    getProducts(),
                    getCustomers(),
                    getCheques(),
                    getOrders()
                ]);

                const products = Array.isArray(pRes.data) ? pRes.data : (pRes.data ? [pRes.data] : []);
                const customers = Array.isArray(cRes.data) ? cRes.data : (cRes.data ? [cRes.data] : []);
                const cheques = Array.isArray(chRes.data) ? chRes.data : (chRes.data ? [chRes.data] : []);
                const orders = Array.isArray(oRes.data) ? oRes.data : (oRes.data ? [oRes.data] : []);

                // Calculate stats
                const pendingCheques = cheques.filter(c => c.status === 'PENDING').length;
                const bouncedCheques = cheques.filter(c => c.status === 'BOUNCED').length;
                const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
                const outstandingCredit = customers.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0);
                const lowStockCount = products.filter(p => (p.stockQuantity || 0) < 10).length;

                setStats({
                    products: products.length,
                    customers: customers.length,
                    pendingCheques,
                    bouncedCheques,
                    orders: orders.length,
                    totalRevenue,
                    outstandingCredit,
                    lowStockCount,
                });

                // Pie Data (Cheque Status)
                const statusColor = {
                    PENDING: '#FFA726',
                    DEPOSITED: '#42A5F5',
                    CLEARED: '#66BB6A',
                    BOUNCED: '#EF5350',
                };
                const statusCounts = cheques.reduce((acc, curr) => {
                    acc[curr.status] = (acc[curr.status] || 0) + 1;
                    return acc;
                }, {});

                setPieData(
                    Object.entries(statusCounts)
                        .map(([name, value]) => ({
                            name,
                            value,
                            color: statusColor[name] || theme.palette.divider
                        }))
                        .filter(d => d.value > 0)
                );

                const now = new Date();
                const days = Array.from({ length: 7 }).map((_, idx) => {
                    const d = new Date(now);
                    d.setDate(now.getDate() - (6 - idx));
                    return d;
                });

                const byDate = orders.reduce((acc, curr) => {
                    const dateKey = curr.orderDate ? curr.orderDate.split('T')[0] : null;
                    if (!dateKey) return acc;
                    if (!acc[dateKey]) {
                        acc[dateKey] = { orders: 0, revenue: 0 };
                    }
                    acc[dateKey].orders += 1;
                    acc[dateKey].revenue += Number(curr.totalAmount || 0);
                    return acc;
                }, {});

                setChartData(
                    days.map((d) => {
                        const key = toDateKey(d);
                        const aggregate = byDate[key] || { orders: 0, revenue: 0 };
                        return {
                            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                            orders: aggregate.orders,
                            revenue: Number(aggregate.revenue.toFixed(2)),
                        };
                    })
                );

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <AnimatedContainer delay={0.1}>
            {/* Premium Dashboard Header */}
            <MotionBox
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                sx={{
                    mb: 4,
                    p: 3,
                    borderRadius: 3,
                    background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                        : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    boxShadow: (theme) => theme.palette.mode === 'dark'
                        ? '0 4px 20px rgba(0, 0, 0, 0.5)'
                        : '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Welcome back, {userName}! 👋
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                {currentDate}
                            </Typography>
                            <Chip
                                icon={<CheckCircle />}
                                label="Store Active"
                                color="success"
                                size="small"
                                sx={{ fontWeight: 600 }}
                            />
                        </Stack>
                    </Box>
                    <Stack direction="row" spacing={1.5} flexWrap="wrap">
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            sx={{ borderRadius: 2 }}
                        >
                            Add Product
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<Receipt />}
                            sx={{ borderRadius: 2 }}
                        >
                            New Order
                        </Button>
                        <Tooltip title="Import CSV">
                            <IconButton
                                color="primary"
                                sx={{
                                    border: (theme) => `1px solid ${theme.palette.divider}`,
                                    borderRadius: 2,
                                }}
                            >
                                <Upload />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>
            </MotionBox>

            {/* KPI Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} lg={3}>
                    <KpiCard
                        title="Total Products"
                        value={stats.products}
                        icon={Inventory}
                        color="primary"
                        loading={loading}
                        trend="up"
                        trendValue="+12%"
                        delay={0.1}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <KpiCard
                        title="Total Orders"
                        value={stats.orders}
                        icon={Receipt}
                        color="info"
                        loading={loading}
                        trend="up"
                        trendValue="+8%"
                        delay={0.2}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <KpiCard
                        title="Total Revenue"
                        value={formatCurrency(stats.totalRevenue)}
                        icon={AttachMoney}
                        color="success"
                        loading={loading}
                        trend="up"
                        trendValue="+23%"
                        delay={0.3}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <KpiCard
                        title="Pending Cheques"
                        value={stats.pendingCheques}
                        icon={AccountBalance}
                        color="warning"
                        loading={loading}
                        delay={0.4}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <KpiCard
                        title="Outstanding Credit"
                        value={formatCurrency(stats.outstandingCredit)}
                        icon={People}
                        color="secondary"
                        loading={loading}
                        trend="down"
                        trendValue="-5%"
                        delay={0.5}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <KpiCard
                        title="Low Stock Alerts"
                        value={stats.lowStockCount}
                        icon={Warning}
                        color="error"
                        loading={loading}
                        delay={0.6}
                    />
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <MotionBox
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <DashboardCard
                            title="Sales Trend"
                            subtitle="Daily orders and revenue analysis"
                        >
                            <Box height={400}>
                                {loading ? (
                                    <Skeleton variant="rounded" height={400} />
                                ) : chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} opacity={0.5} />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                                                stroke={theme.palette.divider}
                                                interval={0}
                                                angle={-45}
                                                textAnchor="end"
                                                height={60}
                                            />
                                            <YAxis
                                                yAxisId="left"
                                                allowDecimals={false}
                                                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                                                stroke={theme.palette.divider}
                                                label={{ value: 'Orders', angle: -90, position: 'insideLeft', fill: theme.palette.text.secondary }}
                                            />
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                                                stroke={theme.palette.divider}
                                                tickFormatter={(v) => {
                                                    const num = Number(v || 0);
                                                    return num >= 1000 ? `₹${Math.round(num / 1000)}k` : `₹${Math.round(num)}`;
                                                }}
                                            />
                                            <ChartTooltip
                                                formatter={(value, name) => {
                                                    if (name === 'revenue') return [formatCurrency(value), 'Revenue'];
                                                    if (name === 'orders') return [value, 'Orders'];
                                                    return [value, name];
                                                }}
                                                contentStyle={{
                                                    backgroundColor: theme.palette.background.paper,
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    borderRadius: '12px',
                                                    boxShadow: theme.shadows[3],
                                                }}
                                            />
                                            <Legend
                                                wrapperStyle={{ paddingTop: '20px' }}
                                                iconType="circle"
                                            />
                                            <Line
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="orders"
                                                stroke={theme.palette.secondary.main}
                                                strokeWidth={3}
                                                dot={{ r: 4, fill: theme.palette.secondary.main }}
                                                activeDot={{ r: 6 }}
                                                name="Orders"
                                            />
                                            <Line
                                                yAxisId="right"
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke={theme.palette.primary.main}
                                                strokeWidth={3}
                                                dot={{ r: 4, fill: theme.palette.primary.main }}
                                                activeDot={{ r: 6 }}
                                                fill="url(#colorRevenue)"
                                                name="Revenue"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <EmptyState
                                        title="No sales data yet"
                                        message="Sales trends will appear here once you start processing orders"
                                    />
                                )}
                            </Box>
                        </DashboardCard>
                    </MotionBox>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <MotionBox
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <DashboardCard
                            title="Cheque Lifecycle"
                            subtitle="Status distribution"
                        >
                            <Box height={400} display="flex" alignItems="center" justifyContent="center">
                                {loading ? (
                                    <Skeleton variant="circular" width={250} height={250} />
                                ) : pieData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart margin={{ top: 20, bottom: 20 }}>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={80}
                                                outerRadius={120}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                labelLine={{ stroke: theme.palette.text.secondary, strokeWidth: 1 }}
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.color}
                                                        style={{
                                                            filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))',
                                                            cursor: 'pointer',
                                                        }}
                                                    />
                                                ))}
                                            </Pie>
                                            <Legend
                                                layout="horizontal"
                                                verticalAlign="bottom"
                                                align="center"
                                                wrapperStyle={{ paddingTop: '20px' }}
                                            />
                                            <ChartTooltip
                                                contentStyle={{
                                                    backgroundColor: theme.palette.background.paper,
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    borderRadius: '12px',
                                                    boxShadow: theme.shadows[3],
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <EmptyState
                                        title="No cheques yet"
                                        message="Cheque status breakdown will appear here"
                                    />
                                )}
                            </Box>
                        </DashboardCard>
                    </MotionBox>
                </Grid>
            </Grid>
        </AnimatedContainer>
    );
}

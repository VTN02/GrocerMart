import React, { useEffect, useState } from 'react';
import { Box, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
    Inventory, People, AccountBalance, Receipt,
    AttachMoney
} from '@mui/icons-material';
import { getProducts } from '../api/productsApi';
import { getCustomers } from '../api/creditCustomersApi';
import { getCheques } from '../api/chequesApi';
import { getOrders } from '../api/ordersApi';
import PageHeader from '../components/PageHeader';
import KpiCard from '../components/KpiCard';
import SectionCard from '../components/SectionCard';

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
    });
    const [chartData, setChartData] = useState([]);
    const [pieData, setPieData] = useState([]);

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

                setStats({
                    products: products.length,
                    customers: customers.length,
                    pendingCheques,
                    bouncedCheques,
                    orders: orders.length,
                    totalRevenue,
                    outstandingCredit,
                });

                // Pie Data (Cheque Status)
                const statusColor = {
                    PENDING: theme.palette.primary.main,
                    DEPOSITED: theme.palette.primary.dark,
                    CLEARED: theme.palette.secondary.main,
                    BOUNCED: theme.palette.text.secondary,
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
        <Box>
            <PageHeader
                title="Dashboard"
                subtitle="Welcome back! Here's what's happening with your store today."
                breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }]}
            />

            {/* KPI Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} lg={3}>
                    <KpiCard
                        title="Total Products"
                        value={stats.products}
                        icon={Inventory}
                        color="primary"
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <KpiCard
                        title="Credit Customers"
                        value={stats.customers}
                        icon={People}
                        color="success"
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <KpiCard
                        title="Pending Cheques"
                        value={stats.pendingCheques}
                        icon={AccountBalance}
                        color="warning"
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <KpiCard
                        title="Total Orders"
                        value={stats.orders}
                        icon={Receipt}
                        color="info"
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <KpiCard
                        title="Total Revenue"
                        value={formatCurrency(stats.totalRevenue)}
                        icon={AttachMoney}
                        color="primary"
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <KpiCard
                        title="Outstanding Credit"
                        value={formatCurrency(stats.outstandingCredit)}
                        icon={People}
                        color="secondary"
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <KpiCard
                        title="Bounced Cheques"
                        value={stats.bouncedCheques}
                        icon={AccountBalance}
                        color="secondary"
                        loading={loading}
                    />
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <SectionCard
                        title="Order Trends"
                        subtitle="Orders and revenue for the last 7 days"
                    >
                        <Box height={320}>
                            {loading ? (
                                <Skeleton variant="rounded" height={320} />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
                                        <YAxis yAxisId="left" allowDecimals={false} tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
                                        <YAxis
                                            yAxisId="right"
                                            orientation="right"
                                            tick={{ fontSize: 12 }}
                                            stroke={theme.palette.text.secondary}
                                            tickFormatter={(v) => {
                                                const num = Number(v || 0);
                                                return num >= 1000 ? `${Math.round(num / 1000)}k` : `${Math.round(num)}`;
                                            }}
                                        />
                                        <Tooltip
                                            formatter={(value, name) => {
                                                if (name === 'revenue') return [formatCurrency(value), 'Revenue'];
                                                if (name === 'orders') return [value, 'Orders'];
                                                return [value, name];
                                            }}
                                            contentStyle={{
                                                backgroundColor: theme.palette.background.paper,
                                                border: `1px solid ${theme.palette.divider}`,
                                                borderRadius: '10px',
                                            }}
                                        />
                                        <Line
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="orders"
                                            stroke={theme.palette.primary.dark}
                                            strokeWidth={3}
                                            dot={{ r: 3 }}
                                            activeDot={{ r: 6 }}
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke={theme.palette.primary.main}
                                            strokeWidth={3}
                                            dot={{ r: 3 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </Box>
                    </SectionCard>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <SectionCard
                        title="Cheque Status"
                        subtitle="Distribution of cheque statuses"
                    >
                        <Box height={320} display="flex" alignItems="center" justifyContent="center">
                            {loading ? (
                                <Skeleton variant="rounded" height={320} width="100%" />
                            ) : pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={4}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box textAlign="center">
                                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                        No data yet
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Cheque status breakdown will appear here once you add cheques.
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </SectionCard>
                </Grid>
            </Grid>
        </Box>
    );
}

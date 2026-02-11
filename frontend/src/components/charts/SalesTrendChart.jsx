import React, { useMemo } from 'react';
import { Box, Typography, ButtonGroup, Button, useTheme } from '@mui/material';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Area, ComposedChart, Legend
} from 'recharts';
import DashboardCard from '../DashboardCard';
import EmptyState from '../EmptyState';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function SalesTrendChart({ data, loading, timeRange, onTimeRangeChange }) {
    const theme = useTheme();

    // Sort data by date ascending just in case
    const sortedData = useMemo(() => {
        if (!data) return [];
        return [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [data]);

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Box
                    sx={{
                        bgcolor: 'background.paper',
                        p: 1.5,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 2,
                        boxShadow: theme.shadows[3],
                    }}
                >
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>{label}</Typography>
                    {payload.map((entry, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color }} />
                            <Typography variant="body2" color="text.secondary">
                                {entry.name}:
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                                {entry.name === 'Revenue' ? formatCurrency(entry.value) : entry.value}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            );
        }
        return null;
    };

    return (
        <DashboardCard
            title="Sales Trend"
            subtitle="Daily orders and revenue analytics"
            action={
                <ButtonGroup size="small" variant="outlined" sx={{ '& .MuiButton-root': { py: 0.25, fontSize: '0.75rem' } }}>
                    <Button
                        variant={timeRange === '7d' ? 'contained' : 'outlined'}
                        onClick={() => onTimeRangeChange('7d')}
                    >
                        7D
                    </Button>
                    <Button
                        variant={timeRange === '30d' ? 'contained' : 'outlined'}
                        onClick={() => onTimeRangeChange('30d')}
                    >
                        30D
                    </Button>
                </ButtonGroup>
            }
        >
            <Box height={340} width="100%">
                {sortedData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={sortedData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.2} />
                                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                                dy={10}
                            />
                            <YAxis
                                yAxisId="left"
                                orientation="left"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `₹${val}`}
                                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="top" height={36} iconType="circle" />

                            <Area
                                yAxisId="right"
                                type="monotone"
                                dataKey="revenue"
                                name="Revenue"
                                stroke={theme.palette.primary.main}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                strokeWidth={2}
                            />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="orders"
                                name="Orders"
                                stroke={theme.palette.secondary.main}
                                strokeWidth={2}
                                dot={{ r: 4, strokeWidth: 0 }}
                                activeDot={{ r: 6 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : (
                    <EmptyState
                        title="No Data Available"
                        message="Sales trends will appear here once orders are placed."
                    />
                )}
            </Box>
        </DashboardCard>
    );
}

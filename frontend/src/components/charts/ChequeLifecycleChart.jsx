import React from 'react';
import { Box, Typography, useTheme, Stack, Chip } from '@mui/material';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import DashboardCard from '../DashboardCard';
import EmptyState from '../EmptyState';

export default function ChequeLifecycleChart({ data, loading }) {
    const theme = useTheme();

    const total = data.reduce((sum, item) => sum + item.value, 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
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
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: data.color }} />
                        <Typography variant="subtitle2">{data.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                        {data.value} Cheques ({((data.value / total) * 100).toFixed(1)}%)
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    return (
        <DashboardCard
            title="Cheque Lifecycle"
            subtitle="Status distribution overview"
        >
            <Box height={340} width="100%" position="relative">
                {data.length > 0 ? (
                    <>
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                textAlign: 'center',
                                pointerEvents: 'none',
                            }}
                        >
                            <Typography variant="h4" fontWeight={700}>
                                {total}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Total
                            </Typography>
                        </Box>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value, entry) => (
                                        <span style={{ color: theme.palette.text.secondary, fontSize: '0.875rem', fontWeight: 500 }}>
                                            {value}
                                        </span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </>
                ) : (
                    <EmptyState
                        title="No Cheques Found"
                        message="Cheque status distribution will appear here."
                    />
                )}
            </Box>
        </DashboardCard>
    );
}

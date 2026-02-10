import React from 'react';
import { Card, CardContent, Box, Typography, Avatar, Skeleton } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

export default function KpiCard({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color = 'primary',
    loading = false
}) {
    const isPositiveTrend = trend === 'up';

    return (
        <Card
            sx={{
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '100px',
                    height: '100px',
                    background: (theme) => `linear-gradient(135deg, ${theme.palette[color].main}40 0%, ${theme.palette[color].light}20 100%)`,
                    borderRadius: '50%',
                    transform: 'translate(30%, -30%)',
                },
            }}
        >
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            fontWeight={500}
                            sx={{ mb: 1 }}
                        >
                            {loading ? <Skeleton width={120} /> : title}
                        </Typography>
                        <Typography variant="h4" fontWeight={700} color="text.primary">
                            {loading ? <Skeleton width={90} /> : value}
                        </Typography>
                    </Box>
                    {Icon && (
                        <Avatar
                            sx={{
                                bgcolor: `${color}.main`,
                                width: 48,
                                height: 48,
                            }}
                        >
                            {loading ? <Skeleton variant="circular" width={24} height={24} /> : <Icon sx={{ fontSize: 24 }} />}
                        </Avatar>
                    )}
                </Box>

                {trendValue && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                        {isPositiveTrend ? (
                            <TrendingUp fontSize="small" color="success" />
                        ) : (
                            <TrendingDown fontSize="small" color="error" />
                        )}
                        <Typography
                            variant="body2"
                            color={isPositiveTrend ? 'success.main' : 'error.main'}
                            fontWeight={500}
                        >
                            {trendValue}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            vs last month
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}

import React from 'react';
import { Card, CardContent, Box, Typography, Avatar, Skeleton, Chip } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

export default function KpiCard({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color = 'primary',
    loading = false,
    delay = 0
}) {
    const isPositiveTrend = trend === 'up';

    return (
        <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            sx={{
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                background: (theme) => theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.paper} 100%)`
                    : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, #ffffff 100%)`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.palette.mode === 'dark'
                        ? '0 12px 24px -10px rgba(0, 0, 0, 0.7)'
                        : '0 12px 24px -10px rgba(0, 0, 0, 0.15)',
                },
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '140px',
                    height: '140px',
                    background: (theme) => `linear-gradient(135deg, ${theme.palette[color].main}15 0%, ${theme.palette[color].light}08 100%)`,
                    borderRadius: '50%',
                    transform: 'translate(35%, -35%)',
                    transition: 'transform 0.3s ease',
                },
                '&:hover::before': {
                    transform: 'translate(30%, -30%) scale(1.1)',
                },
            }}
        >
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
                    <Box flex={1}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            fontWeight={600}
                            sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}
                        >
                            {loading ? <Skeleton width={120} /> : title}
                        </Typography>
                        <Typography variant="h3" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
                            {loading ? <Skeleton width={100} /> : value}
                        </Typography>
                    </Box>
                    {Icon && (
                        <Avatar
                            sx={{
                                bgcolor: `${color}.main`,
                                width: 56,
                                height: 56,
                                boxShadow: (theme) => `0 4px 14px 0 ${theme.palette[color].main}40`,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'rotate(10deg) scale(1.05)',
                                },
                            }}
                        >
                            {loading ? <Skeleton variant="circular" width={28} height={28} /> : <Icon sx={{ fontSize: 28 }} />}
                        </Avatar>
                    )}
                </Box>

                {(trendValue || !loading) && (
                    <Box display="flex" alignItems="center" gap={1}>
                        {trendValue ? (
                            <>
                                <Chip
                                    icon={isPositiveTrend ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                                    label={trendValue}
                                    size="small"
                                    color={isPositiveTrend ? 'success' : 'error'}
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        height: 24,
                                    }}
                                />
                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                    vs last month
                                </Typography>
                            </>
                        ) : (
                            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                Real-time data
                            </Typography>
                        )}
                    </Box>
                )}
            </CardContent>
        </MotionCard>
    );
}

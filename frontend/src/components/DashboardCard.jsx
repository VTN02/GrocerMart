import React from 'react';
import { Card, CardContent, Box, Typography, IconButton } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

export default function DashboardCard({
    title,
    subtitle,
    children,
    action,
    elevation = 1,
    delay = 0,
    ...props
}) {
    return (
        <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            elevation={elevation}
            sx={{
                height: '100%',
                background: (theme) => theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => theme.palette.mode === 'dark'
                        ? '0 8px 16px rgba(0, 0, 0, 0.6)'
                        : '0 8px 16px rgba(0, 0, 0, 0.1)',
                },
                ...props.sx,
            }}
            {...props}
        >
            <CardContent>
                {(title || action) && (
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box>
                            {title && (
                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                    {title}
                                </Typography>
                            )}
                            {subtitle && (
                                <Typography variant="body2" color="text.secondary">
                                    {subtitle}
                                </Typography>
                            )}
                        </Box>
                        {action && (
                            <IconButton size="small" sx={{ mt: -0.5 }}>
                                <MoreVert fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                )}
                {children}
            </CardContent>
        </MotionCard>
    );
}

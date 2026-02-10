import React from 'react';
import { Box, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { NavigateNext, Home } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function PageHeader({ title, subtitle, actions, breadcrumbs }) {
    return (
        <Box mb={4}>
            {breadcrumbs && breadcrumbs.length > 0 && (
                <Breadcrumbs
                    separator={<NavigateNext fontSize="small" />}
                    sx={{ mb: 2 }}
                    aria-label="breadcrumb"
                >
                    <MuiLink
                        component={Link}
                        to="/dashboard"
                        underline="hover"
                        sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}
                    >
                        <Home sx={{ mr: 0.5, fontSize: 20 }} />
                        Dashboard
                    </MuiLink>
                    {breadcrumbs.map((crumb, index) => {
                        const isLast = index === breadcrumbs.length - 1;
                        return isLast ? (
                            <Typography key={index} color="text.primary" fontWeight={500}>
                                {crumb.label}
                            </Typography>
                        ) : (
                            <MuiLink
                                key={index}
                                component={Link}
                                to={crumb.path}
                                underline="hover"
                                color="text.secondary"
                            >
                                {crumb.label}
                            </MuiLink>
                        );
                    })}
                </Breadcrumbs>
            )}

            <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                <Box>
                    <Typography
                        variant="h4"
                        component="h1"
                        fontWeight={700}
                        sx={{
                            mb: subtitle ? 0.5 : 0,
                            background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="body1" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {actions && (
                    <Box display="flex" gap={1.5} flexWrap="wrap">
                        {actions}
                    </Box>
                )}
            </Box>
        </Box>
    );
}

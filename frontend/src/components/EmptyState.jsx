import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Inbox } from '@mui/icons-material';

export default function EmptyState({
    icon: Icon = Inbox,
    title = 'No data available',
    description,
    action,
    actionLabel,
    onAction
}) {
    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={8}
            px={2}
        >
            <Box
                sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'action.hover',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                }}
            >
                <Icon sx={{ fontSize: 40, color: 'text.secondary' }} />
            </Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
                {title}
            </Typography>
            {description && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    maxWidth={400}
                    mb={3}
                >
                    {description}
                </Typography>
            )}
            {(action || (actionLabel && onAction)) && (
                action || (
                    <Button
                        variant="contained"
                        onClick={onAction}
                        size="large"
                    >
                        {actionLabel}
                    </Button>
                )
            )}
        </Box>
    );
}

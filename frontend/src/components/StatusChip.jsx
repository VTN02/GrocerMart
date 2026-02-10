import React from 'react';
import { Chip } from '@mui/material';
import {
    CheckCircle, Cancel, Pending, HourglassEmpty,
    LocalShipping, Receipt, AccountBalance
} from '@mui/icons-material';

const statusConfig = {
    // Generic statuses
    ACTIVE: { color: 'success', label: 'Active', icon: CheckCircle },
    INACTIVE: { color: 'error', label: 'Inactive', icon: Cancel },

    // Order statuses
    DRAFT: { color: 'default', label: 'Draft', icon: Pending },
    CONFIRMED: { color: 'success', label: 'Confirmed', icon: CheckCircle },
    COMPLETED: { color: 'info', label: 'Completed', icon: CheckCircle },

    // Cheque statuses
    PENDING: { color: 'warning', label: 'Pending', icon: HourglassEmpty },
    DEPOSITED: { color: 'info', label: 'Deposited', icon: AccountBalance },
    CLEARED: { color: 'success', label: 'Cleared', icon: CheckCircle },
    BOUNCED: { color: 'error', label: 'Bounced', icon: Cancel },

    // Purchase Order statuses
    CREATED: { color: 'default', label: 'Created', icon: Pending },
    RECEIVED: { color: 'success', label: 'Received', icon: LocalShipping },

    // Payment types
    CASH: { color: 'success', label: 'Cash', icon: Receipt },
    CARD: { color: 'info', label: 'Card', icon: Receipt },
    CREDIT: { color: 'warning', label: 'Credit', icon: Receipt },
};

export default function StatusChip({ status, size = 'small', variant = 'filled' }) {
    const config = statusConfig[status] || { color: 'default', label: status, icon: null };
    const Icon = config.icon;

    return (
        <Chip
            label={config.label}
            color={config.color}
            size={size}
            variant={variant}
            icon={Icon ? <Icon style={{ fontSize: 16 }} /> : undefined}
            sx={{
                fontWeight: 500,
                minWidth: 90,
                '& .MuiChip-icon': {
                    marginLeft: '8px',
                },
            }}
        />
    );
}

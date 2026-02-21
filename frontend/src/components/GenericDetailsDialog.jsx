import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
    Box, Chip, IconButton, Table, TableBody, TableCell, TableContainer, TableRow, Paper
} from '@mui/material';
import { Close, InfoOutlined } from '@mui/icons-material';

const formatValue = (key, value) => {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('at')) {
        try {
            return new Date(value).toLocaleString();
        } catch (e) {
            return value;
        }
    }
    if (key.toLowerCase().includes('price') || key.toLowerCase().includes('balance') || key.toLowerCase().includes('limit') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('revenue')) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(value);
    }
    return String(value);
};

const formatKey = (key) => {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase());
};

export default function GenericDetailsDialog({ open, onClose, data, title = "Details" }) {
    if (!data) return null;

    // Filter out internal fields
    const displayData = Object.entries(data).filter(([key]) =>
        !['id', 'items', 'password', 'passwordHash', 'imagePath', 'snapshotJson'].includes(key)
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1}>
                        <InfoOutlined color="primary" />
                        <Typography variant="h6" fontWeight={600}>
                            {title}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={onClose}>
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
                <TableContainer component={Box}>
                    <Table size="small">
                        <TableBody>
                            {displayData.map(([key, value]) => (
                                <TableRow key={key} hover>
                                    <TableCell
                                        sx={{
                                            width: '40%',
                                            fontWeight: 600,
                                            color: 'text.secondary',
                                            bgcolor: 'action.hover',
                                            borderRight: '1px solid',
                                            borderColor: 'divider',
                                            py: 1.5,
                                            pl: 3
                                        }}
                                    >
                                        {formatKey(key)}
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5, pl: 3 }}>
                                        {key === 'status' ? (
                                            <Chip
                                                label={value}
                                                size="small"
                                                color={value === 'ACTIVE' || value === 'CLEARED' || value === 'PAID' ? 'success' : 'default'}
                                                variant="outlined"
                                            />
                                        ) : (
                                            <Typography variant="body2" fontWeight={500}>
                                                {formatValue(key, value)}
                                            </Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="contained" fullWidth>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

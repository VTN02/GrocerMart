import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Box,
    Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';

export default function FormDialog({
    open,
    onClose,
    onSubmit,
    title,
    subtitle,
    children,
    submitText = 'Save',
    cancelText = 'Cancel',
    loading = false,
    maxWidth = 'sm',
    fullWidth = true,
}) {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(e);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={maxWidth}
            fullWidth={fullWidth}
            PaperProps={{
                component: 'form',
                onSubmit: handleSubmit,
                sx: { borderRadius: 3 }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography variant="h6" fontWeight={600}>
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="body2" color="text.secondary" mt={0.5}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    <IconButton size="small" onClick={onClose} disabled={loading}>
                        <Close fontSize="small" />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ py: 3 }}>
                {children}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="outlined" disabled={loading}>
                    {cancelText}
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{ minWidth: 100 }}
                >
                    {loading ? 'Saving...' : submitText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

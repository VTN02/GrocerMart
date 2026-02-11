import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Button, TextField, Typography, Paper,
    MenuItem, InputAdornment, IconButton, Alert, CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd, AdminPanelSettings } from '@mui/icons-material';
import { register } from '../api/usersApi';
import { toast } from 'react-toastify';

import { AnimatedContainer } from '../components';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'CASHIER', // Default to CASHIER for new registrations
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (formData.username.length < 4) {
            setError('Username must be at least 4 characters');
            return;
        }

        setLoading(true);

        try {
            await register({
                fullName: formData.fullName,
                username: formData.username,
                phone: formData.phone,
                password: formData.password,
                role: formData.role,
            });

            if (formData.role === 'CASHIER') {
                toast.success('Account request submitted! Please wait for admin approval.');
            } else {
                toast.success('Admin account created successfully! Please login.');
            }
            navigate('/login');
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.details
                ? Object.values(err.response.data.details).join(', ')
                : 'Registration failed. Please try again.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatedContainer delay={0.1}>
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                        : 'linear-gradient(135deg, #50C878 0%, #0B6E4F 100%)',
                    p: 2,
                }}
            >
                <Box sx={{ width: '100%', maxWidth: 600 }}>
                    <Paper
                        elevation={24}
                        sx={{
                            p: 5,
                            borderRadius: 4,
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <Box textAlign="center" mb={4}>
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #50C878 0%, #0B6E4F 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px',
                                    boxShadow: '0 8px 16px rgba(11, 110, 79, 0.3)',
                                }}
                            >
                                {formData.role === 'ADMIN' ? (
                                    <AdminPanelSettings sx={{ fontSize: 40, color: 'white' }} />
                                ) : (
                                    <PersonAdd sx={{ fontSize: 40, color: 'white' }} />
                                )}
                            </Box>
                            <Typography variant="h4" fontWeight={700} gutterBottom>
                                Create Account
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {formData.role === 'ADMIN'
                                    ? 'Set up your administrator account'
                                    : 'Request a new account (requires admin approval)'}
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit}>
                            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                    disabled={loading}
                                    autoFocus
                                />

                                <TextField
                                    fullWidth
                                    label="Username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                    disabled={loading}
                                    helperText="Minimum 4 characters"
                                />

                                <TextField
                                    fullWidth
                                    label="Phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    disabled={loading}
                                />

                                <TextField
                                    fullWidth
                                    select
                                    label="Account Type"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    required
                                    disabled={loading}
                                    helperText={formData.role === 'CASHIER' ? 'Needs admin approval' : 'Full access'}
                                >
                                    <MenuItem value="ADMIN">Admin</MenuItem>
                                    <MenuItem value="CASHIER">Cashier</MenuItem>
                                </TextField>

                                <TextField
                                    fullWidth
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    disabled={loading}
                                    helperText="Minimum 6 characters"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    disabled={loading}
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    label="Confirm Password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                    disabled={loading}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    edge="end"
                                                    disabled={loading}
                                                >
                                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>

                            {formData.role === 'CASHIER' && (
                                <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                                    <Typography variant="body2" fontWeight={500}>
                                        Cashier Account Request
                                    </Typography>
                                    <Typography variant="caption">
                                        Your account will be created with INACTIVE status. An administrator must activate it before you can login.
                                    </Typography>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : <PersonAdd />}
                                sx={{
                                    mt: 4,
                                    py: 1.5,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #50C878 0%, #0B6E4F 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #0B6E4F 0%, #50C878 100%)',
                                    },
                                }}
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Button>

                            <Box textAlign="center" mt={3}>
                                <Typography variant="body2" color="text.secondary">
                                    Already have an account?{' '}
                                    <Button
                                        component="span"
                                        onClick={() => navigate('/login')}
                                        disabled={loading}
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            p: 0,
                                            minWidth: 'auto',
                                            '&:hover': {
                                                background: 'transparent',
                                                textDecoration: 'underline',
                                            },
                                        }}
                                    >
                                        Sign In
                                    </Button>
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>

                    <Box textAlign="center" mt={3}>
                        <Typography variant="body2" color="white">
                            © 2026 GrocerSmart AI. All rights reserved.
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </AnimatedContainer>
    );
}

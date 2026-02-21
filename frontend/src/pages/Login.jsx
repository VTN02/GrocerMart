import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Button, TextField, Typography, Paper,
    InputAdornment, IconButton, Alert, CircularProgress, Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, LockOutlined, PersonAdd } from '@mui/icons-material';
import { login } from '../api/usersApi';
import { toast } from 'react-toastify';

import { AnimatedContainer } from '../components';

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await login(formData); // Use the imported login function

            // Store auth data
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('username', data.username);
            localStorage.setItem('fullName', data.fullName || data.username);
            localStorage.setItem('role', data.role);
            localStorage.setItem('token', data.token);

            // Fetch permissions if Role is Cashier
            if (data.role === 'CASHIER') {
                try {
                    const { getCashierPermissions } = await import('../api/permissionsApi');
                    const permRes = await getCashierPermissions();
                    // permissions are in permRes.data.permissions due to axios unwrapping
                    localStorage.setItem('permissions', JSON.stringify(permRes.data?.permissions || {}));
                } catch (e) {
                    console.error("Failed to fetch permissions during login", e);
                }
            }

            toast.success('Login successful!');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid username or password');
            setLoading(false); // Stop loading on error
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
                <Box sx={{ width: '100%', maxWidth: 444 }}>
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
                                <LockOutlined sx={{ fontSize: 40, color: 'white' }} />
                            </Box>
                            <Typography variant="h4" fontWeight={700} gutterBottom>
                                Welcome Back
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Sign in to GrocerSmart AI
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                margin="normal"
                                required
                                autoFocus
                                disabled={loading}
                                sx={{ mb: 2 }}
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                margin="normal"
                                required
                                disabled={loading}
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
                                sx={{ mb: 3 }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                                sx={{
                                    py: 1.5,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #50C878 0%, #0B6E4F 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #0B6E4F 0%, #50C878 100%)',
                                    },
                                }}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>

                            <Divider sx={{ my: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                    OR
                                </Typography>
                            </Divider>

                            <Button
                                fullWidth
                                variant="outlined"
                                size="large"
                                startIcon={<PersonAdd />}
                                onClick={() => navigate('/register')}
                                disabled={loading}
                                sx={{
                                    py: 1.5,
                                    fontSize: '0.9375rem',
                                    fontWeight: 500,
                                    borderWidth: 2,
                                    '&:hover': {
                                        borderWidth: 2,
                                    },
                                }}
                            >
                                Create New Account
                            </Button>
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

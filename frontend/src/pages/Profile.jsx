import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, TextField, Button, Grid, Avatar,
    InputAdornment, IconButton, Divider, CircularProgress, Badge,
    Tabs, Tab, Card, CardContent, Stack, Switch, FormControlLabel,
    LinearProgress, Chip, Container
} from '@mui/material';
import {
    Person, Lock, Visibility, VisibilityOff, Save,
    Phone, Badge as BadgeIcon, Security, Logout, Edit,
    CheckCircle, Palette, DarkMode, LightMode
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { DashboardCard, AnimatedContainer } from '../components';

const MotionBox = motion(Box);

function TabPanel({ children, value, index }) {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

function PasswordStrengthMeter({ password }) {
    const getStrength = () => {
        if (!password) return 0;
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
        if (/\d/.test(password)) strength += 25;
        if (/[^a-zA-Z\d]/.test(password)) strength += 25;
        return strength;
    };

    const strength = getStrength();
    const getColor = () => {
        if (strength <= 25) return 'error';
        if (strength <= 50) return 'warning';
        if (strength <= 75) return 'info';
        return 'success';
    };

    const getLabel = () => {
        if (strength <= 25) return 'Weak';
        if (strength <= 50) return 'Fair';
        if (strength <= 75) return 'Good';
        return 'Strong';
    };

    if (!password) return null;

    return (
        <Box sx={{ mt: 1 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="caption" color="text.secondary">
                    Password Strength
                </Typography>
                <Typography variant="caption" fontWeight={600} color={`${getColor()}.main`}>
                    {getLabel()}
                </Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={strength}
                color={getColor()}
                sx={{ height: 6, borderRadius: 3 }}
            />
        </Box>
    );
}

export default function Profile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [darkMode, setDarkMode] = useState(localStorage.getItem('themeMode') === 'dark');
    const [formData, setFormData] = useState({
        fullName: localStorage.getItem('fullName') || '',
        username: localStorage.getItem('username') || '',
        phone: localStorage.getItem('phone') || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
        createdAt: '',
        updatedAt: ''
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data } = await api.get('/users/profile');
                if (data) {
                    setFormData(prev => ({
                        ...prev,
                        fullName: data.fullName,
                        username: data.username,
                        phone: data.phone || '',
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt
                    }));
                    localStorage.setItem('fullName', data.fullName);
                    localStorage.setItem('phone', data.phone || '');
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        };
        fetchUserData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (formData.newPassword && !formData.oldPassword) {
            toast.error("Current password is required to set a new password");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.put('/users/profile', {
                fullName: formData.fullName,
                username: formData.username,
                phone: formData.phone,
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            });

            localStorage.setItem('username', data.username);
            localStorage.setItem('fullName', data.fullName);
            localStorage.setItem('phone', data.phone || '');

            setFormData(prev => ({
                ...prev,
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));

            toast.success("Profile updated successfully");
        } catch (err) {
            // Error handled by interceptor
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
        toast.info('Logged out successfully');
    };

    const handleThemeToggle = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('themeMode', newMode ? 'dark' : 'light');
        window.location.reload(); // Reload to apply theme
    };

    return (
        <AnimatedContainer delay={0.1}>
            {/* Page Header */}
            <MotionBox
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                sx={{ mb: 4 }}
            >
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Account Profile
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Manage your personal information and security settings
                </Typography>
            </MotionBox>

            <Grid container spacing={3}>
                {/* Left Column - Profile Summary */}
                <Grid item xs={12} md={4}>
                    <DashboardCard>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <Box position="relative" display="inline-block" mb={2}>
                                <Avatar
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        bgcolor: 'primary.main',
                                        fontSize: '3rem',
                                        fontWeight: 700,
                                        boxShadow: '0 8px 24px rgba(80, 200, 120, 0.3)',
                                        border: (theme) => `4px solid ${theme.palette.background.paper}`,
                                    }}
                                >
                                    {formData.fullName ? formData.fullName[0]?.toUpperCase() : '?'}
                                </Avatar>
                                <IconButton
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'primary.dark' },
                                    }}
                                >
                                    <Edit fontSize="small" />
                                </IconButton>
                            </Box>

                            <Typography variant="h5" fontWeight={700} gutterBottom>
                                {formData.fullName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                @{formData.username}
                            </Typography>

                            <Chip
                                icon={<CheckCircle />}
                                label={localStorage.getItem('role')}
                                color="primary"
                                sx={{ mt: 1, fontWeight: 600 }}
                            />

                            <Divider sx={{ my: 3 }} />

                            <Stack spacing={2} alignItems="stretch">
                                <Box textAlign="left">
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Account Status
                                    </Typography>
                                    <Chip
                                        icon={<CheckCircle />}
                                        label="Active • Secured with JWT"
                                        color="success"
                                        size="small"
                                        sx={{ mt: 0.5, fontWeight: 600 }}
                                    />
                                </Box>

                                <Box textAlign="left">
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Member Since
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                                        {formData.createdAt ? new Date(formData.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : '—'}
                                    </Typography>
                                </Box>

                                <Box textAlign="left">
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Last Updated
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                                        {formData.updatedAt ? new Date(formData.updatedAt).toLocaleDateString() : '—'}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Divider sx={{ my: 3 }} />

                            <Button
                                fullWidth
                                variant="outlined"
                                color="error"
                                startIcon={<Logout />}
                                onClick={handleLogout}
                                sx={{ borderRadius: 2 }}
                            >
                                Logout
                            </Button>
                        </CardContent>
                    </DashboardCard>
                </Grid>

                {/* Right Column - Tabbed Settings */}
                <Grid item xs={12} md={8}>
                    <DashboardCard>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs
                                value={tabValue}
                                onChange={(e, newValue) => setTabValue(newValue)}
                                sx={{ px: 3 }}
                            >
                                <Tab label="Personal Info" icon={<Person />} iconPosition="start" />
                                <Tab label="Security" icon={<Security />} iconPosition="start" />
                                <Tab label="Preferences" icon={<Palette />} iconPosition="start" />
                            </Tabs>
                        </Box>

                        <CardContent sx={{ p: 3 }}>
                            {/* Tab 1: Personal Info */}
                            <TabPanel value={tabValue} index={0}>
                                <Box component="form" onSubmit={handleSubmit}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Full Name"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                required
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <BadgeIcon sx={{ color: 'action.active' }} />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Username"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                required
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Person sx={{ color: 'action.active' }} />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Phone Number"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Phone sx={{ color: 'action.active' }} />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box display="flex" justifyContent="flex-end" gap={2}>
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    disabled={loading}
                                                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                                                    sx={{ px: 4, borderRadius: 2 }}
                                                >
                                                    {loading ? 'Saving...' : 'Save Changes'}
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </TabPanel>

                            {/* Tab 2: Security */}
                            <TabPanel value={tabValue} index={1}>
                                <Box component="form" onSubmit={handleSubmit}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Current Password"
                                                name="oldPassword"
                                                type={showOldPassword ? 'text' : 'password'}
                                                placeholder="Required to change password"
                                                value={formData.oldPassword}
                                                onChange={handleChange}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Security sx={{ color: 'action.active' }} />
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={() => setShowOldPassword(!showOldPassword)}>
                                                                {showOldPassword ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="New Password"
                                                name="newPassword"
                                                type={showNewPassword ? 'text' : 'password'}
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Lock sx={{ color: 'action.active' }} />
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                                                                {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                            <PasswordStrengthMeter password={formData.newPassword} />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Confirm New Password"
                                                name="confirmPassword"
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                error={formData.confirmPassword && formData.newPassword !== formData.confirmPassword}
                                                helperText={
                                                    formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                                                        ? "Passwords don't match"
                                                        : ""
                                                }
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box display="flex" justifyContent="flex-end" gap={2}>
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    disabled={loading}
                                                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                                                    sx={{ px: 4, borderRadius: 2 }}
                                                >
                                                    {loading ? 'Updating...' : 'Update Password'}
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </TabPanel>

                            {/* Tab 3: Preferences */}
                            <TabPanel value={tabValue} index={2}>
                                <Stack spacing={3}>
                                    <Box>
                                        <Typography variant="h6" fontWeight={600} gutterBottom>
                                            Appearance
                                        </Typography>
                                        <Paper
                                            sx={{
                                                p: 2,
                                                mt: 2,
                                                border: (theme) => `1px solid ${theme.palette.divider}`,
                                                borderRadius: 2,
                                            }}
                                        >
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    {darkMode ? <DarkMode color="primary" /> : <LightMode color="primary" />}
                                                    <Box>
                                                        <Typography variant="body1" fontWeight={600}>
                                                            Dark Mode
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Switch between light and dark themes
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Switch
                                                    checked={darkMode}
                                                    onChange={handleThemeToggle}
                                                    color="primary"
                                                />
                                            </Box>
                                        </Paper>
                                    </Box>

                                    <Box>
                                        <Typography variant="h6" fontWeight={600} gutterBottom>
                                            Theme Preview
                                        </Typography>
                                        <Grid container spacing={2} sx={{ mt: 1 }}>
                                            <Grid item xs={6}>
                                                <Paper
                                                    sx={{
                                                        p: 2,
                                                        textAlign: 'center',
                                                        bgcolor: 'primary.main',
                                                        color: 'white',
                                                        borderRadius: 2,
                                                    }}
                                                >
                                                    <Typography variant="body2" fontWeight={600}>
                                                        Primary
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Paper
                                                    sx={{
                                                        p: 2,
                                                        textAlign: 'center',
                                                        bgcolor: 'secondary.main',
                                                        color: 'white',
                                                        borderRadius: 2,
                                                    }}
                                                >
                                                    <Typography variant="body2" fontWeight={600}>
                                                        Secondary
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Stack>
                            </TabPanel>
                        </CardContent>
                    </DashboardCard>
                </Grid>
            </Grid>
        </AnimatedContainer>
    );
}

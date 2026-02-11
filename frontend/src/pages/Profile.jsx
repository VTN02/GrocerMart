import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, TextField, Button, Grid, Avatar,
    InputAdornment, IconButton, Alert, Divider, CircularProgress, Badge
} from '@mui/material';
import {
    Person, Lock, Visibility, VisibilityOff, Save,
    Phone, Badge as BadgeIcon, Security
} from '@mui/icons-material';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import api from '../api/axios';
import { toast } from 'react-toastify';

export default function Profile() {
    const [loading, setLoading] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
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
        // Fetch latest user data
        const fetchUserData = async () => {
            try {
                const username = localStorage.getItem('username');
                // We use the profile endpoint which uses the Principal
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

            // Update local storage
            localStorage.setItem('username', data.username);
            localStorage.setItem('fullName', data.fullName);
            localStorage.setItem('phone', data.phone || '');

            // Clear passwords
            setFormData(prev => ({
                ...prev,
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));

            toast.success("Profile updated successfully");
        } catch (err) {
            // Error handled by interceptor toast
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <PageHeader
                title="Account Profile"
                subtitle="Manage your personal information and security settings"
                icon={<Person />}
            />

            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <SectionCard title="Profile Overview">
                        <Box display="flex" flexDirection="column" alignItems="center" py={3}>
                            <Avatar
                                sx={{
                                    width: 120,
                                    height: 120,
                                    bgcolor: 'primary.main',
                                    fontSize: '3rem',
                                    mb: 2,
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                }}
                            >
                                {formData.fullName ? formData.fullName[0]?.toUpperCase() : '?'}
                            </Avatar>
                            <Typography variant="h5" fontWeight={700}>
                                {formData.fullName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                @{formData.username}
                            </Typography>
                            <Box mt={1}>
                                <Badge
                                    sx={{
                                        px: 2,
                                        py: 0.5,
                                        borderRadius: 5,
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                    }}
                                >
                                    {localStorage.getItem('role')}
                                </Badge>
                            </Box>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box px={2} py={1}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Account Status
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="success.main">
                                Active • Secured with JWT
                            </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box px={2} py={1}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Member since
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                                {formData.createdAt ? new Date(formData.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                            </Typography>
                        </Box>
                        <Box px={2} py={1}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Profile last updated
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                                {formData.updatedAt ? new Date(formData.updatedAt).toLocaleString() : '—'}
                            </Typography>
                        </Box>
                    </SectionCard>
                </Grid>

                <Grid item xs={12} md={8}>
                    <SectionCard title="Edit Profile Details">
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
                                                    <BadgeIcon sx={{ color: 'action.active', mr: 1 }} />
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
                                                    <Person sx={{ color: 'action.active', mr: 1 }} />
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
                                                    <Phone sx={{ color: 'action.active', mr: 1 }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Divider sx={{ my: 1 }}>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                            SECURITY & PASSWORD
                                        </Typography>
                                    </Divider>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Current Password"
                                        name="oldPassword"
                                        type={showOldPassword ? 'text' : 'password'}
                                        placeholder="Required to change password or username"
                                        value={formData.oldPassword}
                                        onChange={handleChange}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Security sx={{ color: 'action.active', mr: 1 }} />
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
                                                    <Lock sx={{ color: 'action.active', mr: 1 }} />
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
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Confirm New Password"
                                        name="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Box display="flex" justifyContent="flex-end" mt={2}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            disabled={loading}
                                            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                                            sx={{ px: 4, py: 1.2 }}
                                        >
                                            {loading ? 'Saving Changes...' : 'Save Profile'}
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </SectionCard>
                </Grid>
            </Grid>
        </Box>
    );
}

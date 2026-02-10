import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

export default function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        // Auto-redirect to dashboard if logged in
        const loggedIn = localStorage.getItem('loggedIn') === 'true';
        if (loggedIn) {
            navigate('/dashboard');
        }
    }, [navigate]);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: (theme) => theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
        >
            <Container maxWidth="md">
                <Paper
                    elevation={24}
                    sx={{
                        p: 6,
                        borderRadius: 4,
                        textAlign: 'center',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <Typography
                        variant="h2"
                        fontWeight={700}
                        gutterBottom
                        sx={{
                            background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        GrocerSmart AI
                    </Typography>
                    <Typography variant="h5" color="text.secondary" paragraph>
                        Modern Retail Management System
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                        Streamline your grocery store operations with our comprehensive management platform.
                        Track inventory, manage orders, handle credit customers, and more.
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForward />}
                        onClick={() => navigate('/login')}
                        sx={{
                            py: 1.5,
                            px: 4,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
                            },
                        }}
                    >
                        Get Started
                    </Button>
                </Paper>
            </Container>
        </Box>
    );
}

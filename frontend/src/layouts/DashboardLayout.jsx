import React, { useState, useContext } from 'react';
import { styled, useTheme, alpha } from '@mui/material/styles';
import {
    Box, Drawer, AppBar as MuiAppBar, Toolbar, List, Typography, Divider,
    IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Avatar, Menu, MenuItem, Tooltip, useMediaQuery, Container, Badge,
} from '@mui/material';
import {
    Menu as MenuIcon, ChevronLeft, Dashboard, People,
    Inventory, SwapHoriz, CreditCard, AccountBalance, Receipt,
    LocalShipping, ShoppingCart, LightMode, DarkMode, Logout,
    Notifications, Settings, Person, Delete
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { ColorModeContext } from '../theme/ThemeProvider';

const drawerWidth = 280;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        flexGrow: 1,
        padding: 0,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: 0,
        [theme.breakpoints.up('md')]: {
            marginLeft: open ? 0 : `-${drawerWidth}px`,
        },
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh',
        overflowX: 'hidden', // Prevent horizontal scroll on main page
        width: '100%',       // Ensure it takes available width
    }),
);

const AppBar = styled(MuiAppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: 'none',
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2, 2.5),
    minHeight: 64,
    justifyContent: 'space-between',
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
        width: drawerWidth,
        boxSizing: 'border-box',
        borderRight: 'none',
        background: theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
            : '#ffffff',
    },
}));

export default function DashboardLayout() {
    const theme = useTheme();
    const colorMode = useContext(ColorModeContext);
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [open, setOpen] = useState(!isMobile);
    const [anchorEl, setAnchorEl] = useState(null);

    const role = localStorage.getItem('role') || 'CASHIER';
    const username = localStorage.getItem('username') || 'User';
    const fullName = localStorage.getItem('fullName') || username;

    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['ADMIN', 'CASHIER'] },
        { text: 'Users', icon: <People />, path: '/users', roles: ['ADMIN'] },
        { text: 'Products', icon: <Inventory />, path: '/products', roles: ['ADMIN', 'CASHIER'] },
        { text: 'Convert Stock', icon: <SwapHoriz />, path: '/inventory/convert', roles: ['ADMIN', 'CASHIER'] },
        { text: 'Credit Customers', icon: <CreditCard />, path: '/credit-customers', roles: ['ADMIN', 'CASHIER'] },
        { text: 'Cheques', icon: <AccountBalance />, path: '/cheques', roles: ['ADMIN', 'CASHIER'] },
        { text: 'Orders', icon: <Receipt />, path: '/orders', roles: ['ADMIN', 'CASHIER'] },
        { text: 'Suppliers', icon: <LocalShipping />, path: '/suppliers', roles: ['ADMIN'] },
        { text: 'Purchase Orders', icon: <ShoppingCart />, path: '/purchase-orders', roles: ['ADMIN'] },
        { text: 'Trash', icon: <Delete />, path: '/trash', roles: ['ADMIN'] },
    ];

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" open={open}>
                <Toolbar sx={{ minHeight: 64 }}>
                    <IconButton
                        color="inherit"
                        aria-label="toggle drawer"
                        onClick={handleDrawerToggle}
                        edge="start"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{
                            flexGrow: 1,
                            fontWeight: 700,
                            background: theme.palette.mode === 'dark'
                                ? 'linear-gradient(135deg, #72D694 0%, #50C878 100%)'
                                : 'linear-gradient(135deg, #0B6E4F 0%, #50C878 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        GrocerSmart AI
                    </Typography>

                    <Box display="flex" alignItems="center" gap={1}>
                        <Tooltip title="Toggle theme">
                            <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                                {theme.palette.mode === 'dark' ? <LightMode /> : <DarkMode />}
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Account">
                            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
                                <Avatar
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        bgcolor: 'primary.main',
                                        fontWeight: 600,
                                    }}
                                >
                                    {fullName[0]?.toUpperCase()}
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                        onClick={() => setAnchorEl(null)}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        PaperProps={{
                            sx: {
                                mt: 1.5,
                                minWidth: 200,
                                borderRadius: 2,
                            }
                        }}
                    >
                        <Box px={2} py={1.5} borderBottom={1} borderColor="divider">
                            <Typography variant="subtitle2" fontWeight={600}>
                                {fullName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {role}
                            </Typography>
                        </Box>
                        <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }} sx={{ mt: 1 }}>
                            <ListItemIcon>
                                <Person fontSize="small" />
                            </ListItemIcon>
                            My Profile
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <Logout fontSize="small" />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <StyledDrawer
                variant={isMobile ? 'temporary' : 'persistent'}
                anchor="left"
                open={open}
                onClose={handleDrawerToggle}
            >
                <DrawerHeader>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #50C878 0%, #0B6E4F 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Typography variant="h6" fontWeight={700} color="white">
                                G
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700}>
                                GrocerSmart
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Admin Panel
                            </Typography>
                        </Box>
                    </Box>
                    {!isMobile && (
                        <IconButton onClick={handleDrawerToggle} size="small">
                            <ChevronLeft />
                        </IconButton>
                    )}
                </DrawerHeader>

                <Divider />

                <List sx={{ px: 1.5, py: 2 }}>
                    {menuItems.filter(item => item.roles.includes(role)).map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                                <ListItemButton
                                    onClick={() => {
                                        navigate(item.path);
                                        if (isMobile) setOpen(false);
                                    }}
                                    sx={{
                                        borderRadius: 2,
                                        minHeight: 48,
                                        px: 2,
                                        bgcolor: isActive
                                            ? alpha(theme.palette.primary.main, 0.12)
                                            : 'transparent',
                                        color: isActive ? 'primary.main' : 'text.primary',
                                        '&:hover': {
                                            bgcolor: isActive
                                                ? alpha(theme.palette.primary.main, 0.16)
                                                : 'action.hover',
                                        },
                                        '&::before': isActive ? {
                                            content: '""',
                                            position: 'absolute',
                                            left: 0,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: 4,
                                            height: '60%',
                                            borderRadius: '0 4px 4px 0',
                                            bgcolor: 'primary.main',
                                        } : {},
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 40,
                                            color: isActive ? 'primary.main' : 'text.secondary',
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontWeight: isActive ? 600 : 500,
                                            fontSize: '0.9375rem',
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </StyledDrawer>

            <Main open={open}>
                <Toolbar sx={{ minHeight: 64 }} />
                <Box sx={{ width: '100%', p: 3 }}>
                    <Outlet />
                </Box>
            </Main>
        </Box>
    );
}

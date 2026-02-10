import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Box, CircularProgress, Typography } from '@mui/material';

import { ThemeProvider } from './theme/ThemeProvider';
import { getSystemStatus } from './api/usersApi';
import ScrollToTop from './components/ScrollToTop';

// Layouts & Pages
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Profile from './pages/Profile';
import Products from './pages/Products';
import InventoryConvert from './pages/InventoryConvert';
import CreditCustomers from './pages/CreditCustomers';
import Cheques from './pages/Cheques';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Suppliers from './pages/Suppliers';
import PurchaseOrders from './pages/PurchaseOrders';
import PurchaseOrderDetails from './pages/PurchaseOrderDetails';

// Guards
const ProtectedRoute = ({ children }) => {
  const loggedIn = localStorage.getItem('loggedIn') === 'true';
  return loggedIn ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const loggedIn = localStorage.getItem('loggedIn') === 'true';
  return loggedIn ? <Navigate to="/dashboard" replace /> : children;
};

// Main App with Initial Loading Logic
function App() {
  const [initLoading, setInitLoading] = useState(true);
  const [hasUsers, setHasUsers] = useState(false);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      // Check if any users exist using the public status endpoint
      const response = await getSystemStatus();
      // After axios interceptor unwraps the ApiResponse, the data is directly in response.data
      // response.data = { initialized: true/false }
      if (response && response.data && response.data.initialized === true) {
        setHasUsers(true);
      } else {
        setHasUsers(false);
      }
    } catch (e) {
      // Assuming error means network error or empty DB possibly
      console.error("Failed to check users", e);
      setHasUsers(false);
    } finally {
      setInitLoading(false);
    }
  };

  if (initLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Typography ml={2}>Initializing System...</Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Landing */}
          <Route path="/" element={<Home />} />

          {/* Auth Routes */}
          <Route path="/login" element={
            <PublicRoute>
              {/* If no users exist, force redirect to register */}
              {!hasUsers ? <Navigate to="/register" replace /> : <Login />}
            </PublicRoute>
          } />

          <Route path="/register" element={
            <PublicRoute>
              {/* If users exist, register is disabled/hidden from flow usually, but we keep it accessible manually or if 0 users */}
              <Register />
            </PublicRoute>
          } />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="products" element={<Products />} />
            <Route path="inventory/convert" element={<InventoryConvert />} />
            <Route path="credit-customers" element={<CreditCustomers />} />
            <Route path="cheques" element={<Cheques />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id/items" element={<OrderDetails />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="purchase-orders" element={<PurchaseOrders />} />
            <Route path="purchase-orders/:id/items" element={<PurchaseOrderDetails />} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Box, CircularProgress, Typography } from '@mui/material';

import { ThemeProvider } from './theme/ThemeProvider';
import { getSystemStatus } from './api/usersApi';
import ScrollToTop from './components/ScrollToTop';
import { LinearProgress } from '@mui/material';

// Layouts
const DashboardLayout = React.lazy(() => import('./layouts/DashboardLayout'));
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Users = React.lazy(() => import('./pages/Users'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Products = React.lazy(() => import('./pages/Products'));
const InventoryConvert = React.lazy(() => import('./pages/InventoryConvert'));
const CreditCustomers = React.lazy(() => import('./pages/CreditCustomers'));
const Cheques = React.lazy(() => import('./pages/Cheques'));
const Orders = React.lazy(() => import('./pages/Orders'));
const OrderDetails = React.lazy(() => import('./pages/OrderDetails'));
const Suppliers = React.lazy(() => import('./pages/Suppliers'));
const PurchaseOrders = React.lazy(() => import('./pages/PurchaseOrders'));
const PurchaseOrderDetails = React.lazy(() => import('./pages/PurchaseOrderDetails'));
const Trash = React.lazy(() => import('./pages/Trash'));
const Sales = React.lazy(() => import('./pages/Sales'));
const Reports = React.lazy(() => import('./pages/Reports'));
const Settings = React.lazy(() => import('./pages/Settings'));
const PermissionSettings = React.lazy(() => import('./pages/PermissionSettings'));
import { getCashierPermissions } from './api/permissionsApi';


// Guards
const ProtectedRoute = ({ children, roles, moduleKey }) => {
  const loggedIn = localStorage.getItem('loggedIn') === 'true';
  const role = localStorage.getItem('role');

  if (!loggedIn) return <Navigate to="/login" replace />;

  // Base role restriction
  if (roles && !roles.includes(role)) return <Navigate to="/dashboard" replace />;

  // Dynamic module restriction for Cashier
  if (role === 'CASHIER' && moduleKey) {
    const permissions = JSON.parse(localStorage.getItem('permissions') || '{}');
    if (permissions[moduleKey] !== true) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
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
      const response = await getSystemStatus();
      if (response && response.data && response.data.initialized === true) {
        setHasUsers(true);
      } else {
        setHasUsers(false);
      }

      // Fetch permissions if logged in as Cashier
      const loggedIn = localStorage.getItem('loggedIn') === 'true';
      const role = localStorage.getItem('role');
      if (loggedIn && role === 'CASHIER') {
        const permRes = await getCashierPermissions();
        // The axios interceptor unwraps the data, so permRes.data is already { role, permissions }
        localStorage.setItem('permissions', JSON.stringify(permRes.data?.permissions || {}));
      }
    } catch (e) {
      console.error("Failed to check system status", e);
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
        <React.Suspense fallback={<LinearProgress color="primary" sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }} />}>
          <Routes>
            {/* Landing */}
            <Route path="/" element={<Home />} />

            {/* Auth Routes */}
            <Route path="/login" element={
              <PublicRoute>
                {!hasUsers ? <Navigate to="/register" replace /> : <Login />}
              </PublicRoute>
            } />

            <Route path="/register" element={
              <PublicRoute>
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
              <Route path="users" element={<ProtectedRoute roles={['ADMIN']}><Users /></ProtectedRoute>} />
              <Route path="products" element={<ProtectedRoute moduleKey="PRODUCTS"><Products /></ProtectedRoute>} />
              <Route path="inventory/convert" element={<ProtectedRoute moduleKey="INVENTORY_CONVERT"><InventoryConvert /></ProtectedRoute>} />
              <Route path="credit-customers" element={<ProtectedRoute moduleKey="CREDIT_CUSTOMERS"><CreditCustomers /></ProtectedRoute>} />
              <Route path="cheques" element={<ProtectedRoute moduleKey="CHEQUES"><Cheques /></ProtectedRoute>} />
              <Route path="orders" element={<ProtectedRoute moduleKey="ORDERS"><Orders /></ProtectedRoute>} />
              <Route path="orders/:id/items" element={<ProtectedRoute moduleKey="ORDERS"><OrderDetails /></ProtectedRoute>} />
              <Route path="suppliers" element={<ProtectedRoute moduleKey="SUPPLIERS"><Suppliers /></ProtectedRoute>} />
              <Route path="purchase-orders" element={<ProtectedRoute moduleKey="PURCHASE_ORDERS"><PurchaseOrders /></ProtectedRoute>} />
              <Route path="purchase-orders/:id/items" element={<ProtectedRoute moduleKey="PURCHASE_ORDERS"><PurchaseOrderDetails /></ProtectedRoute>} />
              <Route path="trash" element={<ProtectedRoute moduleKey="TRASH"><Trash /></ProtectedRoute>} />
              <Route path="sales" element={<ProtectedRoute moduleKey="SALES"><Sales /></ProtectedRoute>} />
              <Route path="reports" element={<ProtectedRoute moduleKey="REPORTS"><Reports /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute roles={['ADMIN']}><Settings /></ProtectedRoute>} />
              <Route path="settings/permissions" element={<ProtectedRoute roles={['ADMIN']}><PermissionSettings /></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </React.Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;

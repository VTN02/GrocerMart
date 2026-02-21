import React, { useState, useMemo } from 'react';
import { Box, Button, TextField, MenuItem, IconButton, Tooltip, Grid, Paper, Switch, Stack, InputAdornment } from '@mui/material';
import { Add, Delete, Edit, Person, Visibility, PictureAsPdf, Search, Clear, FilterList } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUser, deleteUser, activateUser, deactivateUser } from '../api/usersApi';
import { getUserReportPdf, getUserDetailsPdf, downloadBlob } from '../api/reportsApi';
import { toast } from 'react-toastify';
import { PageHeader, DataTable, FormDialog, ConfirmDialog, StatusChip, DashboardCard, AnimatedContainer, GenericDetailsDialog } from '../components';

const initialFormData = {
    fullName: '',
    username: '',
    password: '',
    phone: '',
    role: 'CASHIER',
};

export default function Users() {
    const role = localStorage.getItem('role') || 'CASHIER';
    const isAdmin = role === 'ADMIN';
    const queryClient = useQueryClient();

    // Table & Filter State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [orderBy, setOrderBy] = useState('id');
    const [orderDirection, setOrderDirection] = useState('desc');

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [formData, setFormData] = useState(initialFormData);

    // Data Fetching
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['users', page, rowsPerPage, search, filterRole, filterStatus, orderBy, orderDirection],
        queryFn: async () => {
            const params = {
                page,
                size: rowsPerPage,
                search: search || undefined,
                role: filterRole || undefined,
                status: filterStatus || undefined,
                sort: `${orderBy},${orderDirection}`
            };
            const response = await getUsers(params);
            // My backend returns a Page object within an ApiResponse
            // Axios interceptor handles unwrapping the ApiResponse
            return response.data || response;
        },
        keepPreviousData: true,
        staleTime: 5000
    });

    const users = data?.content || [];
    const totalCount = data?.totalElements || 0;

    // Mutations
    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            handleCloseDialog();
            setDeleteDialogOpen(false);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const createMutation = useMutation({ mutationFn: createUser, ...mutationOptions, onSuccess: () => { toast.success('User created'); mutationOptions.onSuccess(); } });
    const updateMutation = useMutation({ mutationFn: (data) => updateUser(editId, data), ...mutationOptions, onSuccess: () => { toast.success('User updated'); mutationOptions.onSuccess(); } });
    const deleteMutation = useMutation({ mutationFn: deleteUser, ...mutationOptions, onSuccess: () => { toast.success('User deleted'); mutationOptions.onSuccess(); } });
    const activateMutation = useMutation({ mutationFn: activateUser, ...mutationOptions, onSuccess: () => { toast.success('User activated'); mutationOptions.onSuccess(); } });
    const deactivateMutation = useMutation({ mutationFn: deactivateUser, ...mutationOptions, onSuccess: () => { toast.success('User deactivated'); mutationOptions.onSuccess(); } });

    const handleOpenDialog = (user = null) => {
        if (!isAdmin) return toast.error('Access Denied');
        if (user) {
            setEditId(user.id);
            setFormData({
                fullName: user.fullName,
                username: user.username,
                password: '',
                phone: user.phone,
                role: user.role,
            });
        } else {
            setEditId(null);
            setFormData(initialFormData);
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditId(null);
        setFormData(initialFormData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editId) updateMutation.mutate(formData);
        else createMutation.mutate(formData);
    };

    const handleToggleStatus = (user) => {
        if (!isAdmin) return toast.error('Access Denied');
        if (user.status === 'ACTIVE') deactivateMutation.mutate(user.id);
        else activateMutation.mutate(user.id);
    };

    const handleSort = (property) => {
        const isAsc = orderBy === property && orderDirection === 'asc';
        setOrderDirection(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleExportUserReport = async () => {
        if (!isAdmin) return toast.error('Access Denied');
        try {
            const { data } = await getUserReportPdf();
            downloadBlob(data, `Users_Report_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success("User report downloaded");
        } catch (error) { toast.error("Failed to generate report"); }
    };

    const handleDownloadUserDetails = async (user) => {
        if (!isAdmin) return toast.error('Access Denied');
        try {
            const { data } = await getUserDetailsPdf(user.id);
            downloadBlob(data, `User_Details_${user.username}.pdf`);
            toast.success("User details downloaded");
        } catch (error) { toast.error("Failed to generate details"); }
    };

    const columns = useMemo(() => [
        { id: 'publicId', label: 'ID', minWidth: 90, sortable: true },
        { id: 'fullName', label: 'Full Name', minWidth: 180, sortable: true },
        { id: 'username', label: 'Username', minWidth: 120, sortable: true },
        { id: 'phone', label: 'Phone', minWidth: 120, sortable: true },
        { id: 'role', label: 'Role', minWidth: 100, sortable: true },
        {
            id: 'activeToggle',
            label: 'Active',
            minWidth: 90,
            render: (_, row) => (
                <Switch
                    checked={row.status === 'ACTIVE'}
                    onChange={() => handleToggleStatus(row)}
                    disabled={!isAdmin || activateMutation.isLoading || deactivateMutation.isLoading}
                    color="success"
                    size="small"
                />
            )
        },
        { id: 'status', label: 'Status', minWidth: 100, sortable: true, render: (val) => <StatusChip status={val} /> },
        { id: 'createdAt', label: 'Created At', minWidth: 150, sortable: true, render: (val) => val ? new Date(val).toLocaleString() : '—' },
    ], [isAdmin, activateMutation.isLoading, deactivateMutation.isLoading]);

    return (
        <AnimatedContainer>
            <PageHeader
                title="Users"
                subtitle="Manage system users and staff accounts"
                breadcrumbs={[{ label: 'Users', path: '/users' }]}
                actions={
                    <Box display="flex" gap={1}>
                        <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={handleExportUserReport} disabled={!isAdmin}>Report</Button>
                        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()} disabled={!isAdmin}>Add User</Button>
                    </Box>
                }
            />

            <DashboardCard title="User Directory">
                <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth size="small" label="Search" placeholder="Name, Username, ID"
                            value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <TextField
                            select fullWidth size="small" label="Role"
                            value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setPage(0); }}
                        >
                            <MenuItem value="">All Roles</MenuItem>
                            <MenuItem value="ADMIN">ADMIN</MenuItem>
                            <MenuItem value="CASHIER">CASHIER</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <TextField
                            select fullWidth size="small" label="Status"
                            value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
                        >
                            <MenuItem value="">All Status</MenuItem>
                            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                            <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Button
                            startIcon={<Clear />} color="inherit"
                            disabled={!search && !filterRole && !filterStatus}
                            onClick={() => { setSearch(''); setFilterRole(''); setFilterStatus(''); setPage(0); }}
                        >
                            Clear
                        </Button>
                    </Grid>
                </Grid>

                <DataTable
                    serverSide
                    columns={columns}
                    data={users}
                    loading={isLoading}
                    totalCount={totalCount}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setPage}
                    onRowsPerPageChange={setRowsPerPage}
                    orderBy={orderBy}
                    orderDirection={orderDirection}
                    onSortChange={handleSort}
                    actions={(row) => (
                        <Stack direction="row" spacing={0.5}>
                            <Tooltip title="View Details"><IconButton size="small" color="info" onClick={() => { setSelectedUser(row); setDetailsOpen(true); }}><Visibility fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Print Details"><IconButton size="small" color="secondary" onClick={() => handleDownloadUserDetails(row)} disabled={!isAdmin}><PictureAsPdf fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpenDialog(row)} disabled={!isAdmin}><Edit fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { setDeleteId(row.id); setDeleteDialogOpen(true); }} disabled={!isAdmin}><Delete fontSize="small" /></IconButton></Tooltip>
                        </Stack>
                    )}
                />
            </DashboardCard>

            <FormDialog
                open={dialogOpen} onClose={handleCloseDialog} onSubmit={handleSubmit}
                title={editId ? 'Edit User' : 'Add User'} loading={createMutation.isLoading || updateMutation.isLoading}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12}><TextField fullWidth label="Full Name" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!editId} helperText={editId && "Leave blank to keep current"} /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></Grid>
                    <Grid item xs={12} sm={6}><TextField select fullWidth label="Role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required><MenuItem value="ADMIN">ADMIN</MenuItem><MenuItem value="CASHIER">CASHIER</MenuItem></TextField></Grid>
                </Grid>
            </FormDialog>

            <ConfirmDialog
                open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={() => deleteMutation.mutate(deleteId)}
                title="Delete User" message="Archive this user? This cannot be undone." loading={deleteMutation.isLoading} severity="error"
            />

            <GenericDetailsDialog open={detailsOpen} onClose={() => setDetailsOpen(false)} data={selectedUser} title="User Details" />
        </AnimatedContainer>
    );
}


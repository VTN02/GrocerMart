import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, MenuItem, IconButton, Tooltip, Grid, Paper, Switch } from '@mui/material';
import { Add, Delete, Edit, Person } from '@mui/icons-material';
import { getUsers, createUser, updateUser, deleteUser, activateUser, deactivateUser } from '../api/usersApi';
import { toast } from 'react-toastify';
import { PageHeader, DataTable, FormDialog, ConfirmDialog, StatusChip } from '../components';

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

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const [submitting, setSubmitting] = useState(false);
    const [searchId, setSearchId] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await getUsers(searchId ? { id: searchId } : undefined);
            setUsers(Array.isArray(data) ? data : [data]);
        } catch (error) {
            console.error(error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [searchId]);

    const handleOpenDialog = (user = null) => {
        if (!isAdmin) {
            toast.error('Access Denied');
            return;
        }
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
        setSubmitting(true);

        try {
            if (editId) {
                await updateUser(editId, formData);
                toast.success('User updated successfully');
            } else {
                await createUser(formData);
                toast.success('User created successfully');
            }
            handleCloseDialog();
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error('Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenDeleteDialog = (id) => {
        if (!isAdmin) {
            toast.error('Access Denied');
            return;
        }
        setDeleteId(id);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            await deleteUser(deleteId);
            toast.success('User deleted successfully');
            setDeleteDialogOpen(false);
            setDeleteId(null);
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error('Delete failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (user) => {
        if (!isAdmin) {
            toast.error('Access Denied');
            return;
        }
        setSubmitting(true);
        try {
            const isActive = user.status === 'ACTIVE';
            if (isActive) {
                await deactivateUser(user.id);
                toast.success('User deactivated');
            } else {
                await activateUser(user.id);
                toast.success('User activated');
            }
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error('Status update failed');
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        { id: 'id', label: 'ID', minWidth: 60 },
        { id: 'fullName', label: 'Full Name', minWidth: 180 },
        { id: 'username', label: 'Username', minWidth: 120 },
        { id: 'phone', label: 'Phone', minWidth: 120 },
        { id: 'role', label: 'Role', minWidth: 100 },
        {
            id: 'activeToggle',
            label: 'Active',
            minWidth: 90,
            render: (_val, row) => (
                <Switch
                    checked={row.status === 'ACTIVE'}
                    onChange={() => handleToggleStatus(row)}
                    disabled={!isAdmin || submitting}
                    color="success"
                    size="small"
                />
            )
        },
        {
            id: 'status',
            label: 'Status',
            minWidth: 100,
            render: (val) => <StatusChip status={val} />
        },
        {
            id: 'createdAt',
            label: 'Created At',
            minWidth: 150,
            render: (val) => val ? new Date(val).toLocaleString() : '—'
        },
        {
            id: 'updatedAt',
            label: 'Updated At',
            minWidth: 150,
            render: (val) => val ? new Date(val).toLocaleString() : '—'
        },
    ];

    return (
        <Box>
            <PageHeader
                title="Users"
                subtitle="Manage system users and staff accounts"
                breadcrumbs={[{ label: 'Users', path: '/users' }]}
                actions={
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                        disabled={!isAdmin}
                    >
                        Add User
                    </Button>
                }
            />

            {/* Filter Bar */}
            <Box mb={3} display="flex" gap={2} p={2} component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <TextField
                    size="small"
                    label="Search by User ID"
                    type="number"
                    placeholder="Enter ID"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    sx={{ width: 250 }}
                />
                {searchId && (
                    <Button
                        color="inherit"
                        onClick={() => setSearchId('')}
                    >
                        Clear
                    </Button>
                )}
            </Box>

            <DataTable
                columns={columns}
                data={users}
                searchKey="fullName"
                loading={loading}
                emptyTitle="No users found"
                emptyDescription="Start by adding your first user account."
                emptyAction={
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                    >
                        Add First User
                    </Button>
                }
                actions={(row) => (
                    <>
                        <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleOpenDialog(row)} disabled={!isAdmin}>
                                <Edit fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleOpenDeleteDialog(row.id)}
                                disabled={!isAdmin}
                            >
                                <Delete fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </>
                )}
            />

            {/* Create/Edit Dialog */}
            <FormDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                onSubmit={handleSubmit}
                title={editId ? 'Edit User' : 'Add New User'}
                subtitle={editId ? 'Update user information' : 'Enter user details'}
                loading={submitting}
                maxWidth="sm"
            >
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                            disabled={submitting}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                            disabled={submitting}
                            helperText="Minimum 4 characters"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required={!editId}
                            disabled={submitting}
                            helperText={editId ? "Leave empty to keep unchanged" : "Minimum 6 characters"}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            disabled={submitting}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            label="Role"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            required
                            disabled={submitting}
                        >
                            <MenuItem value="ADMIN">ADMIN</MenuItem>
                            <MenuItem value="CASHIER">CASHIER</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </FormDialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone."
                confirmText="Delete"
                severity="error"
                loading={submitting}
            />
        </Box>
    );
}

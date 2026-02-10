import api from './axios';

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getUsers = (params) => api.get('/users', { params });
export const getUser = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const activateUser = (id) => api.patch(`/users/${id}/activate`);
export const deactivateUser = (id) => api.patch(`/users/${id}/deactivate`);
export const getSystemStatus = () => api.get('/auth/status');

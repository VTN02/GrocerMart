import api from './axios';

export const getCustomers = (params) => api.get('/credit-customers', { params });
export const getCustomer = (id) => api.get(`/credit-customers/${id}`);
export const createCustomer = (data) => api.post('/credit-customers', data);
export const updateCustomer = (id, data) => api.put(`/credit-customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/credit-customers/${id}`);
export const addPayment = (id, data) => api.post(`/credit-customers/${id}/payments`, data);

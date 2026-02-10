import api from './axios';

export const getOrders = (params) => api.get('/orders', { params });
export const getOrder = (id) => api.get(`/orders/${id}`);
export const createOrder = (data) => api.post('/orders', data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);
export const addOrderItem = (id, data) => api.post(`/orders/${id}/items`, data);
export const getOrderItems = (id) => api.get(`/orders/${id}/items`);
export const confirmOrder = (id) => api.put(`/orders/${id}/confirm`);

import axios from './axios';

// Users
export const getDeletedUsers = () => axios.get('/trash/users');
export const restoreUser = (id) => axios.post(`/trash/users/${id}/restore`);
export const deleteUserPermanent = (id) => axios.delete(`/trash/users/${id}`);

// Products
export const getDeletedProducts = () => axios.get('/trash/products');
export const restoreProduct = (id) => axios.post(`/trash/products/${id}/restore`);
export const deleteProductPermanent = (id) => axios.delete(`/trash/products/${id}`);

// Suppliers
export const getDeletedSuppliers = () => axios.get('/trash/suppliers');
export const restoreSupplier = (id) => axios.post(`/trash/suppliers/${id}/restore`);
export const deleteSupplierPermanent = (id) => axios.delete(`/trash/suppliers/${id}`);

// Credit Customers
export const getDeletedCustomers = () => axios.get('/trash/credit-customers');
export const restoreCustomer = (id) => axios.post(`/trash/credit-customers/${id}/restore`);
export const deleteCustomerPermanent = (id) => axios.delete(`/trash/credit-customers/${id}`);

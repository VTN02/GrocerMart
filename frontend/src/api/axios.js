import axios from 'axios';
import { API_BASE_URL } from '../config';
import { toast } from 'react-toastify';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        // Check if it's our backend ApiResponse wrapper
        const isWrapped = response.data &&
            typeof response.data === 'object' &&
            'success' in response.data &&
            'data' in response.data;

        if (isWrapped) {
            let unwrappedData = response.data.data;

            // Handle Spring Data Page object compatibility
            if (unwrappedData && typeof unwrappedData === 'object' && 'content' in unwrappedData && Array.isArray(unwrappedData.content)) {
                unwrappedData = unwrappedData.content;
            }

            // Toast success message if provided and not a GET/OPTIONS request
            const method = response.config.method?.toLowerCase();
            if (response.data.success && response.data.message && method !== 'get' && method !== 'options') {
                toast.success(response.data.message);
            }

            // Replace response.data with the unwrapped content
            // This allows { data } = await api.get(...) to work as expected
            response.data = unwrappedData;
        }

        return response;
    },
    (error) => {
        let message = "Something went wrong";
        if (error.response) {
            const data = error.response.data;
            if (data && typeof data === 'object') {
                if (data.details) {
                    // Validation errors Map
                    message = Object.values(data.details).join(', ');
                } else if (data.message) {
                    message = data.message;
                } else if (data.error) {
                    message = data.error;
                }
            }
        } else if (error.message) {
            message = error.message;
        }

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
            localStorage.clear();
            // Using window.location.href for immediate redirect
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        } else if (error.response?.status !== 401) {
            toast.error(message);
        }

        return Promise.reject(error);
    }
);

export default api;

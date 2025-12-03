import axios from 'axios';
import { API_URL } from '../config/apiConfig';

// Configurar baseURL para apuntar al backend correcto
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const orderService = {
  // Crear nuevo pedido
  createOrder: async (items) => {
    try {
      const response = await apiClient.post('/orders', { items });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error creando pedido');
    }
  },

  // Obtener pedidos del cliente autenticado
  getMyOrders: async () => {
    try {
      const response = await apiClient.get('/orders/my-orders');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo pedidos');
    }
  },

  // Obtener pedidos del patronista (pedidos de sus productos)
  getPatronistaOrders: async () => {
    try {
      const response = await apiClient.get('/orders/patronista-orders');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo pedidos del patronista');
    }
  },

  // Actualizar estado del pedido
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await apiClient.patch(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error actualizando estado del pedido');
    }
  },

  // Obtener detalles de un pedido específico
  getOrderById: async (orderId) => {
    try {
      const response = await apiClient.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo detalles del pedido');
    }
  }
};

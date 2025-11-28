import axios from 'axios';

// Crear instancia de axios con configuración base
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const apiClient = axios.create({
  baseURL: `${apiUrl}/admin`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token a todas las peticiones
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

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const adminService = {
  // Obtener todos los usuarios
  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error obteniendo usuarios' };
    }
  },

  // Obtener un usuario específico
  getUserById: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error obteniendo usuario' };
    }
  },

  // Cambiar el rol de un usuario
  changeUserRole: async (userId, newRole) => {
    try {
      const response = await apiClient.put(`/users/${userId}/role`, { role: newRole });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error cambiando rol de usuario' };
    }
  },

  // Obtener estadísticas del sistema
  getStats: async () => {
    try {
      const response = await apiClient.get('/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error obteniendo estadísticas' };
    }
  },

  // Eliminar un usuario
  deleteUser: async (userId) => {
    try {
      const response = await apiClient.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error eliminando usuario' };
    }
  }
};

export default adminService;

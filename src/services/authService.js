import axios from 'axios';
import { API_URL } from '../config/apiConfig';

const apiUrl = API_URL;
const apiClient = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
});

// Configurar interceptor para incluir token en todas las peticiones
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

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Registro de usuario
  register: async (userData) => {
    try {
      const response = await apiClient.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      if (error.response) {
        // El servidor respondió con un código de error
        throw new Error(error.response.data?.message || 'Error en el registro');
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté funcionando.');
      } else {
        // Algo más sucedió al configurar la petición
        throw new Error('Error al procesar la solicitud: ' + error.message);
      }
    }
  },

  // Inicio de sesión
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        // El servidor respondió con un código de error
        throw new Error(error.response.data?.message || 'Error en el inicio de sesión');
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté funcionando.');
      } else {
        // Algo más sucedió al configurar la petición
        throw new Error('Error al procesar la solicitud: ' + error.message);
      }
    }
  },

  // Obtener usuario actual
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/api/auth/me');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo usuario');
    }
  },

  // Actualizar perfil
  updateProfile: async (userData) => {
    try {
      const response = await apiClient.put('/api/auth/profile', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error actualizando perfil');
    }
  },

  // Cambiar contraseña
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await apiClient.put('/api/auth/password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error cambiando contraseña');
    }
  }
};
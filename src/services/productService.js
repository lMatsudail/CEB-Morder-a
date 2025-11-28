import axios from 'axios';

const apiClient = axios.create({
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

export const productService = {
  // Obtener todos los productos
  getAllProducts: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams ? `/api/products?${queryParams}` : '/api/products';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo productos');
    }
  },

  // Obtener producto por ID
  getProductById: async (id) => {
    try {
      const response = await apiClient.get(`/api/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo producto');
    }
  },

  // Crear nuevo producto (solo patronistas)
  createProduct: async (productData) => {
    try {
      const formData = new FormData();
      
      // Agregar campos de texto
      Object.keys(productData).forEach(key => {
        if (key !== 'images' && key !== 'files') {
          formData.append(key, productData[key]);
        }
      });

      // Agregar imágenes
      if (productData.images) {
        productData.images.forEach(image => {
          formData.append('images', image);
        });
      }

      // Agregar archivos de moldes
      if (productData.files) {
        productData.files.forEach(file => {
          formData.append('files', file);
        });
      }

      const response = await apiClient.post('/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error creando producto');
    }
  },

  // Actualizar producto
  updateProduct: async (id, productData) => {
    try {
      const formData = new FormData();
      
      Object.keys(productData).forEach(key => {
        if (key !== 'images' && key !== 'files') {
          formData.append(key, productData[key]);
        }
      });

      if (productData.images) {
        productData.images.forEach(image => {
          formData.append('images', image);
        });
      }

      if (productData.files) {
        productData.files.forEach(file => {
          formData.append('files', file);
        });
      }

      const response = await apiClient.put(`/api/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error actualizando producto');
    }
  },

  // Eliminar producto
  deleteProduct: async (id) => {
    try {
      const response = await apiClient.delete(`/api/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error eliminando producto');
    }
  },

  // Obtener productos del patronista autenticado
  getMyProducts: async () => {
    try {
      const response = await apiClient.get('/api/products/my-products');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo mis productos');
    }
  },

  // Obtener categorías
  getCategories: async () => {
    try {
      const response = await apiClient.get('/api/categories');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error obteniendo categorías');
    }
  }
};
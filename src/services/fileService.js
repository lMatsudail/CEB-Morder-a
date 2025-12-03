import axios from 'axios';
import { API_URL } from '../config/apiConfig';

const apiUrl = API_URL;

const apiClient = axios.create({
  baseURL: `${apiUrl}/api`,
});

// Interceptor para agregar token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fileService = {
  downloadFile: async (fileId) => {
    const response = await apiClient.get(`/files/download/${fileId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default fileService;

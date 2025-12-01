import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';

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

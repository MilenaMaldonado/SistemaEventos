import axios from 'axios';
import { API_CONFIG } from './config';

// Crear instancia de axios
const httpClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    const publicEndpoints = [
      '/api/ms-eventos/api/eventos',
      '/api/ms-eventos/api/evento/:id',
    ];

    const isPublicEndpoint = publicEndpoints.some((endpoint) => config.url.includes(endpoint));

    if (!isPublicEndpoint && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar errores 401 (No autorizado)
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    // Manejar otros errores HTTP
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Error desconocido';
    
    return Promise.reject({
      ...error,
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

// Funciones helper para diferentes tipos de request
export const apiRequest = {
  // GET request
  get: async (url, config = {}) => {
    return await httpClient.get(url, config);
  },
  
  // POST request
  post: async (url, data = {}, config = {}) => {
    return await httpClient.post(url, data, config);
  },
  
  // PUT request
  put: async (url, data = {}, config = {}) => {
    return await httpClient.put(url, data, config);
  },
  
  // PATCH request
  patch: async (url, data = {}, config = {}) => {
    return await httpClient.patch(url, data, config);
  },
  
  // DELETE request
  delete: async (url, config = {}) => {
    return await httpClient.delete(url, config);
  },
  
  // Request con parámetros de query
  getWithParams: async (url, params = {}, config = {}) => {
    return await httpClient.get(url, { params, ...config });
  },
  
  // Upload de archivos
  upload: async (url, formData, onProgress = null) => {
    return await httpClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress ? (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      } : undefined,
    });
  },
  
  // Download de archivos
  download: async (url, filename) => {
    const response = await httpClient.get(url, {
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    return response;
  }
};

export default httpClient;
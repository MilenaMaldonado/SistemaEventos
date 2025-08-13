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
    // Normalizar URL del request
    const urlPath = (config.url || '').toString();

    // Endpoints públicos que no requieren Authorization
    const token = localStorage.getItem('authToken');
    
    const publicEndpoints = [
      '/ms-eventos/api/eventos',
      '/ms-eventos/api/eventos/',
      '/ms-eventos/api/eventos/search',
      '/ms-eventos/api/eventos/categoria',
      '/ms-eventos/api/eventos/fecha',
      '/ms-eventos/api/eventos/ciudad',
    ];

    const isPublicEndpoint = publicEndpoints.some((endpoint) => urlPath.startsWith(endpoint) || urlPath.includes(`${endpoint}/`));

    if (!isPublicEndpoint && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// COMENTADO: Interceptor automático que causaba logout inmediato
// httpClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Manejar errores de autenticación (401 y 403)
//     if (error.response?.status === 401 || error.response?.status === 403) {
//       const currentPath = window.location.pathname;
//       const publicPaths = ['/login', '/register', '/', '/eventos'];
      
//       // Solo hacer auto-logout si no estamos en páginas públicas
//       if (!publicPaths.includes(currentPath)) {
//         console.log('Token inválido o expirado detectado - auto logout');
        
//         // Limpiar tokens
//         localStorage.removeItem('authToken');
//         localStorage.removeItem('userData');
        
//         // Verificar si la respuesta indica token expirado
//         const errorData = error.response?.data;
//         const errorMessage = errorData?.message || errorData?.error || '';
        
//         if (errorMessage.toLowerCase().includes('token') || 
//             errorMessage.toLowerCase().includes('expired') ||
//             errorMessage.toLowerCase().includes('unauthorized') ||
//             errorMessage.toLowerCase().includes('forbidden')) {
          
//           // Disparar evento personalizado para que AuthContext lo maneje
//           window.dispatchEvent(new CustomEvent('tokenExpired'));
//         }
        
//         // Redirigir al login
//         window.location.href = '/login';
//       }
//     }
    
//     // Manejar otros errores HTTP
//     const errorMessage = error.response?.data?.message || 
//                         error.response?.data?.error || 
//                         error.message || 
//                         'Error desconocido';
    
//     return Promise.reject({
//       ...error,
//       message: errorMessage,
//       status: error.response?.status,
//       data: error.response?.data
//     });
//   }
// );

// Interceptor con auto-logout para errores 401
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('❌ Error HTTP:', error.response?.status, error.response?.data);
    
    // Manejar errores de autenticación (401)
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const publicPaths = ['/login', '/register', '/', '/eventos'];
      
      // Solo hacer auto-logout si no estamos en páginas públicas
      if (!publicPaths.includes(currentPath)) {
        console.log('🔴 Error 401 detectado - ejecutando auto logout');
        
        // Limpiar tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        
        // Disparar evento personalizado para que AuthContext lo maneje
        window.dispatchEvent(new CustomEvent('tokenExpired', {
          detail: { reason: 'unauthorized_401' }
        }));
        
        // Redirigir al login
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    
    // Manejar el error
    const errorMessage = error.response?.data?.mensaje || 
                        error.response?.data?.message || 
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
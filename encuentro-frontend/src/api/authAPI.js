import { apiRequest } from './httpClient';
import { API_CONFIG, buildUrl } from './config';

export const authAPI = {
  // Iniciar sesión
  login: async (credentials) => {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Registrar usuario
  register: async (userData) => {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Refrescar token
  refreshToken: async () => {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Cerrar sesión
  logout: async () => {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
      localStorage.removeItem('authToken');
      return response;
    } catch (error) {
      localStorage.removeItem('authToken');
      throw error;
    }
  },

  // Validar token JWT
  validateToken: async () => {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.AUTH.VALIDATE_TOKEN);
      return response;
    } catch (error) {
      throw error;
    }
  },


  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  // Obtener token del localStorage
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  // Guardar token en localStorage
  setToken: (token) => {
    localStorage.setItem('authToken', token);
  },

  // Eliminar token del localStorage
  removeToken: () => {
    localStorage.removeItem('authToken');
  }
};

export default authAPI;
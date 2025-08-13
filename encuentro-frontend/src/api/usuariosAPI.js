import { apiRequest } from './httpClient';
import { API_CONFIG, buildUrl } from './config';

export const usuariosAPI = {
  // Obtener todos los usuarios (Admin)
  getAll: async (params = {}) => {
    try {
      const response = await apiRequest.getWithParams(API_CONFIG.ENDPOINTS.USUARIOS.GET_ALL, params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener usuario por ID
  getById: async (id) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.USUARIOS.GET_BY_ID, { id });
      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener usuario por cédula
  getUsuarioByCedula: async (cedula) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.USUARIOS.GET_BY_CEDULA, { cedula });
      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener perfil del usuario actual
  getProfile: async () => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.USUARIOS.PROFILE);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar perfil del usuario actual
  updateProfile: async (userData) => {
    try {
      const response = await apiRequest.put(API_CONFIG.ENDPOINTS.USUARIOS.UPDATE_PROFILE, userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Crear usuario (Admin) - Usa endpoint de registro
  create: async (userData) => {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar usuario (Admin)
  update: async (id, userData) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.USUARIOS.UPDATE, { id });
      const response = await apiRequest.put(url, userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar usuario (Admin)
  delete: async (id) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.USUARIOS.DELETE, { id });
      const response = await apiRequest.delete(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Buscar usuarios (Admin)
  search: async (query, filters = {}) => {
    try {
      const params = { q: query, ...filters };
      const response = await apiRequest.getWithParams(`${API_CONFIG.ENDPOINTS.USUARIOS.BASE}/search`, params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Cambiar contraseña
  changePassword: async (passwordData) => {
    try {
      const response = await apiRequest.post(`${API_CONFIG.ENDPOINTS.USUARIOS.BASE}/change-password`, passwordData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Subir avatar
  uploadAvatar: async (file, onProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await apiRequest.upload(`${API_CONFIG.ENDPOINTS.USUARIOS.BASE}/avatar`, formData, onProgress);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar avatar
  deleteAvatar: async () => {
    try {
      const response = await apiRequest.delete(`${API_CONFIG.ENDPOINTS.USUARIOS.BASE}/avatar`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener estadísticas de usuario
  getStats: async (id = null) => {
    try {
      const endpoint = id 
        ? buildUrl(`${API_CONFIG.ENDPOINTS.USUARIOS.BASE}/{id}/stats`, { id })
        : `${API_CONFIG.ENDPOINTS.USUARIOS.BASE}/stats`;
      
      const response = await apiRequest.get(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener historial de actividades
  getActivityHistory: async (params = {}) => {
    try {
      const response = await apiRequest.getWithParams(`${API_CONFIG.ENDPOINTS.USUARIOS.BASE}/activity`, params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Activar/Desactivar usuario (Admin)
  toggleUserStatus: async (id, status) => {
    try {
      const url = buildUrl(`${API_CONFIG.ENDPOINTS.USUARIOS.BASE}/{id}/status`, { id });
      const response = await apiRequest.put(url, { active: status });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Asignar rol a usuario (Admin)
  assignRole: async (userId, roleId) => {
    try {
      const url = buildUrl(`${API_CONFIG.ENDPOINTS.USUARIOS.BASE}/{id}/role`, { id: userId });
      const response = await apiRequest.post(url, { roleId });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default usuariosAPI;
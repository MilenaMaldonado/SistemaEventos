import { apiRequest } from './httpClient';
import { API_CONFIG, buildUrl } from './config';

export const rolesAPI = {
  // Obtener todos los roles
  getAll: async (params = {}) => {
    try {
      const response = await apiRequest.getWithParams(API_CONFIG.ENDPOINTS.ROLES.GET_ALL, params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener rol por ID
  getById: async (id) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.ROLES.GET_BY_ID, { id });
      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Crear nuevo rol
  create: async (rolData) => {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.ROLES.CREATE, rolData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar rol
  update: async (id, rolData) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.ROLES.UPDATE, { id });
      const response = await apiRequest.put(url, rolData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar rol
  delete: async (id) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.ROLES.DELETE, { id });
      const response = await apiRequest.delete(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener permisos de un rol
  getPermisos: async (id) => {
    try {
      const url = buildUrl(`${API_CONFIG.ENDPOINTS.ROLES.BASE}/{id}/permisos`, { id });
      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Asignar permisos a un rol
  asignarPermisos: async (id, permisos) => {
    try {
      const url = buildUrl(`${API_CONFIG.ENDPOINTS.ROLES.BASE}/{id}/permisos`, { id });
      const response = await apiRequest.post(url, { permisos });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Revocar permisos de un rol
  revocarPermisos: async (id, permisos) => {
    try {
      const url = buildUrl(`${API_CONFIG.ENDPOINTS.ROLES.BASE}/{id}/permisos/revoke`, { id });
      const response = await apiRequest.post(url, { permisos });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener usuarios con un rol específico
  getUsuariosPorRol: async (id, params = {}) => {
    try {
      const url = buildUrl(`${API_CONFIG.ENDPOINTS.ROLES.BASE}/{id}/usuarios`, { id });
      const response = await apiRequest.getWithParams(url, params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todos los permisos disponibles
  getAllPermisos: async () => {
    try {
      const response = await apiRequest.get(`${API_CONFIG.ENDPOINTS.ROLES.BASE}/permisos`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Verificar si un rol tiene un permiso específico
  hasPermission: async (rolId, permiso) => {
    try {
      const url = buildUrl(`${API_CONFIG.ENDPOINTS.ROLES.BASE}/{id}/has-permission`, { id: rolId });
      const response = await apiRequest.post(url, { permiso });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Clonar rol
  clone: async (id, nuevoNombre) => {
    try {
      const url = buildUrl(`${API_CONFIG.ENDPOINTS.ROLES.BASE}/{id}/clone`, { id });
      const response = await apiRequest.post(url, { nombre: nuevoNombre });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener jerarquía de roles
  getJerarquia: async () => {
    try {
      const response = await apiRequest.get(`${API_CONFIG.ENDPOINTS.ROLES.BASE}/jerarquia`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Establecer rol padre
  setRolPadre: async (rolId, rolPadreId) => {
    try {
      const url = buildUrl(`${API_CONFIG.ENDPOINTS.ROLES.BASE}/{id}/padre`, { id: rolId });
      const response = await apiRequest.put(url, { rolPadreId });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default rolesAPI;
import { apiRequest } from './httpClient';
import { API_CONFIG, buildUrl } from './config';

export const notificacionesAPI = {
  // Obtener mis notificaciones
  getMisNotificaciones: async (params = {}) => {
    try {
      const response = await apiRequest.getWithParams(API_CONFIG.ENDPOINTS.NOTIFICACIONES.MIS_NOTIFICACIONES, params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener notificación por ID
  getById: async (id) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.NOTIFICACIONES.GET_BY_ID, { id });
      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Marcar notificación como leída
  marcarComoLeida: async (id) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.NOTIFICACIONES.MARCAR_LEIDA, { id });
      const response = await apiRequest.put(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Marcar todas las notificaciones como leídas
  marcarTodasLeidas: async () => {
    try {
      const response = await apiRequest.put(API_CONFIG.ENDPOINTS.NOTIFICACIONES.MARCAR_TODAS_LEIDAS);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar notificación
  delete: async (id) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.NOTIFICACIONES.DELETE, { id });
      const response = await apiRequest.delete(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Enviar notificación (Admin)
  send: async (notificationData) => {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.NOTIFICACIONES.SEND, notificationData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener notificaciones no leídas
  getUnread: async () => {
    try {
      const response = await apiRequest.get(`${API_CONFIG.ENDPOINTS.NOTIFICACIONES.BASE}/unread`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener contador de notificaciones no leídas
  getUnreadCount: async () => {
    try {
      const response = await apiRequest.get(`${API_CONFIG.ENDPOINTS.NOTIFICACIONES.BASE}/unread/count`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener notificaciones por tipo
  getByType: async (type, params = {}) => {
    try {
      const response = await apiRequest.getWithParams(`${API_CONFIG.ENDPOINTS.NOTIFICACIONES.BASE}/tipo/${type}`, params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener configuración de notificaciones del usuario
  getSettings: async () => {
    try {
      const response = await apiRequest.get(`${API_CONFIG.ENDPOINTS.NOTIFICACIONES.BASE}/settings`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar configuración de notificaciones
  updateSettings: async (settings) => {
    try {
      const response = await apiRequest.put(`${API_CONFIG.ENDPOINTS.NOTIFICACIONES.BASE}/settings`, settings);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Suscribirse a notificaciones push
  subscribePush: async (subscription) => {
    try {
      const response = await apiRequest.post(`${API_CONFIG.ENDPOINTS.NOTIFICACIONES.BASE}/subscribe`, subscription);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Desuscribirse de notificaciones push
  unsubscribePush: async () => {
    try {
      const response = await apiRequest.delete(`${API_CONFIG.ENDPOINTS.NOTIFICACIONES.BASE}/subscribe`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Enviar notificación broadcast (Admin)
  broadcast: async (notificationData) => {
    try {
      const response = await apiRequest.post(`${API_CONFIG.ENDPOINTS.NOTIFICACIONES.BASE}/broadcast`, notificationData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todas las notificaciones (Admin)
  getAll: async (params = {}) => {
    try {
      const response = await apiRequest.getWithParams(API_CONFIG.ENDPOINTS.NOTIFICACIONES.BASE, params);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default notificacionesAPI;
import { apiRequest } from './httpClient';
import { API_CONFIG, buildUrl } from './config';

export const eventosAPI = {
  // Obtener todos los eventos
  getAll: async (params = {}) => {
    try {
      const response = await apiRequest.getWithParams(API_CONFIG.ENDPOINTS.EVENTOS.GET_ALL, params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener evento por ID
  getById: async (id) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENTOS.GET_BY_ID, { id });
      const response = await apiRequest.get(url);
      return response.data; // Axios devuelve los datos en response.data
    } catch (error) {
      throw error;
    }
  },

  // Crear nuevo evento
  create: async (eventoData) => {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.EVENTOS.CREATE, eventoData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar evento
  update: async (id, eventoData) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENTOS.UPDATE, { id });
      const response = await apiRequest.put(url, eventoData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar evento
  delete: async (id) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENTOS.DELETE, { id });
      const response = await apiRequest.delete(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Buscar eventos
  search: async (query, filters = {}) => {
    try {
      const params = { q: query, ...filters };
      const response = await apiRequest.getWithParams(API_CONFIG.ENDPOINTS.EVENTOS.SEARCH, params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener eventos por categoría
  getByCategory: async (categoria) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENTOS.BY_CATEGORY, { categoria });
      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener eventos por fecha
  getByDate: async (fecha) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENTOS.BY_DATE, { fecha });
      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener eventos por ciudad
  getByCity: async (ciudad) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENTOS.BY_CITY, { ciudad });
      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener ciudades
  getCiudades: async () => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.CIUDADES.GET_ALL);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Crear nueva ciudad
  createCiudad: async (ciudadData) => {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.CIUDADES.CREATE, ciudadData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar ciudad
  updateCiudad: async (id, ciudadData) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.CIUDADES.UPDATE, { id });
      const response = await apiRequest.put(url, ciudadData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar ciudad
  deleteCiudad: async (id) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.CIUDADES.DELETE, { id });
      const response = await apiRequest.delete(url);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default eventosAPI;
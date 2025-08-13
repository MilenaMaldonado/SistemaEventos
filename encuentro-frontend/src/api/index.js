import { useState } from 'react';

// Exportar todas las APIs desde un punto central
export { default as authAPI } from './authAPI';
export { default as eventosAPI } from './eventosAPI';
export { default as ticketsAPI } from './ticketsAPI';
export { default as ticketsMetricasAPI } from './ticketsMetricas';
export { default as usuariosAPI } from './usuariosAPI';
export { default as notificacionesAPI } from './notificacionesAPI';
export { default as reportesAPI } from './reportesAPI';
export { default as rolesAPI } from './rolesAPI';

// Exportar configuración y cliente HTTP
export { API_CONFIG, buildUrl, getHeaders } from './config';
export { apiRequest } from './httpClient';

// Funciones de utilidad para manejo de errores
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  // Extraer mensaje de error
  let message = 'Error desconocido';
  
  if (error.response) {
    // Error de respuesta del servidor
    // Primero intentar con la estructura del servidor (data.mensaje)
    message = error.response.data?.mensaje || 
              error.response.data?.message || 
              error.response.data?.error || 
              error.response.data?.respuesta ||
              `Error ${error.response.status}`;
  } else if (error.request) {
    // Error de red
    message = 'Error de conexión. Verifica tu conexión a internet.';
  } else {
    // Error de configuración
    message = error.message || 'Error en la configuración de la petición';
  }
  
  return {
    message,
    status: error.response?.status,
    data: error.response?.data,
    originalError: error
  };
};

// Función para verificar si el token está expirado
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Función para formatear parámetros de query
export const formatQueryParams = (params) => {
  const filtered = Object.entries(params)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
  
  return new URLSearchParams(filtered).toString();
};

// Constantes de error comunes
export const ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500,
  NETWORK_ERROR: 'NETWORK_ERROR'
};

// Tipos de notificación
export const NOTIFICATION_TYPES = {
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR'
};

// Estados de tickets
export const TICKET_STATUS = {
  ACTIVE: 'ACTIVE',
  USED: 'USED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
};

// Estados de eventos
export const EVENT_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED'
};

// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  MODERATOR: 'MODERATOR'
};

// Hook personalizado para manejo de API
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  const execute = async (apiCall, onSuccess = null, onError = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall();
      setData(response.data);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      return response.data;
    } catch (error) {
      const processedError = handleApiError(error);
      setError(processedError);
      
      if (onError) {
        onError(processedError);
      }
      
      throw processedError;
    } finally {
      setLoading(false);
    }
  };
  
  return { loading, error, data, execute };
};

// Función para crear una instancia de API con configuración personalizada
export const createApiClient = (baseURL, customConfig = {}) => {
  const config = {
    ...API_CONFIG,
    BASE_URL: baseURL,
    ...customConfig
  };
  
  return {
    config,
    get: (url, params) => apiRequest.getWithParams(url, params),
    post: (url, data) => apiRequest.post(url, data),
    put: (url, data) => apiRequest.put(url, data),
    delete: (url) => apiRequest.delete(url),
  };
};
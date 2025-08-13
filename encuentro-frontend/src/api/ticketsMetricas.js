import axios from 'axios';

// Cliente HTTP específico para el microservicio de tickets en puerto 8081
const ticketsHttpClient = axios.create({
  baseURL: 'http://localhost:8081',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
ticketsHttpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor simplificado para manejo de errores
ticketsHttpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('❌ Error HTTP en tickets service:', error.response?.status, error.response?.data);
    
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

export const ticketsMetricasAPI = {
  // Obtener métricas generales de tickets
  getMetricasGenerales: async () => {
    try {
      console.log('🎫 Llamando a localhost:8081/api/metricas');
      const response = await ticketsHttpClient.get('/api/metricas');
      console.log('🎫 Respuesta completa de /api/metricas:', response);
      return response;
    } catch (error) {
      console.log('❌ Error en getMetricasGenerales:', error);
      throw error;
    }
  },

  // Obtener métricas del mes actual
  getMetricasDelMes: async () => {
    try {
      console.log('🎫 Llamando a localhost:8081/api/metricas/mes');
      const response = await ticketsHttpClient.get('/api/metricas/mes');
      console.log('🎫 Respuesta completa de /api/metricas/mes:', response);
      return response;
    } catch (error) {
      console.log('❌ Error en getMetricasDelMes:', error);
      throw error;
    }
  },

  // Obtener métricas por rango de fechas
  getMetricasPorRango: async (fechaInicio, fechaFin) => {
    try {
      const params = new URLSearchParams({
        fechaInicio: fechaInicio,
        fechaFin: fechaFin
      });
      const url = `/api/metricas/rango?${params}`;
      console.log('🎫 Llamando a localhost:8081' + url);
      const response = await ticketsHttpClient.get(url);
      console.log('🎫 Respuesta completa de /api/metricas/rango:', response);
      return response;
    } catch (error) {
      console.log('❌ Error en getMetricasPorRango:', error);
      throw error;
    }
  }
};

export default ticketsMetricasAPI;
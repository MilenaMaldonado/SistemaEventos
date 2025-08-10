import { apiRequest } from './httpClient';
import { API_CONFIG, buildUrl } from './config';

export const reportesAPI = {
  // Obtener reporte de ventas
  getReporteVentas: async (params = {}) => {
    try {
      const response = await apiRequest.getWithParams(API_CONFIG.ENDPOINTS.REPORTES.VENTAS, params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener reporte de asistencia por evento
  getReporteAsistencia: async (eventoId) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.REPORTES.ASISTENCIA, { eventoId });
      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener reporte de ventas por evento específico
  getVentasPorEvento: async (eventoId, params = {}) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.REPORTES.VENTAS_POR_EVENTO, { eventoId });
      const response = await apiRequest.getWithParams(url, params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener reporte de ventas por rango de fechas
  getVentasPorFecha: async (fechaInicio, fechaFin, params = {}) => {
    try {
      const queryParams = {
        fechaInicio,
        fechaFin,
        ...params
      };
      const response = await apiRequest.getWithParams(API_CONFIG.ENDPOINTS.REPORTES.VENTAS_POR_FECHA, queryParams);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener estadísticas generales
  getEstadisticasGenerales: async (params = {}) => {
    try {
      const response = await apiRequest.getWithParams(API_CONFIG.ENDPOINTS.REPORTES.ESTADISTICAS_GENERALES, params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Exportar reporte de ventas a Excel
  exportVentasExcel: async (params = {}) => {
    try {
      const response = await apiRequest.download(
        `${API_CONFIG.ENDPOINTS.REPORTES.VENTAS}/export/excel?${new URLSearchParams(params)}`,
        `reporte_ventas_${new Date().getTime()}.xlsx`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Exportar reporte de ventas a PDF
  exportVentasPDF: async (params = {}) => {
    try {
      const response = await apiRequest.download(
        `${API_CONFIG.ENDPOINTS.REPORTES.VENTAS}/export/pdf?${new URLSearchParams(params)}`,
        `reporte_ventas_${new Date().getTime()}.pdf`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Exportar reporte de asistencia a Excel
  exportAsistenciaExcel: async (eventoId) => {
    try {
      const url = buildUrl(`${API_CONFIG.ENDPOINTS.REPORTES.BASE}/asistencia/{eventoId}/export/excel`, { eventoId });
      const response = await apiRequest.download(
        url,
        `reporte_asistencia_evento_${eventoId}_${new Date().getTime()}.xlsx`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Exportar reporte de asistencia a PDF
  exportAsistenciaPDF: async (eventoId) => {
    try {
      const url = buildUrl(`${API_CONFIG.ENDPOINTS.REPORTES.BASE}/asistencia/{eventoId}/export/pdf`, { eventoId });
      const response = await apiRequest.download(
        url,
        `reporte_asistencia_evento_${eventoId}_${new Date().getTime()}.pdf`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener reporte de ingresos por período
  getReporteIngresos: async (periodo, params = {}) => {
    try {
      const queryParams = { periodo, ...params };
      const response = await apiRequest.getWithParams(`${API_CONFIG.ENDPOINTS.REPORTES.BASE}/ingresos`, queryParams);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener reporte de eventos más populares
  getEventosPopulares: async (params = {}) => {
    try {
      const response = await apiRequest.getWithParams(`${API_CONFIG.ENDPOINTS.REPORTES.BASE}/eventos-populares`, params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener reporte de usuarios activos
  getUsuariosActivos: async (params = {}) => {
    try {
      const response = await apiRequest.getWithParams(`${API_CONFIG.ENDPOINTS.REPORTES.BASE}/usuarios-activos`, params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener métricas del dashboard
  getDashboardMetrics: async (params = {}) => {
    try {
      const response = await apiRequest.getWithParams(`${API_CONFIG.ENDPOINTS.REPORTES.BASE}/dashboard`, params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener reporte personalizado
  getReportePersonalizado: async (reporteConfig) => {
    try {
      const response = await apiRequest.post(`${API_CONFIG.ENDPOINTS.REPORTES.BASE}/personalizado`, reporteConfig);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Programar reporte automático
  programarReporte: async (scheduleData) => {
    try {
      const response = await apiRequest.post(`${API_CONFIG.ENDPOINTS.REPORTES.BASE}/programar`, scheduleData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener reportes programados
  getReportesProgramados: async () => {
    try {
      const response = await apiRequest.get(`${API_CONFIG.ENDPOINTS.REPORTES.BASE}/programados`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Cancelar reporte programado
  cancelarReporteProgramado: async (reporteId) => {
    try {
      const response = await apiRequest.delete(`${API_CONFIG.ENDPOINTS.REPORTES.BASE}/programados/${reporteId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default reportesAPI;
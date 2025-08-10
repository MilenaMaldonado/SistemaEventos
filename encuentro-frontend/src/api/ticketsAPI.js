/* eslint-disable no-useless-catch */
import { apiRequest } from './httpClient';
import { API_CONFIG, buildUrl } from './config';

export const ticketsAPI = {
  // Obtener eventos disponibles para compra de tickets
  getEventosDisponibles: async (params = {}) => {
    try {
      const response = await apiRequest.getWithParams(API_CONFIG.ENDPOINTS.TICKETS.EVENTOS_DISPONIBLES, params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener evento disponible por ID (con capacidad)
  getEventoDisponibleById: async (id) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.TICKETS.EVENTO_DISPONIBLE_BY_ID, { id });
      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Crear evento disponible
  createEventoDisponible: async (eventoData) => {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.TICKETS.EVENTO_DISPONIBLE_CREATE, eventoData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // === TICKETS CLIENTES ===
  
  // Obtener todos los tickets
  getAllTickets: async () => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.TICKETS.TICKETS_CLIENTES);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener ticket por ID
  getTicketById: async (id) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.TICKETS.TICKET_BY_ID, { id });
      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Crear ticket individual
  createTicket: async (ticketData) => {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.TICKETS.TICKETS_CLIENTES, ticketData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar ticket
  updateTicket: async (id, ticketData) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.TICKETS.TICKET_BY_ID, { id });
      const response = await apiRequest.put(url, ticketData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar ticket
  deleteTicket: async (id) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.TICKETS.TICKET_BY_ID, { id });
      const response = await apiRequest.delete(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Compra múltiple de tickets
  compraMultiple: async (compraData) => {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.TICKETS.COMPRA_MULTIPLE, compraData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener tickets por evento
  getTicketsPorEvento: async (idEvento) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.TICKETS.TICKETS_POR_EVENTO, { idEvento });
      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener tickets por cliente
  getTicketsPorCliente: async (cedula) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.TICKETS.TICKETS_POR_CLIENTE, { cedula });
      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener tickets por evento y cliente
  getTicketsPorEventoYCliente: async (idEvento, cedula) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.TICKETS.TICKETS_POR_EVENTO_Y_CLIENTE, { idEvento, cedula });
      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Validar ticket
  validateTicket: async (id) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.TICKETS.VALIDATE_TICKET, { id });
      const response = await apiRequest.post(url);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// === API DE ASIENTOS ===
export const asientosAPI = {
  // Obtener asientos por evento
  getAsientosPorEvento: async (idEvento) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.ASIENTOS.POR_EVENTO, { idEvento });
      console.log("Esta es la URL: " + url);
      const response = await apiRequest.get(url);
      console.log("Esta es la respuesta: ",response);
      return response; // Return the full response with mensaje/respuesta structure
    } catch (error) {
      throw error;
    }
  },

  // Contar asientos disponibles
  getAsientosDisponibles: async (idEvento) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.ASIENTOS.DISPONIBLES, { idEvento });
      const response = await apiRequest.get(url);
      return response; // Return the full response
    } catch (error) {
      throw error;
    }
  },

  // Contar asientos vendidos
  getAsientosVendidos: async (idEvento) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.ASIENTOS.VENDIDOS, { idEvento });
      const response = await apiRequest.get(url);
      return response; // Return the full response
    } catch (error) {
      throw error;
    }
  },

  // Seleccionar asiento individual
  seleccionarAsiento: async (reservaData) => {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.ASIENTOS.SELECCIONAR, reservaData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Deseleccionar asiento
  deseleccionarAsiento: async (idEvento, numeroAsiento) => {
    try {
      const response = await apiRequest.post(
        `${API_CONFIG.ENDPOINTS.ASIENTOS.DESELECCIONAR}?idEvento=${idEvento}&numeroAsiento=${numeroAsiento}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Reservar asiento
  reservarAsiento: async (reservaData) => {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.ASIENTOS.RESERVAR, reservaData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Comprar asiento individual
  comprarAsiento: async (compraData) => {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.ASIENTOS.COMPRAR, compraData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Liberar asiento
  liberarAsiento: async (idEvento, numeroAsiento) => {
    try {
      const response = await apiRequest.post(
        `${API_CONFIG.ENDPOINTS.ASIENTOS.LIBERAR}?idEvento=${idEvento}&numeroAsiento=${numeroAsiento}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Seleccionar múltiples asientos
  seleccionarMultiplesAsientos: async (seleccionData) => {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.ASIENTOS.SELECCIONAR_MULTIPLES, seleccionData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Deseleccionar múltiples asientos
  deseleccionarMultiplesAsientos: async (idEvento, numerosAsientos) => {
    try {
      const params = new URLSearchParams();
      params.append('idEvento', idEvento);
      numerosAsientos.forEach(numero => params.append('numerosAsientos', numero));
      
      const response = await apiRequest.post(
        `${API_CONFIG.ENDPOINTS.ASIENTOS.DESELECCIONAR_MULTIPLES}?${params.toString()}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Comprar múltiples asientos
  comprarMultiplesAsientos: async (compraData) => {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.ASIENTOS.COMPRAR_MULTIPLES, compraData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtener asientos seleccionados por cliente
  getAsientosSeleccionadosPorCliente: async (idEvento, cedula) => {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.ASIENTOS.SELECCIONADOS_POR_CLIENTE, { idEvento, cedula });
      const response = await apiRequest.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Generar asientos para evento (Admin)
  generarAsientos: async (idEvento, capacidad, precio = 50.0) => {
    try {
      const response = await apiRequest.post(
        `${API_CONFIG.ENDPOINTS.ASIENTOS.GENERAR}?idEvento=${idEvento}&capacidad=${capacidad}&precio=${precio}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Limpiar asientos excedentes
  limpiarAsientosExcedentes: async (idEvento, capacidadMaxima) => {
    try {
      const response = await apiRequest.post(
        `${API_CONFIG.ENDPOINTS.ASIENTOS.LIMPIAR_EXCEDENTES}?idEvento=${idEvento}&capacidadMaxima=${capacidadMaxima}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default ticketsAPI;
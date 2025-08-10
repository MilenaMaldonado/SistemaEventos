// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api',
  TIMEOUT: 10000,
  ENDPOINTS: {
    // Autenticación
    AUTH: {
      BASE: '/ms-autenticacion/api/auth',
      LOGIN: '/ms-autenticacion/api/auth/login',
      REGISTER: '/ms-autenticacion/api/auth/register',
      REFRESH: '/ms-autenticacion/api/auth/refresh',
      LOGOUT: '/ms-autenticacion/api/auth/logout',
      VALIDATE: '/ms-autenticacion/api/auth/validate'
    },
    
    // Eventos
    EVENTOS: {
      BASE: '/ms-eventos/api/eventos',
      GET_ALL: '/ms-eventos/api/eventos',
      GET_BY_ID: '/ms-eventos/api/eventos/{id}',
      CREATE: '/ms-eventos/api/eventos',
      UPDATE: '/ms-eventos/api/eventos/{id}',
      DELETE: '/ms-eventos/api/eventos/{id}',
      SEARCH: '/ms-eventos/api/eventos/search',
      BY_CATEGORY: '/ms-eventos/api/eventos/categoria/{categoria}',
      BY_DATE: '/ms-eventos/api/eventos/fecha/{fecha}',
      BY_CITY: '/ms-eventos/api/eventos/ciudad/{ciudad}'
    },
    
    // Ciudades
    CIUDADES: {
      BASE: '/ms-eventos/api/ciudades',
      GET_ALL: '/ms-eventos/api/ciudades',
      GET_BY_ID: '/ms-eventos/api/ciudades/{id}',
      CREATE: '/ms-eventos/api/ciudades',
      UPDATE: '/ms-eventos/api/ciudades/{id}',
      DELETE: '/ms-eventos/api/ciudades/{id}'
    },
    
    // Tickets
    TICKETS: {
      BASE: '/ms-tickets/api',
      EVENTOS_DISPONIBLES: '/ms-tickets/api/eventos/disponibles',
      EVENTO_DISPONIBLE_BY_ID: '/ms-tickets/api/eventos-disponibles/{id}',
      EVENTO_DISPONIBLE_CREATE: '/ms-tickets/api/eventos-disponibles',
      EVENTO_BY_ID: '/ms-tickets/api/eventos/{id}',
      TICKETS_CLIENTES: '/ms-tickets/api/tickets-clientes',
      TICKET_BY_ID: '/ms-tickets/api/tickets-clientes/{id}',
      COMPRA_MULTIPLE: '/ms-tickets/api/tickets-clientes/compra-multiple',
      TICKETS_POR_EVENTO: '/ms-tickets/api/tickets-clientes/evento/{idEvento}',
      TICKETS_POR_CLIENTE: '/ms-tickets/api/tickets-clientes/cliente/{cedula}',
      TICKETS_POR_EVENTO_Y_CLIENTE: '/ms-tickets/api/tickets-clientes/evento/{idEvento}/cliente/{cedula}',
      VALIDATE_TICKET: '/ms-tickets/api/tickets-clientes/{id}/validate'
    },
    
    // Asientos
    ASIENTOS: {
      BASE: '/ms-tickets/api/asientos',
      POR_EVENTO: '/ms-tickets/api/asientos/evento/{idEvento}',
      DISPONIBLES: '/ms-tickets/api/asientos/evento/{idEvento}/disponibles',
      VENDIDOS: '/ms-tickets/api/asientos/evento/{idEvento}/vendidos',
      SELECCIONAR: '/ms-tickets/api/asientos/seleccionar',
      DESELECCIONAR: '/ms-tickets/api/asientos/deseleccionar',
      RESERVAR: '/ms-tickets/api/asientos/reservar',
      COMPRAR: '/ms-tickets/api/asientos/comprar',
      LIBERAR: '/ms-tickets/api/asientos/liberar',
      SELECCIONAR_MULTIPLES: '/ms-tickets/api/asientos/seleccionar-multiples',
      DESELECCIONAR_MULTIPLES: '/ms-tickets/api/asientos/deseleccionar-multiples',
      COMPRAR_MULTIPLES: '/ms-tickets/api/asientos/comprar-multiples',
      SELECCIONADOS_POR_CLIENTE: '/ms-tickets/api/asientos/seleccionados/evento/{idEvento}/cliente/{cedula}',
      GENERAR: '/ms-tickets/api/asientos/generar',
      LIMPIAR_EXCEDENTES: '/ms-tickets/api/asientos/limpiar-excedentes'
    },
    
    // Usuarios
    USUARIOS: {
      BASE: '/ms-usuarios/api/usuarios',
      GET_ALL: '/ms-usuarios/api/usuarios',
      GET_BY_ID: '/ms-usuarios/api/usuarios/{id}',
      GET_BY_CEDULA: '/ms-usuarios/api/usuarios/{cedula}',
      PROFILE: '/ms-usuarios/api/usuarios/profile',
      UPDATE_PROFILE: '/ms-usuarios/api/usuarios/profile',
      CREATE: '/ms-usuarios/api/usuarios',
      UPDATE: '/ms-usuarios/api/usuarios/{id}',
      DELETE: '/ms-usuarios/api/usuarios/{id}'
    },
    
    // Notificaciones
    NOTIFICACIONES: {
      BASE: '/ms-notificaciones/api/notificaciones',
      MIS_NOTIFICACIONES: '/ms-notificaciones/api/notificaciones/mis-notificaciones',
      GET_BY_ID: '/ms-notificaciones/api/notificaciones/{id}',
      MARCAR_LEIDA: '/ms-notificaciones/api/notificaciones/{id}/leida',
      MARCAR_TODAS_LEIDAS: '/ms-notificaciones/api/notificaciones/marcar-todas-leidas',
      DELETE: '/ms-notificaciones/api/notificaciones/{id}',
      SEND: '/ms-notificaciones/api/notificaciones/enviar'
    },
    
    // Reportes
    REPORTES: {
      BASE: '/ms-reportes/api/reportes',
      VENTAS: '/ms-reportes/api/reportes/ventas',
      ASISTENCIA: '/ms-reportes/api/reportes/asistencia/{eventoId}',
      VENTAS_POR_EVENTO: '/ms-reportes/api/reportes/ventas/evento/{eventoId}',
      VENTAS_POR_FECHA: '/ms-reportes/api/reportes/ventas/fecha',
      ESTADISTICAS_GENERALES: '/ms-reportes/api/reportes/estadisticas'
    },
    
    // Roles (si existe)
    ROLES: {
      BASE: '/ms-autenticacion/api/roles',
      GET_ALL: '/ms-autenticacion/api/roles',
      GET_BY_ID: '/ms-autenticacion/api/roles/{id}',
      CREATE: '/ms-autenticacion/api/roles',
      UPDATE: '/ms-autenticacion/api/roles/{id}',
      DELETE: '/ms-autenticacion/api/roles/{id}'
    }
  }
};

// Función helper para construir URLs con parámetros
export const buildUrl = (endpoint, params = {}) => {
  let url = API_CONFIG.BASE_URL + endpoint;
  
  // Reemplazar parámetros en la URL
  Object.keys(params).forEach(key => {
    url = url.replace(`{${key}}`, params[key]);
  });
  
  return url;
};

// Headers comunes
export const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// WebSocket Configuration
export const WEBSOCKET_CONFIG = {
  BASE_URL: 'http://localhost:8000/api/ms-tickets/ws',
  ENDPOINTS: {
    ASIENTOS: '/asientos'
  },
  TOPICS: {
    SELECCIONAR_ASIENTO: '/app/seleccionar-asiento',
    DESELECCIONAR_ASIENTO: '/app/deseleccionar-asiento',
    LIBERAR_ASIENTO: '/app/liberar-asiento',
    SELECCIONAR_MULTIPLES: '/app/seleccionar-multiples-asientos',
    DESELECCIONAR_MULTIPLES: '/app/deseleccionar-multiples-asientos',
    COMPRAR_ASIENTO: '/app/comprar-asiento',
    COMPRAR_MULTIPLES: '/app/comprar-multiples-asientos'
  },
  SUBSCRIBE: {
    ASIENTOS_UPDATES: '/topic/asientos/{idEvento}'
  }
};
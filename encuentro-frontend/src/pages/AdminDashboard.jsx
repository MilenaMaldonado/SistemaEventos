import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserForm, EventForm } from '../components/forms';
import CitiesManager from '../components/admin/CitiesManager';

import { reportesAPI, usuariosAPI, eventosAPI, notificacionesAPI, ticketsMetricasAPI } from '../api';


export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('overview');

  // Dashboard metrics
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalTickets: 0,
    revenue: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [errorStats, setErrorStats] = useState(null);

  // Users
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState(null);

  // Events
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [errorEvents, setErrorEvents] = useState(null);

  // Cities
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [errorNotifications, setErrorNotifications] = useState(null);
  const [notificationsPage, setNotificationsPage] = useState(0);
  const [notificationsTotalPages, setNotificationsTotalPages] = useState(0);

  // Form states
  const [showUserForm, setShowUserForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [userFormErrors, setUserFormErrors] = useState(null);

  // Reports (simple range for ventas)
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [fechaFin, setFechaFin] = useState(todayISO);
  const [loadingReport, setLoadingReport] = useState(false);
  const [errorReport, setErrorReport] = useState(null);
  const [ventasReporte, setVentasReporte] = useState(null);

  // Helpers
  const getCityNameById = (cityId) => {
    if (!cityId) return '—';
    
    console.log('🔍 Buscando ciudad con ID:', cityId, 'en ciudades disponibles:', cities);
    
    // Buscar ciudad por ID (número o string)
    const city = cities.find(c => 
      c.id === cityId || 
      c.id === Number(cityId) || 
      Number(c.id) === Number(cityId)
    );
    
    console.log('🏙️ Ciudad encontrada:', city);
    
    if (city) {
      return city.nombre;
    } else {
      console.warn('⚠️ No se encontró ciudad con ID:', cityId);
      return '—'; // Si no encuentra la ciudad, muestra un guión
    }
  };

  const extractPayload = (resp) => {
    console.log('🔍 Extrayendo payload de respuesta:', resp);
    const data = resp?.data ?? resp;
    
    // Para el microservicio de tickets, puede venir directamente en data
    if (data && typeof data === 'object' && (data.totalTickets !== undefined || data.totalIngresos !== undefined)) {
      console.log('✅ Datos encontrados directamente en data:', data);
      return data;
    }
    
    // Para otros servicios, puede estar en respuesta o data
    const payload = data?.respuesta ?? data?.data ?? data;
    console.log('✅ Payload extraído:', payload);
    return payload;
  };

  const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== 'object') return [];
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.content)) return payload.content;
    if (Array.isArray(payload.result)) return payload.result;
    return [];
  };

  // Loaders
  const loadDashboardStats = async () => {
    setLoadingStats(true);
    setErrorStats(null);
    console.log('🔄 Cargando estadísticas del dashboard...');
    
    try {
      // Try dashboard metrics first
      console.log('📊 Intentando getDashboardMetrics...');
      const resp = await reportesAPI.getDashboardMetrics();
      const payload = extractPayload(resp) || {};
      console.log('✅ Dashboard metrics response:', payload);
      
      const nextStats = {
        totalUsers: Number(payload.totalUsuarios ?? payload.totalUsers ?? 0),
        totalEvents: Number(payload.totalEventos ?? payload.totalEvents ?? 0),
        totalTickets: Number(payload.totalTickets ?? payload.ticketsVendidos ?? 0),
        revenue: Number(payload.revenue ?? payload.ingresos ?? 0),
      };

      console.log('📈 Stats procesadas:', nextStats);
      setStats(nextStats);
    } catch (err) {
      console.log('❌ Error en dashboard metrics, intentando fallback...', err);
      
      // Fallback: collect stats from individual endpoints
      const fallbackStats = { totalUsers: 0, totalEvents: 0, totalTickets: 0, revenue: 0 };
      
      // Try getting users count
      try {
        console.log('👥 Obteniendo usuarios...');
        const uResp = await usuariosAPI.getAll({ page: 0, size: 1 });
        const uPayload = extractPayload(uResp);
        fallbackStats.totalUsers = uPayload?.total || uPayload?.totalElements || toArray(uPayload).length || 0;
        console.log('✅ Usuarios encontrados:', fallbackStats.totalUsers);
      } catch (userErr) {
        console.log('❌ Error obteniendo usuarios:', userErr?.message);
      }
      
      // Try getting events count
      try {
        console.log('📅 Obteniendo eventos...');
        const eResp = await eventosAPI.getAll({ page: 0, size: 1 });
        const ePayload = extractPayload(eResp);
        fallbackStats.totalEvents = ePayload?.total || ePayload?.totalElements || toArray(ePayload).length || 0;
        console.log('✅ Eventos encontrados:', fallbackStats.totalEvents);
      } catch (eventErr) {
        console.log('❌ Error obteniendo eventos:', eventErr?.message);
      }
      
      // Try getting tickets metrics from tickets service
      try {
        console.log('🎫 Obteniendo métricas de tickets...');
        const ticketsResp = await ticketsMetricasAPI.getMetricasGenerales();
        console.log('🎫 Respuesta completa tickets service:', ticketsResp);
        
        const ticketsPayload = extractPayload(ticketsResp) || {};
        console.log('✅ Métricas de tickets procesadas:', ticketsPayload);
        
        // Asegurar que extraemos correctamente los valores numéricos
        const ticketsCount = Number(ticketsPayload.totalTickets) || 0;
        const revenue = Number(ticketsPayload.totalIngresos) || 0;
        
        console.log('🎫 Valores finales - Tickets:', ticketsCount, 'Revenue:', revenue);
        
        fallbackStats.totalTickets = ticketsCount;
        fallbackStats.revenue = revenue;
      } catch (ticketsErr) {
        console.log('❌ Error obteniendo métricas de tickets:', ticketsErr?.message);
        
        // Try estadisticas generales as last resort
        try {
          console.log('📊 Intentando estadísticas generales...');
          const statsResp = await reportesAPI.getEstadisticasGenerales();
          const p = extractPayload(statsResp) || {};
          console.log('✅ Estadísticas generales:', p);
          
          fallbackStats.totalTickets = p.totalTickets ?? p.ticketsVendidos ?? 0;
          fallbackStats.revenue = p.ingresos ?? p.revenue ?? 0;
        } catch (statsErr) {
          console.log('❌ Error en estadísticas generales:', statsErr?.message);
        }
      }
      
      console.log('📈 Fallback stats finales:', fallbackStats);
      setStats(fallbackStats);
      
      // Only show error if we couldn't get any data at all
      if (fallbackStats.totalUsers === 0 && fallbackStats.totalEvents === 0 && fallbackStats.totalTickets === 0) {
        setErrorStats('No se pudieron cargar las métricas. Verifique la conexión con los servicios.');
      }
    } finally {
      setLoadingStats(false);
    }
  };

  // Función específica para probar métricas de tickets
  const testTicketsMetrics = async () => {
    console.log('🧪 === PRUEBA MANUAL DE MÉTRICAS DE TICKETS ===');
    
    try {
      // Probar métricas generales
      console.log('🧪 Probando métricas generales...');
      const generalResp = await ticketsMetricasAPI.getMetricasGenerales();
      console.log('🧪 Respuesta general completa:', generalResp);
      
      // Probar métricas del mes
      console.log('🧪 Probando métricas del mes...');
      const mesResp = await ticketsMetricasAPI.getMetricasDelMes();
      console.log('🧪 Respuesta del mes completa:', mesResp);
      
      console.log('🧪 === FIN DE PRUEBA ===');
    } catch (error) {
      console.log('🧪 Error en prueba:', error);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    setErrorUsers(null);
    console.log('👥 Cargando usuarios...');
    
    try {
      const resp = await usuariosAPI.getAll({ page: 0, size: 20 });
      const payload = extractPayload(resp);
      const usersList = toArray(payload);
      console.log('✅ Usuarios cargados:', usersList.length);
      setUsers(usersList);
    } catch (err) {
      console.log('❌ Error cargando usuarios:', err);
      setErrorUsers(err?.message || 'No se pudieron cargar los usuarios. Verifique la conexión con el servicio.');
      setUsers([]); // Reset to empty array on error
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadEvents = async () => {
    setLoadingEvents(true);
    setErrorEvents(null);
    console.log('📅 Cargando eventos...');
    
    try {
      const resp = await eventosAPI.getAll({ page: 0, size: 20 });
      const payload = extractPayload(resp);
      const eventsList = toArray(payload);
      console.log('✅ Eventos cargados:', eventsList.length);
      console.log('📋 Primer evento (estructura completa):', eventsList[0]);
      console.log('📋 IDs disponibles en eventos:', eventsList.map(e => ({ idEvento: e.idEvento, id: e.id, _id: e._id, nombre: e.nombre })));
      setEvents(eventsList);
    } catch (err) {
      console.log('❌ Error cargando eventos:', err);
      setErrorEvents(err?.message || 'No se pudieron cargar los eventos. Verifique la conexión con el servicio.');
      setEvents([]); // Reset to empty array on error
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadCities = async () => {
    setLoadingCities(true);
    console.log('🏙️ AdminDashboard: Cargando ciudades...');
    
    try {
      const resp = await eventosAPI.getCiudades();
      const payload = extractPayload(resp);
      const ciudadesList = payload?.respuesta || payload?.data || payload;
      
      console.log('🏙️ AdminDashboard: Respuesta de ciudades:', payload);
      console.log('🏙️ AdminDashboard: Lista de ciudades extraída:', ciudadesList);
      
      // Ya no necesitamos mapear IDs porque vienen del backend
      const ciudadesArray = Array.isArray(ciudadesList) ? ciudadesList : [];
      
      console.log('✅ AdminDashboard: Ciudades procesadas:', ciudadesArray);
      setCities(ciudadesArray);
    } catch (err) {
      console.log('❌ AdminDashboard: Error cargando ciudades:', err);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  const loadNotifications = async (page = 0) => {
    setLoadingNotifications(true);
    setErrorNotifications(null);
    console.log(`🔔 Cargando notificaciones página ${page}...`);
    
    try {
      // Usar el nuevo endpoint paginado
      const resp = await notificacionesAPI.getPaginadas(page, 10);
      console.log('🔔 Respuesta completa de notificaciones:', resp);
      
      const payload = extractPayload(resp);
      
      if (payload && payload.content) {
        // Respuesta paginada de Spring Boot
        const notificationsList = toArray(payload.content);
        const totalPages = payload.totalPages || 0;
        
        console.log('✅ Notificaciones paginadas cargadas:', notificationsList.length);
        console.log('📄 Total páginas:', totalPages, 'Página actual:', page);
        
        setNotifications(notificationsList);
        setNotificationsTotalPages(totalPages);
        setNotificationsPage(page);
      } else {
        console.log('❌ Estructura de respuesta inesperada:', payload);
        setNotifications([]);
        setNotificationsTotalPages(0);
        setNotificationsPage(0);
      }
    } catch (err) {
      console.log('❌ Error cargando notificaciones:', err);
      setErrorNotifications(err?.message || 'No se pudieron cargar las notificaciones. Verifique la conexión con el servicio.');
      setNotifications([]);
      setNotificationsTotalPages(0);
      setNotificationsPage(0);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Reports loader
  const generarReporteVentas = async () => {
    setLoadingReport(true);
    setErrorReport(null);
    console.log('📊 Generando reporte de ventas...', { fechaInicio, fechaFin });
    
    try {
      // Try getting report from reports service first
      const resp = await reportesAPI.getVentasPorFecha(fechaInicio, fechaFin);
      const payload = extractPayload(resp);
      console.log('✅ Reporte de reportes service:', payload);
      setVentasReporte(payload);
    } catch (err) {
      console.log('❌ Error en reportes service, intentando tickets service...', err);
      
      // Fallback: try getting metrics from tickets service
      try {
        const ticketsResp = await ticketsMetricasAPI.getMetricasPorRango(fechaInicio, fechaFin);
        const ticketsPayload = extractPayload(ticketsResp) || {};
        console.log('✅ Métricas de tickets por rango:', ticketsPayload);
        
        // Format as report
        const reportData = {
          totalVentas: ticketsPayload.totalFacturas ?? 0,
          totalTickets: ticketsPayload.totalTickets ?? 0,
          totalIngresos: ticketsPayload.totalIngresos ?? 0,
          ingresos: ticketsPayload.totalIngresos ?? 0,
          tickets: ticketsPayload.totalTickets ?? 0,
          eventos: 0, // No podemos obtener eventos por fecha desde tickets
          periodo: ticketsPayload.periodo ?? `Del ${fechaInicio} al ${fechaFin}`
        };
        
        console.log('📈 Reporte formateado desde tickets:', reportData);
        setVentasReporte(reportData);
      } catch (ticketsErr) {
        console.log('❌ Error obteniendo métricas de tickets:', ticketsErr);
        setErrorReport('No se pudo generar el reporte. Verifique la conexión con los servicios.');
      }
    } finally {
      setLoadingReport(false);
    }
  };

  // Quick actions
  const handleCrearEvento = async () => {

    setActiveSection('events');
    setShowEventForm(true);

    // Solicitar datos mínimos por prompts para cumplir con la llamada al endpoint
    const nombre = window.prompt('Nombre del evento:');
    if (!nombre) return;
    const fecha = window.prompt('Fecha (YYYY-MM-DD):', todayISO);
    if (!fecha) return;
    const ciudad = window.prompt('Ciudad:');
    if (!ciudad) return;

    console.log('🎪 Creando evento:', { nombre, fecha, ciudad });
    try {
      const payload = { nombre, fecha, ciudad };
      await eventosAPI.create(payload);
      console.log('✅ Evento creado exitosamente');
      
      // Reload events and switch to events tab
      await loadEvents();
      setActiveSection('events');
      alert('✅ Evento creado correctamente');
    } catch (err) {
      console.log('❌ Error creando evento:', err);
      alert('❌ Error al crear evento: ' + (err?.message || err?.data?.message || 'Error desconocido'));
    }
  };

  const handleGenerarReporteDescarga = async () => {
    console.log('📊 Generando reporte de descarga...', { fechaInicio, fechaFin });
    try {
      // Dispara descarga de Excel por defecto
      await reportesAPI.exportVentasExcel({ fechaInicio, fechaFin });
      console.log('✅ Reporte descargado exitosamente');
    } catch (err) {
      console.log('❌ Error generando reporte:', err);
      alert('❌ Error al exportar reporte: ' + (err?.message || err?.data?.message || 'Error desconocido'));
    }
  };


  // User management functions
  const handleCreateUser = async (userData) => {
    setFormLoading(true);
    setUserFormErrors(null); // Limpiar errores previos
    
    try {
      await usuariosAPI.create(userData);
      await loadUsers();
      await loadDashboardStats(); // Recargar estadísticas después de crear
      setShowUserForm(false);
      showSuccessMessage('Usuario creado exitosamente');
    } catch (err) {
      console.log('❌ Error completo del servidor:', err);
      
      // Verificar si el error tiene la estructura del servidor
      if (err?.response?.data && err.response.data.mensaje) {
        console.log('🔍 Error del servidor:', err.response.data);
        
        // Si hay errores específicos de campos
        if (err.response.data.respuesta && typeof err.response.data.respuesta === 'object') {
          setUserFormErrors(err.response.data);
        } else {
          // Error general sin campos específicos (ej: "Usuario ya registrado")
          showErrorMessage(err.response.data.mensaje);
        }
      } else {
        // Error genérico
        showErrorMessage('Error al crear usuario: ' + (err?.message || 'Error desconocido'));
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async (userData) => {
    setFormLoading(true);
    setUserFormErrors(null); // Limpiar errores previos
    
    try {
      const userId = editingUser.id || editingUser.cedula;
      await usuariosAPI.update(userId, userData);
      await loadUsers();
      setShowUserForm(false);
      setEditingUser(null);
      showSuccessMessage('Usuario actualizado exitosamente');
    } catch (err) {
      console.log('❌ Error completo del servidor:', err);
      
      // Verificar si el error tiene la estructura del servidor
      if (err?.response?.data && err.response.data.mensaje) {
        console.log('🔍 Error del servidor:', err.response.data);
        
        // Si hay errores específicos de campos
        if (err.response.data.respuesta && typeof err.response.data.respuesta === 'object') {
          setUserFormErrors(err.response.data);
        } else {
          // Error general sin campos específicos (ej: "Usuario ya registrado")
          showErrorMessage(err.response.data.mensaje);
        }
      } else {
        // Error genérico
        showErrorMessage('Error al actualizar usuario: ' + (err?.message || 'Error desconocido'));
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirmDelete('¿Está seguro de que desea eliminar este usuario?', 'Esta acción no se puede deshacer.')) return;
    
    try {
      await usuariosAPI.delete(userId);
      await loadUsers();
      await loadDashboardStats(); // Recargar estadísticas después de eliminar
      showSuccessMessage('Usuario eliminado exitosamente');
    } catch (err) {
      showErrorMessage('Error al eliminar usuario: ' + (err?.message || 'Error desconocido'));
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormErrors(null); // Limpiar errores al abrir formulario de edición
    setShowUserForm(true);
  };

  // Event management functions
  const handleCreateEvent = async (eventData) => {
    setFormLoading(true);
    try {
      await eventosAPI.create(eventData);
      await loadEvents();
      setShowEventForm(false);
      showSuccessMessage('Evento creado exitosamente');
    } catch (err) {
      showErrorMessage('Error al crear evento: ' + (err?.message || 'Error desconocido'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateEvent = async (eventData) => {
    setFormLoading(true);
    
    // Obtener el ID correcto del evento (debe ser idEvento según el backend)
    const eventId = editingEvent.idEvento || editingEvent.id || editingEvent._id;
    
    console.log('🔄 AdminDashboard: Evento completo para editar:', editingEvent);
    console.log('🔄 AdminDashboard: ID del evento obtenido (idEvento):', eventId, 'Tipo:', typeof eventId);
    console.log('🔄 AdminDashboard: Datos recibidos del formulario:', eventData);
    
    if (!eventId) {
      showErrorMessage('Error: No se pudo obtener el ID del evento para actualizar');
      setFormLoading(false);
      return;
    }
    
    // Limpiar campos nulos que puedan causar problemas
    const cleanEventData = Object.fromEntries(
      Object.entries(eventData).filter(([key, value]) => value !== null && value !== undefined)
    );
    
    console.log('🔄 AdminDashboard: Datos limpiados a enviar:', cleanEventData);
    
    try {
      await eventosAPI.update(eventId, cleanEventData);
      await loadEvents();
      setShowEventForm(false);
      setEditingEvent(null);
      showSuccessMessage('Evento actualizado exitosamente');
    } catch (err) {
      console.error('❌ AdminDashboard: Error al actualizar evento:', err);
      showErrorMessage('Error al actualizar evento: ' + (err?.message || 'Error desconocido'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirmDelete('¿Está seguro de que desea eliminar este evento?', 'Esta acción no se puede deshacer.')) return;
    
    try {
      await eventosAPI.delete(eventId);
      await loadEvents();
      showSuccessMessage('Evento eliminado exitosamente');
    } catch (err) {
      showErrorMessage('Error al eliminar evento: ' + (err?.message || 'Error desconocido'));
    }
  };

  const handleEditEvent = (event) => {
    console.log('✏️ AdminDashboard: Evento seleccionado para editar:', event);
    console.log('✏️ AdminDashboard: ID del evento:', event.id, 'Tipo:', typeof event.id);
    setEditingEvent(event);
    setShowEventForm(true);
  };

  // Notifications actions
  const marcarNotificacionLeida = async (id) => {
    try {
      await notificacionesAPI.marcarComoLeida(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    } catch (err) {
      alert('No se pudo marcar como leída');
    }
  };

  const eliminarNotificacion = async (id) => {
    try {
      await notificacionesAPI.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      alert('No se pudo eliminar la notificación');
    }
  };

  // Effects
  useEffect(() => {
    loadDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeSection === 'users' && users.length === 0 && !loadingUsers) {
      loadUsers();
    }
    if (activeSection === 'events' && events.length === 0 && !loadingEvents) {
      loadEvents();
      if (cities.length === 0 && !loadingCities) {
        loadCities();
      }
    }
    if (activeSection === 'notifications' && notifications.length === 0 && !loadingNotifications) {
      setNotificationsPage(0); // Reiniciar a página 0
      loadNotifications(0); // Cargar primera página
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  // Auto-refresh para notificaciones cada 1 minuto
  useEffect(() => {
    let interval;
    
    if (activeSection === 'notifications') {
      console.log('🔄 Iniciando auto-refresh de notificaciones cada 1 minuto');
      interval = setInterval(() => {
        console.log('🔄 Auto-refresh: Recargando notificaciones...');
        loadNotifications(notificationsPage);
      }, 60000); // 60 segundos
    }
    
    return () => {
      if (interval) {
        console.log('🔄 Deteniendo auto-refresh de notificaciones');
        clearInterval(interval);
      }
    };
  }, [activeSection, notificationsPage]);

  const menuItems = [
    {
      id: 'overview',
      name: 'Resumen',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'users',
      name: 'Usuarios',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
    },
    {
      id: 'events',
      name: 'Eventos',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'reports',
      name: 'Reportes',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'notifications',
      name: 'Notificaciones',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 17H7l4 4v-4zM13 3h8v8h-8V3z" />
        </svg>
      ),
    },
    {
      id: 'cities',
      name: 'Ciudades',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const StatCard = ({ title, value, change, icon, color, loading }) => (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm font-medium">{title}</p>
          {loading ? (
            <p className="text-white/60 mt-1 text-sm">Cargando...</p>
          ) : (
            <>
              <p className="text-2xl font-bold text-white mt-1">{Number(value || 0).toLocaleString()}</p>
              {typeof change === 'number' && (
                <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {change >= 0 ? '↗' : '↘'} {Math.abs(change)}% este mes
                </p>
              )}
            </>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Gestión de Usuarios</h3>
        <div className="space-x-2">
          <button
            onClick={() => {
              setUserFormErrors(null); // Limpiar errores al crear nuevo usuario
              setShowUserForm(true);
            }}
            className="text-sm text-white/90 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-3 py-1.5 rounded-lg"
          >
            Nuevo Usuario
          </button>
          <button
            onClick={loadUsers}
            className="text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
          >
            Refrescar
          </button>
        </div>
      </div>

      {errorUsers && (
        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {errorUsers}
        </div>
      )}

      {loadingUsers ? (
        <div className="text-white/70 text-center py-8">Cargando usuarios...</div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-white/60 text-left text-sm">
                  <th className="py-2 pr-4">Nombre</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Cédula</th>
                  <th className="py-2 pr-4">Teléfono</th>
                  <th className="py-2 pr-4">Fecha Nacimiento</th>
                  <th className="py-2 pr-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id || u.cedula || u.email} className="text-white/90 text-sm border-t border-white/10">
                    <td className="py-2 pr-4">{u.nombre || u.apellido ? `${u.nombre || ''} ${u.apellido || ''}`.trim() : `${u.nombres || ''} ${u.apellidos || ''}`.trim() || '—'}</td>
                    <td className="py-2 pr-4">{u.email || u.correo || '—'}</td>
                    <td className="py-2 pr-4">{u.cedula || '—'}</td>
                    <td className="py-2 pr-4">{u.telefono || '—'}</td>
                    <td className="py-2 pr-4">{u.fechaNacimiento ? new Date(u.fechaNacimiento).toLocaleDateString() : '—'}</td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditUser(u)}
                          className="text-xs text-white/90 bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id || u.cedula)}
                          className="text-xs text-red-300 hover:text-red-200 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded-lg"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td className="text-white/60 py-4" colSpan={6}>No hay usuarios registrados</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderEvents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Gestión de Eventos</h3>
        <div className="space-x-2">
          <button
            onClick={() => setShowEventForm(true)}
            className="text-sm text-white/90 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-3 py-1.5 rounded-lg"
          >
            Nuevo Evento
          </button>
          <button
            onClick={loadEvents}
            className="text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
          >
            Refrescar
          </button>
        </div>
      </div>

      {errorEvents && (
        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {errorEvents}
        </div>
      )}

      {loadingEvents ? (
        <div className="text-white/70 text-center py-8">Cargando eventos...</div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-white/60 text-left text-sm">
                  <th className="py-3 pr-4 font-medium">Evento</th>
                  <th className="py-3 pr-4 font-medium">Fecha & Hora</th>
                  <th className="py-3 pr-4 font-medium">Ubicación</th>
                  <th className="py-3 pr-4 font-medium">Capacidad</th>
                  <th className="py-3 pr-4 font-medium">Precio</th>
                  <th className="py-3 pr-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.idEvento || e.id || e._id || e.nombre} className="text-white/90 text-sm border-t border-white/10 hover:bg-white/5 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="flex flex-col">
                        <div className="font-medium text-white">{e.nombre || e.titulo || '—'}</div>
                        {e.establecimiento && <div className="text-xs text-white/60 mt-1">{e.establecimiento}</div>}
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex flex-col">
                        <div className="text-white">{e.fecha ? new Date(e.fecha).toLocaleDateString() : '—'}</div>
                        {e.hora && <div className="text-xs text-white/60 mt-1">{e.hora}</div>}
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                        <span>{getCityNameById(e.idCiudad)}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{e.capacidad || e.cupos || '—'}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      {e.precio ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium">
                          ${e.precio}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-lg text-xs">
                          Gratis
                        </span>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditEvent(e)}
                          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                          title="Editar evento"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(e.idEvento || e.id || e._id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                          title="Eliminar evento"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td className="text-center py-12" colSpan={6}>
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="text-white/60">No hay eventos registrados</div>
                        <button
                          onClick={() => setShowEventForm(true)}
                          className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                        >
                          Crear el primer evento
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Ventas por rango de fechas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-white/70 text-sm mb-1">Fecha inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-1">Fecha fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={generarReporteVentas}
              disabled={loadingReport}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg"
            >
              {loadingReport ? 'Generando...' : 'Generar'}
            </button>
            <button
              onClick={handleGenerarReporteDescarga}
              className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg"
            >
              Descargar Excel
            </button>
          </div>
        </div>
        {errorReport && <div className="text-red-400 text-sm mt-3">{errorReport}</div>}
        {ventasReporte && (
          <div className="mt-4 text-white/90 text-sm">
            {/* Dibuja algunas claves comunes si existen */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-white/60">Total ventas</div>
                <div className="text-white text-lg font-semibold">{(ventasReporte.totalVentas ?? ventasReporte.total ?? 0).toLocaleString()}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-white/60">Ingresos</div>
                <div className="text-white text-lg font-semibold">${Number(ventasReporte.ingresos ?? ventasReporte.totalIngresos ?? 0).toLocaleString()}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-white/60">Tickets</div>
                <div className="text-white text-lg font-semibold">{(ventasReporte.tickets ?? ventasReporte.totalTickets ?? 0).toLocaleString()}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-white/60">Eventos</div>
                <div className="text-white text-lg font-semibold">{(ventasReporte.eventos ?? ventasReporte.totalEventos ?? 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Notificaciones</h3>
        <div className="text-white/60 text-sm">
          Actualización automática cada minuto
        </div>
      </div>
      {errorNotifications && (
        <div className="text-red-400 text-sm mb-3">{errorNotifications}</div>
      )}
      {loadingNotifications ? (
        <div className="text-white/70">Cargando notificaciones...</div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            // Función para obtener el icono según el tipo
            const getTypeIcon = (tipo) => {
              switch(tipo) {
                case 'LOGIN':
                  return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  );
                case 'EVENTO':
                  return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  );
                case 'CIUDAD':
                  return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  );
                default:
                  return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9.707 14.707a1 1 0 01-1.414 0L5 11.414V9a2 2 0 012-2h2.414l3.293 3.293a1 1 0 010 1.414z" />
                    </svg>
                  );
              }
            };

            // Función para obtener el color según el tipo
            const getTypeColor = (tipo) => {
              switch(tipo) {
                case 'LOGIN': return 'text-green-400';
                case 'EVENTO': return 'text-blue-400';
                case 'CIUDAD': return 'text-purple-400';
                default: return 'text-white/60';
              }
            };

            return (
              <div key={n.id} className="flex items-start justify-between bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`p-2 rounded-lg bg-white/10 ${getTypeColor(n.tipo)}`}>
                    {getTypeIcon(n.tipo)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs px-2 py-1 rounded-full bg-white/10 ${getTypeColor(n.tipo)} font-medium`}>
                        {n.tipo || 'SISTEMA'}
                      </span>
                      <span className="text-white/50 text-xs">
                        ID: {n.id}
                      </span>
                    </div>
                    <div className="text-white/90 text-sm mb-1">{n.mensaje || '—'}</div>
                    <div className="text-white/50 text-xs">
                      {n.fecha ? new Date(n.fecha).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      }) : ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {!n.leida && (
                    <button
                      onClick={() => marcarNotificacionLeida(n.id)}
                      className="text-xs text-white/90 bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg transition-all duration-200"
                    >
                      Marcar leída
                    </button>
                  )}
                  <button
                    onClick={() => eliminarNotificacion(n.id)}
                    className="text-xs text-red-300 hover:text-red-200 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded-lg transition-all duration-200"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
          {notifications.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 bg-white/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9.707 14.707a1 1 0 01-1.414 0L5 11.414V9a2 2 0 012-2h2.414l3.293 3.293a1 1 0 010 1.414z" />
                </svg>
              </div>
              <div className="text-white/60">Sin notificaciones</div>
            </div>
          )}
        </div>
      )}
      
      {/* Controles de paginación */}
      {notificationsTotalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <div className="text-white/60 text-sm">
            Página {notificationsPage + 1} de {notificationsTotalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => loadNotifications(notificationsPage - 1)}
              disabled={notificationsPage === 0 || loadingNotifications}
              className="px-3 py-1.5 text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            {/* Números de página */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(notificationsTotalPages, 5) }, (_, i) => {
                let pageNumber;
                if (notificationsTotalPages <= 5) {
                  pageNumber = i;
                } else if (notificationsPage < 3) {
                  pageNumber = i;
                } else if (notificationsPage >= notificationsTotalPages - 2) {
                  pageNumber = notificationsTotalPages - 5 + i;
                } else {
                  pageNumber = notificationsPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => loadNotifications(pageNumber)}
                    disabled={loadingNotifications}
                    className={`px-2 py-1 text-sm rounded transition-all duration-200 ${
                      pageNumber === notificationsPage
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {pageNumber + 1}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => loadNotifications(notificationsPage + 1)}
              disabled={notificationsPage >= notificationsTotalPages - 1 || loadingNotifications}
              className="px-3 py-1.5 text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
      
      {/* Información cuando solo hay una página */}
      {notificationsTotalPages <= 1 && notifications.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-white/60 text-sm text-center">
            Mostrando {notifications.length} notificaciones
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Usuarios"
                value={stats.totalUsers}
                change={12}
                loading={loadingStats}
                color="bg-gradient-to-br from-blue-500 to-blue-600"
                icon={
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                }
              />
              <StatCard
                title="Eventos Activos"
                value={stats.totalEvents}
                change={8}
                loading={loadingStats}
                color="bg-gradient-to-br from-purple-500 to-purple-600"
                icon={
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
              <StatCard
                title="Tickets Vendidos"
                value={stats.totalTickets}
                change={23}
                loading={loadingStats}
                color="bg-gradient-to-br from-green-500 to-green-600"
                icon={
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                }
              />
              <StatCard
                title="Ingresos"
                value={stats.revenue}
                change={15}
                loading={loadingStats}
                color="bg-gradient-to-br from-orange-500 to-orange-600"
                icon={
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                }
              />
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Acciones Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                  onClick={handleCrearEvento}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white p-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                >
                  Crear Nuevo Evento
                </button>
                <button
                  onClick={handleGenerarReporteDescarga}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white p-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                >
                  Generar Reporte
                </button>
                <button
                  onClick={testTicketsMetrics}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white p-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                >
                  🧪 Test Tickets
                </button>
              </div>
            </div>
          </div>
        );
      case 'users':
        if (showUserForm) {
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Gestión de Usuarios</h3>
                <button
                  onClick={() => {
                    setShowUserForm(false);
                    setEditingUser(null);
                  }}
                  className="text-sm text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
                >
                  Volver a la lista
                </button>
              </div>
              
              <UserForm
                user={editingUser}
                onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
                onCancel={() => {
                  setShowUserForm(false);
                  setEditingUser(null);
                  setUserFormErrors(null); // Limpiar errores al cancelar
                }}
                loading={formLoading}
                serverErrors={userFormErrors}
              />
            </div>
          );
        }
        return renderUsers();
      case 'events':
        if (showEventForm) {
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Gestión de Eventos</h3>
                <button
                  onClick={() => {
                    setShowEventForm(false);
                    setEditingEvent(null);
                  }}
                  className="text-sm text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
                >
                  Volver a la lista
                </button>
              </div>
              
              <EventForm
                event={editingEvent}
                onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
                onCancel={() => {
                  setShowEventForm(false);
                  setEditingEvent(null);
                }}
                loading={formLoading}
              />
            </div>
          );
        }
        return renderEvents();
      case 'reports':
        return renderReports();
      case 'notifications':
        return renderNotifications();
      case 'cities':
        return <CitiesManager />;
      default:
        return (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Funcionalidad en Desarrollo</h3>
            <p className="text-white/60">Esta sección estará disponible próximamente</p>
          </div>
        );
    }
  };

  // Helper functions for better UX
  const showSuccessMessage = (message) => {
    // Crear notificación de éxito
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const showErrorMessage = (message) => {
    // Crear notificación de error
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remover después de 5 segundos
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 5000);
  };

  const confirmDelete = (title, message) => {
    return new Promise((resolve) => {
      // Crear modal de confirmación
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center';
      modal.innerHTML = `
        <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-95 opacity-0">
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">${title}</h3>
            <p class="text-white/70 mb-6">${message}</p>
            <div class="flex space-x-3">
              <button id="cancel-btn" class="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors">
                Cancelar
              </button>
              <button id="confirm-btn" class="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Animar entrada
      setTimeout(() => {
        modal.querySelector('.bg-white\\/10').classList.remove('scale-95', 'opacity-0');
      }, 100);
      
      // Event listeners
      modal.querySelector('#cancel-btn').onclick = () => {
        modal.querySelector('.bg-white\\/10').classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
          document.body.removeChild(modal);
          resolve(false);
        }, 300);
      };
      
      modal.querySelector('#confirm-btn').onclick = () => {
        modal.querySelector('.bg-white\\/10').classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
          document.body.removeChild(modal);
          resolve(true);
        }, 300);
      };
      
      // Cerrar con ESC
      const handleEsc = (e) => {
        if (e.key === 'Escape') {
          modal.querySelector('#cancel-btn').click();
          document.removeEventListener('keydown', handleEsc);
        }
      };
      document.addEventListener('keydown', handleEsc);
    });
  };


  return (
    <div className="min-h-screen">
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span className="text-white font-semibold">EventosApp</span>
              </Link>
              <div className="text-white/40">|</div>
              <h1 className="text-lg font-semibold text-white">Panel de Administración</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-white/5 rounded-full px-4 py-2">
                <span className="text-white/90 text-sm font-medium">
                  {user?.nombre || 'Administrador'}
                </span>
              </div>
              <button
                onClick={logout}
                className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <nav className="w-64 bg-white/5 backdrop-blur-sm border-r border-white/10 min-h-screen">
          <div className="p-6">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveSection('overview')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeSection === 'overview'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/30'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Resumen</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('users')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeSection === 'users'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/30'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span>Usuarios</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('events')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeSection === 'events'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/30'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Eventos</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('reports')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeSection === 'reports'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/30'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Reportes</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('notifications')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeSection === 'notifications'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/30'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 17H7l4 4v-4zM13 3h8v8h-8V3z" />
                  </svg>
                  <span>Notificaciones</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('cities')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeSection === 'cities'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/30'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Ciudades</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Panel de Administración
              </h2>
              <p className="text-white/60 mt-2">Gestiona tu plataforma de eventos desde aquí</p>
            </div>

            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

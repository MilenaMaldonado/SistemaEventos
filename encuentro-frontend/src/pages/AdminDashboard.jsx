import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [errorNotifications, setErrorNotifications] = useState(null);

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
      setEvents(eventsList);
    } catch (err) {
      console.log('❌ Error cargando eventos:', err);
      setErrorEvents(err?.message || 'No se pudieron cargar los eventos. Verifique la conexión con el servicio.');
      setEvents([]); // Reset to empty array on error
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadNotifications = async () => {
    setLoadingNotifications(true);
    setErrorNotifications(null);
    console.log('🔔 Cargando notificaciones...');
    
    try {
      const resp = await notificacionesAPI.getAll({ page: 0, size: 20 });
      const payload = extractPayload(resp);
      const notificationsList = toArray(payload);
      console.log('✅ Notificaciones cargadas:', notificationsList.length);
      setNotifications(notificationsList);
    } catch (err) {
      console.log('❌ Error cargando notificaciones:', err);
      setErrorNotifications(err?.message || 'No se pudieron cargar las notificaciones. Verifique la conexión con el servicio.');
      setNotifications([]); // Reset to empty array on error
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

  const handleEnviarNotificacion = async () => {
    const titulo = window.prompt('Título de notificación:', 'Aviso general');
    if (!titulo) return;
    const mensaje = window.prompt('Mensaje:');
    if (!mensaje) return;

    console.log('🔔 Enviando notificación:', { titulo, mensaje });
    try {
      await notificacionesAPI.broadcast({ titulo, mensaje, tipo: 'INFO' });
      console.log('✅ Notificación enviada exitosamente');
      
      // Reload notifications and switch to notifications tab
      await loadNotifications();
      setActiveSection('notifications');
      alert('✅ Notificación enviada correctamente');
    } catch (err) {
      console.log('❌ Error enviando notificación:', err);
      alert('❌ Error al enviar notificación: ' + (err?.message || err?.data?.message || 'Error desconocido'));
    }
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
    }
    if (activeSection === 'notifications' && notifications.length === 0 && !loadingNotifications) {
      loadNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

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
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Usuarios</h3>
        <button
          onClick={loadUsers}
          className="text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
        >
          Refrescar
        </button>
      </div>
      {errorUsers && (
        <div className="text-red-400 text-sm mb-3">{errorUsers}</div>
      )}
      {loadingUsers ? (
        <div className="text-white/70">Cargando usuarios...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-white/60 text-left text-sm">
                <th className="py-2 pr-4">Nombre</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Rol</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id || u.cedula || u.email} className="text-white/90 text-sm border-t border-white/10">
                  <td className="py-2 pr-4">{u.nombre || `${u.nombres || ''} ${u.apellidos || ''}`.trim() || '—'}</td>
                  <td className="py-2 pr-4">{u.email || u.correo || '—'}</td>
                  <td className="py-2 pr-4">{u.rol || u.role || (u.roles && u.roles[0]?.nombre) || '—'}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td className="text-white/60 py-4" colSpan={3}>Sin registros</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderEvents = () => (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Eventos</h3>
        <div className="space-x-2">
          <button
            onClick={handleCrearEvento}
            className="text-sm text-white/90 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-3 py-1.5 rounded-lg"
          >
            Nuevo evento
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
        <div className="text-red-400 text-sm mb-3">{errorEvents}</div>
      )}
      {loadingEvents ? (
        <div className="text-white/70">Cargando eventos...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-white/60 text-left text-sm">
                <th className="py-2 pr-4">Nombre</th>
                <th className="py-2 pr-4">Fecha</th>
                <th className="py-2 pr-4">Ciudad</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id || e._id || e.nombre} className="text-white/90 text-sm border-t border-white/10">
                  <td className="py-2 pr-4">{e.nombre || e.titulo || '—'}</td>
                  <td className="py-2 pr-4">{e.fecha ? new Date(e.fecha).toLocaleDateString() : '—'}</td>
                  <td className="py-2 pr-4">{e.ciudad || e.lugar || '—'}</td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td className="text-white/60 py-4" colSpan={3}>Sin registros</td>
                </tr>
              )}
            </tbody>
          </table>
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
        <div className="space-x-2">
          <button
            onClick={handleEnviarNotificacion}
            className="text-sm text-white/90 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 px-3 py-1.5 rounded-lg"
          >
            Enviar notificación
          </button>
          <button
            onClick={loadNotifications}
            className="text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
          >
            Refrescar
          </button>
        </div>
      </div>
      {errorNotifications && (
        <div className="text-red-400 text-sm mb-3">{errorNotifications}</div>
      )}
      {loadingNotifications ? (
        <div className="text-white/70">Cargando notificaciones...</div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className="flex items-start justify-between bg-white/5 border border-white/10 rounded-xl p-4">
              <div>
                <div className="text-white font-medium">{n.titulo || n.title || 'Notificación'}</div>
                <div className="text-white/80 text-sm">{n.mensaje || n.message || '—'}</div>
                <div className="text-white/50 text-xs mt-1">{n.fecha ? new Date(n.fecha).toLocaleString() : ''}</div>
              </div>
              <div className="flex items-center gap-2">
                {!n.leida && (
                  <button
                    onClick={() => marcarNotificacionLeida(n.id)}
                    className="text-xs text-white/90 bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg"
                  >
                    Marcar leída
                  </button>
                )}
                <button
                  onClick={() => eliminarNotificacion(n.id)}
                  className="text-xs text-red-300 hover:text-red-200 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded-lg"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="text-white/60">Sin notificaciones</div>
          )}
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
                  onClick={handleEnviarNotificacion}
                  className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white p-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                >
                  Enviar Notificación
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
        return renderUsers();
      case 'events':
        return renderEvents();
      case 'reports':
        return renderReports();
      case 'notifications':
        return renderNotifications();
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
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/30'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {menuItems.find((item) => item.id === activeSection)?.name}
              </h2>
              <p className="text-white/60 mt-2">Gestiona tu plataforma de eventos desde aquí</p>
              {errorStats && activeSection === 'overview' && (
                <div className="text-red-400 text-sm mt-2">{errorStats}</div>
              )}
            </div>

            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

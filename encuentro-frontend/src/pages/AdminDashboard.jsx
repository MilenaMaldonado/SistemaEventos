import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { reportesAPI, usuariosAPI, eventosAPI, notificacionesAPI } from '../api';
import UserForm from '../components/forms/UserForm';
import EventForm from '../components/forms/EventForm';
import CitiesManager from '../components/admin/CitiesManager';

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

  // Form states
  const [showUserForm, setShowUserForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Reports
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
    const data = resp?.data ?? resp;
    return data?.respuesta ?? data?.data ?? data;
  };

  const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== 'object') return [];
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.content)) return payload.content;
    if (Array.isArray(payload.result)) return payload.result;
    return [];
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
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.nombre?.charAt(0) || 'A'}
                  </span>
                </div>
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

            <div className="text-white text-center py-20">
              <h3 className="text-xl font-bold mb-2">Funcionalidad en Desarrollo</h3>
              <p className="text-white/60">El sistema CRUD completo estará disponible próximamente</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

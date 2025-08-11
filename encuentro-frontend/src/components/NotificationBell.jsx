import React, { useEffect, useRef, useState } from 'react';
import { notificacionesAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';

const unwrap = (resp) => (resp && resp.data !== undefined ? resp.data : resp);

export default function NotificationBell({ pollIntervalMs = 20000 }) {
  const { isAuthenticated } = useAuth() || { isAuthenticated: false };
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    setLoadingCount(true);
    try {
      const resp = await notificacionesAPI.getUnreadCount();
      const data = unwrap(resp);
      const count = typeof data === 'number' ? data : (data?.count ?? data?.unread ?? 0);
      setUnreadCount(count);
    } catch (e) {
      console.error('NotificationBell: error al obtener contador', e);
    } finally {
      setLoadingCount(false);
    }
  };

  const fetchList = async () => {
    if (!isAuthenticated) return;
    setLoadingList(true);
    setError(null);
    try {
      const resp = await notificacionesAPI.getMisNotificaciones({ page: 0, size: 10 });
      const data = unwrap(resp);
      const list = Array.isArray(data) ? data : (data?.content || data?.items || data?.data || []);
      setItems(list);
    } catch (e) {
      console.error('NotificationBell: error al obtener notificaciones', e);
      setError(e?.message || 'Error al cargar notificaciones');
    } finally {
      setLoadingList(false);
    }
  };

  const openMenu = async () => {
    setIsOpen(true);
    await fetchList();
  };

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    // Inicial y polling
    fetchUnreadCount();
    const id = setInterval(fetchUnreadCount, pollIntervalMs);
    return () => clearInterval(id);
  }, [isAuthenticated, pollIntervalMs]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const marcarComoLeida = async (id) => {
    try {
      await notificacionesAPI.marcarComoLeida(id);
      // Optimismo: actualizar lista y contador
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error('NotificationBell: error al marcar leída', e);
    }
  };

  const marcarTodas = async () => {
    try {
      await notificacionesAPI.marcarTodasLeidas();
      setItems((prev) => prev.map((n) => ({ ...n, leida: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('NotificationBell: error al marcar todas leídas', e);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        className="relative text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
        aria-label="Notificaciones"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span className={`absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 flex items-center justify-center rounded-full text-xs ${unreadCount > 0 ? 'bg-rose-500 text-white' : 'bg-white/20 text-white/70'}`}>
          {loadingCount ? '…' : unreadCount}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="text-white/90 text-sm font-medium">Notificaciones</div>
            <button onClick={marcarTodas} className="text-xs text-cyan-300 hover:text-cyan-200">
              Marcar todas como leídas
            </button>
          </div>

          <div className="max-h-96 overflow-auto">
            {error && (
              <div className="px-4 py-3 text-rose-300 text-sm">{error}</div>
            )}
            {loadingList ? (
              <div className="px-4 py-6 text-white/60 text-sm">Cargando...</div>
            ) : items.length === 0 ? (
              <div className="px-4 py-6 text-white/60 text-sm">No hay notificaciones</div>
            ) : (
              <ul className="divide-y divide-white/10">
                {items.map((n) => (
                  <li key={n.id ?? n._id} className="px-4 py-3 hover:bg-white/5">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-2 h-2 rounded-full ${n.leida ? 'bg-white/20' : 'bg-rose-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">{n.titulo ?? n.title ?? 'Notificación'}</div>
                        {n.mensaje || n.message ? (
                          <div className="text-white/70 text-xs mt-0.5 whitespace-pre-wrap">
                            {n.mensaje ?? n.message}
                          </div>
                        ) : null}
                        <div className="text-white/40 text-[11px] mt-1">
                          {n.fecha || n.createdAt ? new Date(n.fecha ?? n.createdAt).toLocaleString() : ''}
                        </div>
                      </div>
                      {!n.leida && (
                        <button onClick={() => marcarComoLeida(n.id ?? n._id)} className="text-[11px] text-cyan-300 hover:text-cyan-200">
                          Marcar
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

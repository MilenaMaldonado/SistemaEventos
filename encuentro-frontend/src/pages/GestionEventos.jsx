import React, { useEffect, useMemo, useState } from 'react';
import eventosAPI from '../api/eventosAPI';
import { useAuth } from '../contexts/AuthContext';
import './AdminShared.css';
import './GestionEventos.css';

const unwrap = (resp) => (resp && resp.data !== undefined ? resp.data : resp) || [];

export default function GestionEventos() {
  const { isAdmin } = useAuth() || { isAdmin: false };

  const [eventos, setEventos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCiudades, setLoadingCiudades] = useState(false);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    id: null,
    nombre: '',
    descripcion: '',
    categoria: '',
    fecha: '', // yyyy-mm-dd
    hora: '',  // HH:mm
    ciudadId: '',
    lugar: '',
    capacidad: '',
    precio: '',
  });

  const cargarEventos = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await eventosAPI.getAll();
      const data = unwrap(resp);
      const list = Array.isArray(data) ? data : data?.content || [];
      setEventos(list);
    } catch (e) {
      console.error('Error al cargar eventos', e);
      setError(e?.message || 'Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  const cargarCiudades = async () => {
    setLoadingCiudades(true);
    try {
      const resp = await eventosAPI.getCiudades();
      const data = unwrap(resp);
      const list = Array.isArray(data) ? data : data?.content || [];
      setCiudades(list);
    } catch (e) {
      console.error('Error al cargar ciudades', e);
    } finally {
      setLoadingCiudades(false);
    }
  };

  useEffect(() => {
    cargarEventos();
    cargarCiudades();
  }, []);

  const limpiarFormulario = () => {
    setForm({
      id: null,
      nombre: '',
      descripcion: '',
      categoria: '',
      fecha: '',
      hora: '',
      ciudadId: '',
      lugar: '',
      capacidad: '',
      precio: '',
    });
    setError(null);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const parseFechaHora = (fechaIso) => {
    if (!fechaIso) return { fecha: '', hora: '' };
    try {
      const d = new Date(fechaIso);
      const pad = (n) => String(n).padStart(2, '0');
      const fecha = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const hora = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
      return { fecha, hora };
    } catch {
      return { fecha: '', hora: '' };
    }
  };

  const editar = (ev) => {
    const id = ev.id ?? ev.codigo ?? ev._id ?? null;
    const { fecha, hora } = parseFechaHora(ev.fecha || ev.fechaEvento || ev.inicio);
    setForm({
      id,
      nombre: ev.nombre ?? ev.titulo ?? '',
      descripcion: ev.descripcion ?? '',
      categoria: ev.categoria ?? '',
      fecha: fecha,
      hora: hora,
      ciudadId: ev.ciudadId ?? ev.ciudad?.id ?? '',
      lugar: ev.lugar ?? '',
      capacidad: ev.capacidad ?? ev.aforo ?? '',
      precio: ev.precio ?? ev.precioBase ?? '',
    });
  };

  const construirPayload = () => {
    const fechaHora = form.fecha && form.hora ? `${form.fecha}T${form.hora}:00` : (form.fecha || null);
    const payload = {
      nombre: form.nombre?.trim() || undefined,
      descripcion: form.descripcion?.trim() || undefined,
      categoria: form.categoria?.trim() || undefined,
      fecha: fechaHora,
      ciudadId: form.ciudadId || undefined,
      lugar: form.lugar?.trim() || undefined,
      capacidad: form.capacidad !== '' ? parseInt(form.capacidad, 10) : undefined,
      precio: form.precio !== '' ? parseFloat(form.precio) : undefined,
    };
    return payload;
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.nombre?.trim() || !form.fecha || !form.ciudadId) {
      setError('Nombre, fecha y ciudad son obligatorios');
      return;
    }
    
    // Validar que la fecha no sea anterior a hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(form.fecha);
    if (eventDate < today) {
      setError('La fecha del evento no puede ser anterior a hoy');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = construirPayload();
      if (form.id) {
        await eventosAPI.update(form.id, payload);
      } else {
        await eventosAPI.create(payload);
      }
      await cargarEventos();
      limpiarFormulario();
    } catch (e2) {
      console.error('Error al guardar evento', e2);
      setError(e2?.message || 'No se pudo guardar el evento');
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (ev) => {
    const id = ev.id ?? ev.codigo ?? ev._id;
    if (!id) return;
    if (!confirm(`¿Eliminar el evento "${ev.nombre ?? ev.titulo ?? id}"?`)) return;
    setDeletingId(id);
    setError(null);
    try {
      await eventosAPI.delete(id);
      await cargarEventos();
    } catch (e3) {
      console.error('Error al eliminar evento', e3);
      setError(e3?.message || 'No se pudo eliminar el evento');
    } finally {
      setDeletingId(null);
    }
  };

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return eventos;
    return eventos.filter((e) =>
      [e.nombre, e.titulo, e.descripcion, e.categoria, e.lugar, e.ciudad?.nombre]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [eventos, busqueda]);

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-white text-lg font-semibold">No autorizado</h2>
          <p className="text-white/60 text-sm">Esta sección es exclusiva para administradores.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page p-6 gestion-eventos">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Gestión de Eventos
            </h1>
            <p className="text-white/60 text-sm mt-1">Crea, edita y elimina eventos. Asocia una ciudad y define datos clave.</p>
          </div>
        </div>

        {error && (
          <div className="admin-alert">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={guardar} className="admin-card">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">
              {form.id ? `Editando Evento: ${form.nombre}` : 'Crear Nuevo Evento'}
            </h3>
            {form.id && (
              <p className="text-white/60 text-sm mt-1">Modifica los datos del evento y haz clic en "Actualizar"</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm text-white/70 mb-1">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={onChange}
                placeholder="Ej. Concierto Rock Quito"
                className="admin-input w-full"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm text-white/70 mb-1">Categoría</label>
              <input
                type="text"
                name="categoria"
                value={form.categoria}
                onChange={onChange}
                placeholder="Ej. Música"
                className="admin-input w-full"
              />
            </div>
            <div className="md:col-span-4">
              <label className="block text-sm text-white/70 mb-1">Descripción</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={onChange}
                rows={3}
                placeholder="Detalles del evento"
                className="admin-textarea w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Fecha</label>
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={onChange}
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Hora</label>
              <input
                type="time"
                name="hora"
                value={form.hora}
                onChange={onChange}
                className="admin-input w-full"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-white/70 mb-1">Ciudad</label>
              <select
                name="ciudadId"
                value={form.ciudadId}
                onChange={onChange}
                className="admin-select w-full"
              >
                <option value="">Seleccionar ciudad</option>
                {ciudades.map((c) => (
                  <option key={c.id ?? c._id ?? c.codigo} value={c.id ?? c._id ?? c.codigo}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-white/70 mb-1">Lugar</label>
              <input
                type="text"
                name="lugar"
                value={form.lugar}
                onChange={onChange}
                placeholder="Ej. Coliseo Rumiñahui"
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Capacidad</label>
              <input
                type="number"
                name="capacidad"
                value={form.capacidad}
                onChange={onChange}
                min="0"
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Precio</label>
              <input
                type="number"
                name="precio"
                value={form.precio}
                onChange={onChange}
                min="0"
                step="0.01"
                className="admin-input w-full"
              />
            </div>
          </div>
          <div className="admin-spacer flex items-center gap-2">
            <button
              type="submit"
              disabled={saving}
              className="admin-btn admin-btn-primary"
            >
              {form.id ? (saving ? 'Actualizando...' : 'Actualizar') : (saving ? 'Creando...' : 'Crear')}
            </button>
            {form.id ? (
              <button
                type="button"
                onClick={limpiarFormulario}
                className="admin-btn"
              >
                Cancelar
              </button>
            ) : (
              <button
                type="button"
                onClick={limpiarFormulario}
                className="admin-btn"
              >
                Limpiar
              </button>
            )}
          </div>
        </form>

        {/* Barra de acciones */}
        <div className="admin-toolbar flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar evento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="admin-input w-full md:w-96 pl-10"
            />
            <svg className="w-5 h-5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={cargarEventos}
            disabled={loading}
            className="admin-btn"
          >
            {loading ? 'Actualizando...' : 'Refrescar'}
          </button>
        </div>

        {/* Tabla */}
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table min-w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Ciudad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Capacidad</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-white/60 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtrados.map((ev) => {
                  const id = ev.id ?? ev.codigo ?? ev._id ?? '-';
                  const nombre = ev.nombre ?? ev.titulo ?? '-';
                  const fechaMostrar = (() => {
                    const f = ev.fecha || ev.fechaEvento || ev.inicio;
                    try {
                      return new Date(f).toLocaleString();
                    } catch { return f || '-'; }
                  })();
                  const ciudadNombre = ev.ciudad?.nombre || ev.ciudadNombre || '-';
                  const capacidad = ev.capacidad ?? ev.aforo ?? '-';
                  return (
                    <tr key={id} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-white/80 text-sm">{id}</td>
                      <td className="px-4 py-3 text-white text-sm font-medium">{nombre}</td>
                      <td className="px-4 py-3 text-white/80 text-sm">{fechaMostrar}</td>
                      <td className="px-4 py-3 text-white/80 text-sm">{ciudadNombre}</td>
                      <td className="px-4 py-3 text-white/80 text-sm">{capacidad}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => editar(ev)}
                            className={`px-3 py-1.5 rounded-lg text-sm ${
                              form.id === (ev.id ?? ev.codigo ?? ev._id) 
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                                : 'text-white/90 bg-white/10 hover:bg-white/20'
                            }`}
                          >
                            {form.id === (ev.id ?? ev.codigo ?? ev._id) ? 'Editando...' : 'Editar'}
                          </button>
                          <button
                            onClick={() => eliminar(ev)}
                            disabled={deletingId === id}
                            className="px-3 py-1.5 rounded-lg text-red-200/90 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-sm disabled:opacity-60"
                          >
                            {deletingId === id ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {(!loading && filtrados.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-white/50 text-sm">
                      No hay eventos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

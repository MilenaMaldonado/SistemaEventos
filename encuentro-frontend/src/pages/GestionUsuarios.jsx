import React, { useEffect, useMemo, useState } from 'react';
import usuariosAPI from '../api/usuariosAPI';
import rolesAPI from '../api/rolesAPI';
import { useAuth } from '../contexts/AuthContext';
import './AdminShared.css';

const unwrap = (resp) => (resp && resp.data !== undefined ? resp.data : resp) || [];

export default function GestionUsuarios() {
  const { isAdmin } = useAuth() || { isAdmin: false };

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [assigningRoleId, setAssigningRoleId] = useState(null);

  const [form, setForm] = useState({
    id: null,
    cedula: '',
    nombre: '',
    email: '',
    role: '',
    active: true,
  });

  const cargarUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await usuariosAPI.getAll();
      const data = unwrap(resp);
      // Manejar tanto array directo como paginado {content: []}
      const list = Array.isArray(data) ? data : data?.content || [];
      setUsuarios(list);
    } catch (e) {
      console.error('Error al cargar usuarios', e);
      setError(e?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const cargarRoles = async () => {
    setLoadingRoles(true);
    try {
      const resp = await rolesAPI.getAll();
      const data = unwrap(resp);
      const list = Array.isArray(data) ? data : data?.content || [];
      setRoles(list);
    } catch (e) {
      console.error('Error al cargar roles', e);
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
  }, []);

  const limpiarFormulario = () => setForm({ id: null, cedula: '', nombre: '', email: '', role: '', active: true });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const editar = (u) => {
    setForm({
      id: u.id ?? u.cedula ?? null,
      cedula: u.cedula ?? '',
      nombre: u.nombre ?? u.name ?? '',
      email: u.email ?? u.correo ?? '',
      role: u.role ?? u.rol ?? '',
      active: Boolean(u.active ?? u.activo ?? true),
    });
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.cedula?.trim() || !form.nombre?.trim() || !form.email?.trim()) {
      setError('Cédula, nombre y email son obligatorios');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = { cedula: form.cedula.trim(), nombre: form.nombre.trim(), email: form.email.trim(), role: form.role, active: form.active };
      if (form.id) {
        await usuariosAPI.update(form.id, payload);
      } else {
        await usuariosAPI.create(payload);
      }
      await cargarUsuarios();
      limpiarFormulario();
    } catch (e2) {
      console.error('Error al guardar usuario', e2);
      setError(e2?.message || 'No se pudo guardar el usuario');
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (u) => {
    const id = u.id ?? u.cedula;
    if (!id) return;
    if (!confirm(`¿Eliminar el usuario "${u.nombre ?? u.cedula}"?`)) return;
    setDeletingId(id);
    setError(null);
    try {
      await usuariosAPI.delete(id);
      await cargarUsuarios();
    } catch (e3) {
      console.error('Error al eliminar usuario', e3);
      setError(e3?.message || 'No se pudo eliminar el usuario');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleEstado = async (u) => {
    const id = u.id ?? u.cedula;
    if (!id) return;
    setTogglingId(id);
    try {
      const nuevo = !(u.active ?? u.activo ?? true);
      await usuariosAPI.toggleUserStatus(id, nuevo);
      await cargarUsuarios();
    } catch (e4) {
      console.error('Error al cambiar estado', e4);
      setError(e4?.message || 'No se pudo cambiar el estado del usuario');
    } finally {
      setTogglingId(null);
    }
  };

  const asignarRol = async (u, roleId) => {
    const id = u.id ?? u.cedula;
    if (!id) return;
    setAssigningRoleId(id);
    try {
      await usuariosAPI.assignRole(id, roleId);
      await cargarUsuarios();
    } catch (e5) {
      console.error('Error al asignar rol', e5);
      setError(e5?.message || 'No se pudo asignar el rol');
    } finally {
      setAssigningRoleId(null);
    }
  };

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) =>
      [u.cedula, u.nombre, u.name, u.email, u.correo, u.role, u.rol]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [usuarios, busqueda]);

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
    <div className="admin-page p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Gestión de Usuarios
            </h1>
            <p className="text-white/60 text-sm mt-1">Crea, edita, activa/desactiva usuarios y asigna roles.</p>
          </div>
        </div>

        {error && (
          <div className="admin-alert">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={guardar} className="admin-card">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Cédula</label>
              <input
                type="text"
                name="cedula"
                value={form.cedula}
                onChange={onChange}
                placeholder="Ej. 0102030405"
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={onChange}
                placeholder="Ej. Juan Pérez"
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="correo@dominio.com"
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Rol</label>
              <select
                name="role"
                value={form.role || ''}
                onChange={onChange}
                className="admin-select w-full"
              >
                <option value="">Seleccionar rol</option>
                {roles.map((r) => (
                  <option key={r.id ?? r.codigo ?? r.nombre} value={r.id ?? r.codigo ?? r.nombre}>
                    {r.nombre ?? r.name ?? r.codigo}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <div className="flex items-center gap-2">
                <input
                  id="active"
                  type="checkbox"
                  name="active"
                  checked={!!form.active}
                  onChange={onChange}
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-white/10 rounded"
                />
                <label htmlFor="active" className="text-sm text-white/80">Activo</label>
              </div>
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
            {form.id && (
              <button
                type="button"
                onClick={limpiarFormulario}
                className="admin-btn"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* Barra de acciones */}
        <div className="admin-toolbar flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="admin-input w-full md:w-96 pl-10"
            />
            <svg className="w-5 h-5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={cargarUsuarios}
              disabled={loading}
              className="admin-btn"
            >
              {loading ? 'Actualizando...' : 'Refrescar'}
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table min-w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Cédula/ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Rol</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-white/60 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtrados.map((u) => {
                  const id = u.id ?? u.cedula ?? '-';
                  const nombre = u.nombre ?? u.name ?? '-';
                  const correo = u.email ?? u.correo ?? '-';
                  const rolActual = u.role ?? u.rol ?? '-';
                  const activo = Boolean(u.active ?? u.activo ?? true);
                  return (
                    <tr key={id} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-white/80 text-sm">{id}</td>
                      <td className="px-4 py-3 text-white text-sm font-medium">{nombre}</td>
                      <td className="px-4 py-3 text-white/80 text-sm">{correo}</td>
                      <td className="px-4 py-3 text-white/80 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10 text-white/80 text-xs">{rolActual}</span>
                          <select
                            disabled={assigningRoleId === id || loadingRoles}
                            onChange={(e) => asignarRol(u, e.target.value)}
                            defaultValue=""
                            className="bg-slate-900/50 text-white/80 border border-white/10 rounded px-2 py-1 text-xs"
                          >
                            <option value="" disabled>Cambiar rol</option>
                            {roles.map((r) => (
                              <option key={r.id ?? r.codigo ?? r.nombre} value={r.id ?? r.codigo ?? r.nombre}>
                                {r.nombre ?? r.name ?? r.codigo}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs border ${activo ? 'bg-green-500/10 text-green-300 border-green-500/20' : 'bg-red-500/10 text-red-200 border-red-500/20'}`}>
                          {activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => editar(u)}
                            className="px-3 py-1.5 rounded-lg text-white/90 bg-white/10 hover:bg-white/20 text-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => toggleEstado(u)}
                            disabled={togglingId === id}
                            className={`px-3 py-1.5 rounded-lg text-sm ${activo ? 'text-yellow-200 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20' : 'text-green-200 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20'} disabled:opacity-60`}
                          >
                            {togglingId === id ? 'Cambiando...' : (activo ? 'Desactivar' : 'Activar')}
                          </button>
                          <button
                            onClick={() => eliminar(u)}
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
                      No hay usuarios registrados.
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

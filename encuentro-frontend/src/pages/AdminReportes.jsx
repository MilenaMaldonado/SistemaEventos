import React, { useEffect, useMemo, useState } from 'react';
import reportesAPI from '../api/reportesAPI';
import eventosAPI from '../api/eventosAPI';
import { useAuth } from '../contexts/AuthContext';
import './AdminShared.css';

const unwrap = (resp) => (resp && resp.data !== undefined ? resp.data : resp) || [];

const Section = ({ title, description, children, actions }) => (
  <div className="admin-card space-y-4">
    <div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && <p className="text-white/60 text-sm mt-1">{description}</p>}
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      {children}
    </div>
    {actions && (
      <div className="flex flex-wrap gap-2 pt-2">
        {actions}
      </div>
    )}
  </div>
);

const JSONPreview = ({ data }) => {
  if (!data) return null;
  try {
    const pretty = JSON.stringify(data, null, 2);
    return (
      <pre className="bg-black/30 text-white/80 border border-white/10 rounded-lg p-4 text-xs overflow-auto max-h-96 whitespace-pre-wrap">
        {pretty}
      </pre>
    );
  } catch {
    return null;
  }
};

const TableFromArray = ({ rows }) => {
  const normalized = Array.isArray(rows) ? rows : [];
  const columns = useMemo(() => {
    if (!normalized.length) return [];
    if (typeof normalized[0] !== 'object' || normalized[0] === null) return [];
    return Object.keys(normalized[0]);
  }, [rows]);

  if (!normalized.length || !columns.length) {
    return <JSONPreview data={rows} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="admin-table min-w-full">
        <thead className="bg-white/5">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {normalized.map((row, idx) => (
            <tr key={idx} className="hover:bg-white/5">
              {columns.map((c) => (
                <td key={c} className="px-4 py-3 text-white/80 text-sm">
                  {typeof row[c] === 'object' ? JSON.stringify(row[c]) : String(row[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function AdminReportes() {
  const { isAdmin } = useAuth() || { isAdmin: false };

  const [eventos, setEventos] = useState([]);
  const [error, setError] = useState(null);

  // Filtros generales
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Ventas general
  const [ventasGeneralLoading, setVentasGeneralLoading] = useState(false);
  const [ventasGeneral, setVentasGeneral] = useState(null);

  // Ventas por evento
  const [eventoIdVentas, setEventoIdVentas] = useState('');
  const [ventasEventoLoading, setVentasEventoLoading] = useState(false);
  const [ventasEvento, setVentasEvento] = useState(null);

  // Asistencia por evento
  const [eventoIdAsistencia, setEventoIdAsistencia] = useState('');
  const [asistenciaLoading, setAsistenciaLoading] = useState(false);
  const [asistencia, setAsistencia] = useState(null);

  const cargarEventos = async () => {
    try {
      const resp = await eventosAPI.getAll();
      const data = unwrap(resp);
      setEventos(Array.isArray(data) ? data : data?.content || []);
    } catch (e) {
      console.error('Error al cargar eventos', e);
    }
  };

  useEffect(() => {
    cargarEventos();
  }, []);

  const paramsFechas = useMemo(() => {
    const p = {};
    if (fechaInicio) p.fechaInicio = fechaInicio;
    if (fechaFin) p.fechaFin = fechaFin;
    return p;
  }, [fechaInicio, fechaFin]);

  const obtenerVentasGeneral = async () => {
    setVentasGeneralLoading(true);
    setError(null);
    try {
      const resp = await reportesAPI.getReporteVentas(paramsFechas);
      setVentasGeneral(unwrap(resp));
    } catch (e) {
      console.error('Error en reporte de ventas general', e);
      setError(e?.message || 'No se pudo obtener el reporte de ventas');
    } finally {
      setVentasGeneralLoading(false);
    }
  };

  const exportarVentasExcel = async () => {
    try {
      await reportesAPI.exportVentasExcel(paramsFechas);
    } catch (e) {
      console.error('Error exportando Excel', e);
      setError(e?.message || 'No se pudo exportar Excel');
    }
  };

  const exportarVentasPDF = async () => {
    try {
      await reportesAPI.exportVentasPDF(paramsFechas);
    } catch (e) {
      console.error('Error exportando PDF', e);
      setError(e?.message || 'No se pudo exportar PDF');
    }
  };

  const obtenerVentasPorEvento = async () => {
    if (!eventoIdVentas) {
      setError('Seleccione un evento para el reporte de ventas por evento');
      return;
    }
    setVentasEventoLoading(true);
    setError(null);
    try {
      const resp = await reportesAPI.getVentasPorEvento(eventoIdVentas, paramsFechas);
      setVentasEvento(unwrap(resp));
    } catch (e) {
      console.error('Error en ventas por evento', e);
      setError(e?.message || 'No se pudo obtener el reporte de ventas por evento');
    } finally {
      setVentasEventoLoading(false);
    }
  };

  const obtenerAsistencia = async () => {
    if (!eventoIdAsistencia) {
      setError('Seleccione un evento para el reporte de asistencia');
      return;
    }
    setAsistenciaLoading(true);
    setError(null);
    try {
      const resp = await reportesAPI.getReporteAsistencia(eventoIdAsistencia);
      setAsistencia(unwrap(resp));
    } catch (e) {
      console.error('Error en asistencia por evento', e);
      setError(e?.message || 'No se pudo obtener el reporte de asistencia');
    } finally {
      setAsistenciaLoading(false);
    }
  };

  const exportarAsistenciaExcel = async () => {
    if (!eventoIdAsistencia) return;
    try {
      await reportesAPI.exportAsistenciaExcel(eventoIdAsistencia);
    } catch (e) {
      console.error('Error exportando Excel asistencia', e);
      setError(e?.message || 'No se pudo exportar Excel de asistencia');
    }
  };

  const exportarAsistenciaPDF = async () => {
    if (!eventoIdAsistencia) return;
    try {
      await reportesAPI.exportAsistenciaPDF(eventoIdAsistencia);
    } catch (e) {
      console.error('Error exportando PDF asistencia', e);
      setError(e?.message || 'No se pudo exportar PDF de asistencia');
    }
  };

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
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Reportes</h1>
            <p className="text-white/60 text-sm mt-1">Genera reportes de ventas y asistencia. Filtra por rango de fechas y evento, y exporta a Excel o PDF.</p>
          </div>
        </div>

        {error && (
          <div className="admin-alert">{error}</div>
        )}

        {/* Filtros globales */}
        <div className="admin-card">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Fecha inicio</label>
              <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="admin-input w-full" />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Fecha fin</label>
              <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="admin-input w-full" />
            </div>
          </div>
        </div>

        {/* Ventas general */}
        <Section
          title="Ventas (General)"
          description="Reporte de ventas general por rango de fechas."
          actions={(
            <>
              <button onClick={obtenerVentasGeneral} disabled={ventasGeneralLoading} className="admin-btn">
                {ventasGeneralLoading ? 'Consultando...' : 'Consultar Ventas'}
              </button>
              <button onClick={exportarVentasExcel} className="admin-btn admin-btn-primary">
                Exportar Excel
              </button>
              <button onClick={exportarVentasPDF} className="admin-btn admin-btn-primary">
                Exportar PDF
              </button>
            </>
          )}
        >
          <div className="md:col-span-3">
            <TableFromArray rows={Array.isArray(ventasGeneral) ? ventasGeneral : (ventasGeneral?.items || ventasGeneral?.data || [])} />
            {!ventasGeneral && <div className="text-white/50 text-sm">Sin datos. Realiza una consulta.</div>}
          </div>
        </Section>

        {/* Ventas por evento */}
        <Section
          title="Ventas por Evento"
          description="Consulta de ventas para un evento específico."
          actions={(
            <>
              <button onClick={obtenerVentasPorEvento} disabled={ventasEventoLoading} className="admin-btn">
                {ventasEventoLoading ? 'Consultando...' : 'Consultar Ventas por Evento'}
              </button>
            </>
          )}
        >
          <div>
            <label className="block text-sm text-white/70 mb-1">Evento</label>
            <select value={eventoIdVentas} onChange={(e) => setEventoIdVentas(e.target.value)} className="admin-select w-full">
              <option value="">Seleccionar evento</option>
              {eventos.map((ev) => (
                <option key={ev.id ?? ev.codigo ?? ev._id} value={ev.id ?? ev.codigo ?? ev._id}>
                  {ev.nombre ?? ev.titulo}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <TableFromArray rows={Array.isArray(ventasEvento) ? ventasEvento : (ventasEvento?.items || ventasEvento?.data || [])} />
            {!ventasEvento && <div className="text-white/50 text-sm">Sin datos. Realiza una consulta.</div>}
          </div>
        </Section>

        {/* Asistencia por evento */}
        <Section
          title="Asistencia por Evento"
          description="Consulta de asistencia para un evento específico y exportación."
          actions={(
            <>
              <button onClick={obtenerAsistencia} disabled={asistenciaLoading} className="admin-btn">
                {asistenciaLoading ? 'Consultando...' : 'Consultar Asistencia'}
              </button>
              <button onClick={exportarAsistenciaExcel} disabled={!eventoIdAsistencia} className="admin-btn admin-btn-primary disabled:opacity-60">
                Exportar Excel
              </button>
              <button onClick={exportarAsistenciaPDF} disabled={!eventoIdAsistencia} className="admin-btn admin-btn-primary disabled:opacity-60">
                Exportar PDF
              </button>
            </>
          )}
        >
          <div>
            <label className="block text-sm text-white/70 mb-1">Evento</label>
            <select value={eventoIdAsistencia} onChange={(e) => setEventoIdAsistencia(e.target.value)} className="admin-select w-full">
              <option value="">Seleccionar evento</option>
              {eventos.map((ev) => (
                <option key={ev.id ?? ev.codigo ?? ev._id} value={ev.id ?? ev.codigo ?? ev._id}>
                  {ev.nombre ?? ev.titulo}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <TableFromArray rows={Array.isArray(asistencia) ? asistencia : (asistencia?.items || asistencia?.data || [])} />
            {!asistencia && <div className="text-white/50 text-sm">Sin datos. Realiza una consulta.</div>}
          </div>
        </Section>
      </div>
    </div>
  );
}

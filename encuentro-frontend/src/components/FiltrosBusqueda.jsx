import React from 'react';
import './FiltrosBusqueda.css';

export default function FiltrosBusqueda({ onBuscar, onFiltrar }) {
  return (
    <section className="filtros-busqueda">
      <input type="text" placeholder="Buscar eventos..." className="busqueda-input" onChange={e => onBuscar(e.target.value)} />
      <select className="filtro-select" onChange={e => onFiltrar('categoria', e.target.value)}>
        <option value="">Categoría</option>
        <option value="musica">Música</option>
        <option value="deporte">Deporte</option>
        <option value="cultural">Cultural</option>
      </select>
      <select className="filtro-select" onChange={e => onFiltrar('fecha', e.target.value)}>
        <option value="">Fecha</option>
        <option value="hoy">Hoy</option>
        <option value="semana">Esta semana</option>
        <option value="mes">Este mes</option>
      </select>
      <select className="filtro-select" onChange={e => onFiltrar('ubicacion', e.target.value)}>
        <option value="">Ubicación</option>
        <option value="quito">Quito</option>
        <option value="guayaquil">Guayaquil</option>
        <option value="cuenca">Cuenca</option>
      </select>
    </section>
  );
}

import React from 'react';
import './EventosDestacados.css';

export default function EventosDestacados({ eventos, onComprar }) {
  return (
    <section id="eventos" className="eventos-destacados">
      <h2>Eventos Destacados</h2>
      <div className="eventos-grid">
        {eventos.length === 0 && <p>No hay eventos disponibles.</p>}
        {eventos.map(evento => (
          <div key={evento.idEvento} className="evento-card">
            <img src={evento.imagenUrl} alt={evento.nombre} className="evento-img" />
            <div className="evento-info">
              <h3>{evento.nombre}</h3>
              <p>Fecha: {evento.fecha}</p>
              <p>Ubicación: {evento.establecimiento}</p>
              <button className="evento-btn" onClick={() => onComprar(evento.idEvento)}>
                Comprar boleto
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

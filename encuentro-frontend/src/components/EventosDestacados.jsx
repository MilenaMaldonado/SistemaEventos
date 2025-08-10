import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EventosDestacados.css';

export default function EventosDestacados({ eventos, onComprar }) {
  const navigate = useNavigate();

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
              <p>Fecha: {formatearFecha(evento.fechaHora || evento.fecha)}</p>
              <p>Ubicación: {evento.ubicacion || evento.establecimiento}</p>
              <p className="evento-precio">Precio: ${(evento.precio || 50.0).toFixed(2)}</p>
              <div className="evento-actions">
                <button 
                  className="evento-btn evento-btn-detalles" 
                  onClick={() => navigate(`/evento/${evento.idEvento}`)}
                >
                  Ver detalles
                </button>
                <button 
                  className="evento-btn evento-btn-comprar" 
                  onClick={() => navigate(`/evento/${evento.idEvento}`)}
                >
                  Comprar boleto
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

import React, { useState, useEffect } from 'react';
import './CarruselPromociones.css';

const imagenes = [
  {
    url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
    texto: '🎟️ ¡Compra tus tickets para los mejores conciertos!'
  },
  {
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    texto: '🔥 Promoción: 2x1 en eventos seleccionados'
  },
  {
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    texto: '🎤 ¡Vive la experiencia de tus artistas favoritos!'
  },
  {
    url: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=800&q=80',
    texto: '🔒 Entradas seguras y pago protegido'
  },
];

export default function CarruselPromociones() {
  const [actual, setActual] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActual(prev => (prev + 1) % imagenes.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const siguiente = () => setActual((actual + 1) % imagenes.length);
  const anterior = () => setActual((actual - 1 + imagenes.length) % imagenes.length);

  return (
    <div className="carrusel-container">
      <button className="carrusel-btn carrusel-btn-left" onClick={anterior}>&lt;</button>
      <div className="carrusel-img-wrapper">
        <img src={imagenes[actual].url} alt="Promoción" className="carrusel-img" />
        <div className="carrusel-text">{imagenes[actual].texto}</div>
      </div>
      <button className="carrusel-btn carrusel-btn-right" onClick={siguiente}>&gt;</button>
    </div>
  );
}

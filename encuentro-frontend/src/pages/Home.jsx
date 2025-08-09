
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import CarruselPromociones from '../components/CarruselPromociones';
import FiltrosBusqueda from '../components/FiltrosBusqueda';
import InfoPagoSeguridad from '../components/InfoPagoSeguridad';
import Testimonios from '../components/Testimonios';
import Footer from '../components/Footer';
import './Home.css';

// Imágenes libres de derechos para eventos musicales/conciertos
const imagenesLibres = [
  'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?auto=format&fit=crop&w=600&q=80',
];

export default function Home() {
  const [eventos, setEventos] = useState([]);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState({ categoria: '', fecha: '', ubicacion: '' });

  useEffect(() => {
    axios.get('http://localhost:8000/api/ms-eventos/api/eventos')
      .then(res => {
        setEventos(res.data.respuesta || []);
      })
      .catch(err => {
        setError('Error al cargar eventos');
        console.error(err);
      });
  }, []);

  // Filtrado y búsqueda básica
  const eventosFiltrados = eventos.filter(evento => {
    const matchBusqueda = busqueda === '' || evento.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = filtros.categoria === '' || (evento.categoria && evento.categoria === filtros.categoria);
    const matchFecha = filtros.fecha === '' || (evento.fecha && evento.fecha.includes(filtros.fecha));
    const matchUbicacion = filtros.ubicacion === '' || (evento.establecimiento && evento.establecimiento.toLowerCase().includes(filtros.ubicacion.toLowerCase()));
    return matchBusqueda && matchCategoria && matchFecha && matchUbicacion;
  });

  const handleBuscar = (valor) => setBusqueda(valor);
  const handleFiltrar = (tipo, valor) => setFiltros(prev => ({ ...prev, [tipo]: valor }));
  const handleVerDetalles = (idEvento) => window.location.href = `/evento/${idEvento}`;

  return (
    <div className="home-container">
      <Navbar />
  <CarruselPromociones />
  <HeroSection />
      <FiltrosBusqueda onBuscar={handleBuscar} onFiltrar={handleFiltrar} />
      <section className="proximos-eventos-section">
        <h2 className="proximos-eventos-title">Próximos Eventos</h2>
        <div className="proximos-eventos-grid">
          {eventosFiltrados.length === 0 && <p className="no-eventos">No hay eventos disponibles.</p>}
          {eventosFiltrados.map((evento, idx) => (
            <div key={evento.idEvento} className="evento-card">
              <div className="evento-img-wrapper">
                <img
                  src={evento.imagenUrl && evento.imagenUrl.startsWith('http') ? evento.imagenUrl : imagenesLibres[idx % imagenesLibres.length]}
                  alt={evento.nombre}
                  className="evento-img"
                  onError={e => { e.target.src = imagenesLibres[idx % imagenesLibres.length]; }}
                />
              </div>
              <div className="evento-info">
                <h3 className="evento-nombre">{evento.nombre}</h3>
                <p className="evento-fecha">{evento.fecha}</p>
                <p className="evento-ubicacion">{evento.establecimiento}</p>
                <button className="evento-detalles-btn" onClick={() => handleVerDetalles(evento.idEvento)}>
                  Ver más detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <InfoPagoSeguridad />
      <Testimonios />
      <Footer />
      {error && <p className="error-msg">{error}</p>}
    </div>
  );
}

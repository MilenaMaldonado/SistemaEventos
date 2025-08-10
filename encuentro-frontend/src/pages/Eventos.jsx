import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventosAPI } from '../api/eventosAPI';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await eventosAPI.getAll();
        console.log('Eventos obtenidos:', response);
        
        // La estructura es data.respuesta
        const eventosData = response.data?.respuesta || response.respuesta;
        
        if (eventosData && Array.isArray(eventosData)) {
          // Filtrar solo eventos futuros (después de la fecha actual)
          const fechaActual = new Date();
          fechaActual.setHours(0, 0, 0, 0); // Resetear hora para comparar solo fechas
          
          const eventosFuturos = eventosData
            .filter(evento => {
              if (!evento.fecha) return false;
              const fechaEvento = new Date(evento.fecha + 'T00:00:00');
              return fechaEvento >= fechaActual;
            })
            .sort((a, b) => new Date(a.fecha + 'T00:00:00') - new Date(b.fecha + 'T00:00:00'));
          
          setEventos(eventosFuturos);
        } else {
          console.error('Estructura de respuesta inesperada:', response);
          setError('No se pudieron cargar los eventos');
        }
      } catch (error) {
        console.error('Error fetching eventos:', error);
        setError('Error al cargar los eventos');
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []);

  const handleEventClick = (eventoId) => {
    navigate(`/evento-detalle/${eventoId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/90 text-lg">Cargando eventos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <Navbar />
      
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Eventos Disponibles
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Descubre todos los eventos próximos y encuentra tu próxima experiencia inolvidable
            </p>
          </div>

          {/* Events Grid */}
          {eventos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {eventos.map((evento) => (
                <div
                  key={evento.idEvento}
                  onClick={() => handleEventClick(evento.idEvento)}
                  className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
                >
                  {/* Event Image */}
                  <div className="relative h-48 overflow-hidden">
                    {evento.imagenUrl ? (
                      <img
                        src={evento.imagenUrl}
                        alt={evento.nombre}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                        <svg className="w-16 h-16 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>

                  {/* Event Info */}
                  <div className="p-6">
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-medium rounded-full border border-cyan-500/30">
                        {evento.categoria || 'Tecnología'}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors line-clamp-2">
                      {evento.nombre}
                    </h3>
                    
                    <p className="text-white/60 text-sm mb-4 line-clamp-3">
                      {evento.descripcion || 'Evento imperdible con las últimas novedades tecnológicas'}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center text-white/70 text-sm">
                        <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {evento.fecha ? new Date(evento.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Fecha por definir'}
                      </div>
                      
                      <div className="flex items-center text-white/70 text-sm">
                        <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {evento.establecimiento || 'Ubicación por confirmar'}
                      </div>
                      
                      {evento.precio && (
                        <div className="flex items-center text-white/70 text-sm">
                          <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          ${evento.precio}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                      <span className="text-cyan-400 text-sm font-medium group-hover:text-cyan-300 transition-colors">
                        Ver detalles →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No hay eventos disponibles</h3>
              <p className="text-white/60 text-lg">Vuelve pronto para descubrir nuevos eventos emocionantes</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
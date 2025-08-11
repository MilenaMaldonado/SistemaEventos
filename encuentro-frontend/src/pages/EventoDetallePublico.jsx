import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventosAPI } from '../api/eventosAPI';
import { useAuth } from '../contexts/AuthContext';

const EventoDetallePublico = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      cargarEvento();
    }
  }, [id]);

  const cargarEvento = async () => {
    try {
      setLoading(true);
      console.log('Cargando evento con ID:', id);
      
      const response = await eventosAPI.getById(id);
      console.log('Evento obtenido:', response);
      
      // Ajustar según la estructura de tu API
      const eventoData = response.respuesta || response.data || response;
      setEvento(eventoData);
    } catch (error) {
      console.error('Error al cargar evento:', error);
      setError('Error al cargar los detalles del evento');
    } finally {
      setLoading(false);
    }
  };

  const handleComprarClick = () => {
    if (!isAuthenticated) {
      // Redirigir al login si no está autenticado
      navigate('/login', { 
        state: { from: `/evento/${id}` } 
      });
    } else {
      // Redirigir a la página de compra
      navigate(`/comprar-boletos/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white/80">Cargando detalles del evento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⚠️</div>
          <p className="text-white/80 mb-4">{error}</p>
          <Link 
            to="/eventos" 
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-6 py-2 rounded-lg transition-all duration-200"
          >
            Volver a Eventos
          </Link>
        </div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/80 mb-4">Evento no encontrado</p>
          <Link 
            to="/eventos" 
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-6 py-2 rounded-lg transition-all duration-200"
          >
            Volver a Eventos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Hero Section con imagen del evento */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src={evento.imagenUrl || '/placeholder-event.jpg'} 
          alt={evento.nombre}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
        
        {/* Botón de volver */}
        <div className="absolute top-6 left-6">
          <Link 
            to="/eventos"
            className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-black/50 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Volver</span>
          </Link>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="relative -mt-20 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            
            {/* Header del evento */}
            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
                {evento.nombre}
              </h1>
              <div className="flex flex-wrap justify-center items-center gap-6 text-white/80">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{evento.establecimiento}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{new Date(evento.fecha).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{evento.hora}</span>
                </div>
              </div>
            </div>

            {/* Información detallada */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              
              {/* Detalles del evento */}
              <div className="space-y-6">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <svg className="w-6 h-6 text-cyan-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Detalles del Evento
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Establecimiento:</span>
                      <span className="text-white font-medium">{evento.establecimiento}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Capacidad:</span>
                      <span className="text-white font-medium">{evento.capacidad?.toLocaleString()} personas</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Fecha:</span>
                      <span className="text-white font-medium">
                        {new Date(evento.fecha).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Hora:</span>
                      <span className="text-white font-medium">{evento.hora}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Precio y compra */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl p-6 border border-cyan-500/20">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <svg className="w-6 h-6 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Información de Compra
                  </h3>
                  
                  <div className="text-center space-y-4">
                    <div>
                      <p className="text-white/70 text-sm mb-1">Precio por boleto</p>
                      <p className="text-3xl font-bold text-green-400">
                        ${evento.precio}
                      </p>
                    </div>
                    
                    <button
                      onClick={handleComprarClick}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
                    >
                      🎫 Comprar Boletos
                    </button>
                    
                    {!isAuthenticated && (
                      <p className="text-white/50 text-sm">
                        Necesitas iniciar sesión para comprar boletos
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Información Importante</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-white/70">
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>Boletos digitales</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>Entrada garantizada</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>Soporte 24/7</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>Reembolso disponible</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EventoDetallePublico;

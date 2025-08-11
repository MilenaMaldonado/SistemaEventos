
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventosAPI } from '../api/eventosAPI';
import HeroSection from '../components/HeroSection';
import CarruselPromociones from '../components/CarruselPromociones';
import InfoPagoSeguridad from '../components/InfoPagoSeguridad';
import Testimonios from '../components/Testimonios';
import Footer from '../components/Footer';

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
          // Obtener solo los 3 eventos más próximos
          const eventosOrdenados = eventosData
            .filter(evento => evento.fecha) // Solo eventos con fecha (campo se llama 'fecha')
            .sort((a, b) => new Date(a.fecha + 'T00:00:00') - new Date(b.fecha + 'T00:00:00'))
            .slice(0, 3); // Solo los primeros 3
          
          setEventos(eventosOrdenados);
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

  const handleVerDetalles = (eventoId) => {
    navigate(`/evento/${eventoId}`);
  };

  return (
    <div className="min-h-screen">
      <div className="w-full overflow-hidden">
          <CarruselPromociones />
      </div>
      <HeroSection />
      
      {/* Próximos Eventos Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Próximos Eventos
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto rounded-full"></div>
          </div>
          
          {loading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/70 text-lg">Cargando próximos eventos...</p>
            </div>
          ) : eventos.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-xl text-white/70">No hay eventos disponibles en este momento</p>
              <p className="text-white/50 mt-2">Pronto habrá nuevos eventos emocionantes</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {eventos.map((evento, idx) => (
                <div 
                  key={evento.idEvento} 
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={evento.imagenUrl || imagenesLibres[idx % imagenesLibres.length]}
                      alt={evento.nombre}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={e => { e.target.src = imagenesLibres[idx % imagenesLibres.length]; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-gradient-to-r from-cyan-500/80 to-purple-500/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                        {evento.categoria || 'Tecnología'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors duration-300">
                      {evento.nombre}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-white/70 text-sm">
                        <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {evento.fecha ? new Date(evento.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Fecha por definir'}
                      </div>
                      
                      <div className="flex items-center text-white/70 text-sm">
                        <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {evento.establecimiento || 'Ubicación por confirmar'}
                      </div>
                    </div>
                    
                    <button 
                      className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25"
                      onClick={() => handleVerDetalles(evento.idEvento)}
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      
      <InfoPagoSeguridad />
      <Testimonios />
      <Footer />
      
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500/90 backdrop-blur-sm text-white p-4 rounded-xl shadow-lg border border-red-400/20">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}
    </div>
  );
}

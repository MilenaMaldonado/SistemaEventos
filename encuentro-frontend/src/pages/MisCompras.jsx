import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventosAPI } from '../api/eventosAPI';
import { useAuth } from '../contexts/AuthContext';

function MisCompras() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.cedula) {
      cargarMisTickets();
    }
  }, [user]);

  const cargarMisTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Cargando tickets para usuario:', user.cedula);
      
      // Obtener todos los usuarios para encontrar los IDs de tickets
      console.log('📥 Obteniendo lista de usuarios...');
      const usuariosResponse = await fetch('http://localhost:8000/api/ms-usuarios/api/usuarios');
      
      if (!usuariosResponse.ok) {
        throw new Error(`Error obteniendo usuarios: ${usuariosResponse.status}`);
      }
      
      const usuarios = await usuariosResponse.json();
      console.log('👥 Usuarios obtenidos:', usuarios);
      
      // Buscar el usuario actual por cédula
      const usuarioActual = usuarios.find(u => u.cedula === user.cedula);
      
      if (!usuarioActual) {
        console.log('❌ Usuario no encontrado en la lista');
        setTickets([]);
        return;
      }
      
      console.log('👤 Usuario encontrado:', usuarioActual);
      
      // Buscar todos los tickets que pertenezcan al usuario
      const misTickets = [];
      
      // Intentar obtener tickets (probando diferentes IDs)
      for (let ticketId = 1; ticketId <= 50; ticketId++) {
        try {
          console.log(`🎫 Verificando ticket ID: ${ticketId}`);
          const ticketResponse = await fetch(`http://localhost:8000/api/ms-tickets/api/tickets-clientes/${ticketId}`);
          
          if (ticketResponse.ok) {
            const ticketData = await ticketResponse.json();
            console.log(`✅ Ticket ${ticketId} obtenido:`, ticketData);
            
            // Verificar si el ticket pertenece al usuario actual
            if (ticketData.respuesta && ticketData.respuesta.cedula === user.cedula) {
              console.log(`🎯 Ticket ${ticketId} pertenece al usuario actual`);
              
              // Obtener información del evento
              try {
                const eventoResponse = await eventosAPI.getById(ticketData.respuesta.idEvento);
                const evento = eventoResponse.respuesta || eventoResponse.data || eventoResponse;
                
                misTickets.push({
                  ...ticketData.respuesta,
                  evento: evento
                });
              } catch (eventError) {
                console.error(`Error obteniendo evento ${ticketData.respuesta.idEvento}:`, eventError);
                misTickets.push({
                  ...ticketData.respuesta,
                  evento: { nombre: 'Evento no encontrado' }
                });
              }
            }
          } else if (ticketResponse.status === 404) {
            // No hay más tickets, salir del bucle
            console.log(`❌ No se encontró ticket con ID: ${ticketId}, detener búsqueda`);
            break;
          }
        } catch (ticketError) {
          console.log(`❌ Error obteniendo ticket ${ticketId}:`, ticketError.message);
          // Continuar con el siguiente ticket
        }
      }
      
      console.log('🎫 Total de tickets encontrados para el usuario:', misTickets.length);
      console.log('🎫 Detalles de mis tickets:', misTickets);
      
      setTickets(misTickets);
      
    } catch (error) {
      console.error('❌ Error cargando tickets:', error);
      setError(`Error al cargar tus compras: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-white/80">Cargando tus compras...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-red-400 text-xl mb-4">⚠️</div>
            <p className="text-white/80 mb-4">{error}</p>
            <button 
              onClick={cargarMisTickets}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-6 py-2 rounded-lg transition-all duration-200"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Mis Compras
          </h1>
          <p className="text-white/70">
            Aquí puedes ver todos los boletos que has comprado
          </p>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎫</div>
            <h2 className="text-2xl font-semibold text-white mb-4">No tienes compras aún</h2>
            <p className="text-white/60 mb-8">¡Explora nuestros eventos y compra tus primeros boletos!</p>
            <Link 
              to="/eventos"
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white py-3 px-8 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
            >
              Ver Eventos Disponibles
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tickets.map((ticket, index) => {
              const evento = ticket.evento;
              
              return (
                <div 
                  key={ticket.idTicketCliente || index}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                >
                  {/* Header del ticket */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                        Ticket #{ticket.idTicketCliente}
                      </span>
                      <span className="text-white/60 text-sm">
                        Asiento {ticket.numeroAsiento}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {evento?.nombre || 'Evento no encontrado'}
                    </h3>
                    
                    {evento && evento.establecimiento && (
                      <p className="text-white/70 text-sm">
                        {evento.establecimiento}
                      </p>
                    )}
                  </div>

                  {/* Información del evento */}
                  <div className="space-y-3 mb-4">
                    {evento && (
                      <>
                        <div className="flex items-center text-white/80 text-sm">
                          <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatearFecha(evento.fecha)} - {evento.hora}
                        </div>
                      </>
                    )}
                    
                    <div className="flex items-center text-white/80 text-sm">
                      <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Comprado: {formatearFecha(ticket.fechaEmision)}
                    </div>

                    <div className="flex items-center text-white/80 text-sm">
                      <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
                      </svg>
                      {ticket.metodoPago}
                    </div>
                  </div>

                  {/* Información de precio */}
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between items-center text-white/80 text-sm mb-1">
                      <span>Precio unitario:</span>
                      <span>${ticket.precioUnitarioTicket?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-white/80 text-sm mb-1">
                      <span>Subtotal:</span>
                      <span>${ticket.subtotal?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-white/80 text-sm mb-1">
                      <span>IVA ({(ticket.iva * 100).toFixed(0)}%):</span>
                      <span>${(ticket.subtotal * ticket.iva)?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold text-green-400">
                      <span>Total:</span>
                      <span>${ticket.total?.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    {evento && (
                      <Link 
                        to={`/evento/${ticket.idEvento}`}
                        className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                      >
                        Ver evento →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MisCompras;

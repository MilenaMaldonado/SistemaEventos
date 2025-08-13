import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function MisCompras() {
  const { userId, isAuthenticated } = useAuth();
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && userId) {
      cargarMisCompras();
    }
  }, [isAuthenticated, userId]);

  const cargarMisCompras = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Cargando compras para cédula:', userId);
      
      // Usar el nuevo endpoint del microservicio de tickets
      const response = await fetch(`http://localhost:8081/api/compras/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // No hay compras para esta cédula
          setCompras([]);
          return;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const comprasData = await response.json();
      console.log('✅ Compras obtenidas:', comprasData);
      
      setCompras(comprasData);
      
    } catch (error) {
      console.error('❌ Error cargando compras:', error);
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
              onClick={cargarMisCompras}
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

        {compras.length === 0 ? (
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
          <div className="space-y-8">
            {compras.map((compra, index) => (
              <div 
                key={compra.facturaId || index}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
              >
                {/* Header de la compra */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                      Factura #{compra.facturaId.substring(0, 8)}...
                    </span>
                    <span className="text-white/60 text-sm">
                      {formatearFecha(compra.fechaCompra)}
                    </span>
                  </div>
                
                </div>

                {/* Tickets/Asientos */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">Asientos comprados</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {compra.tickets.map((ticket, ticketIndex) => (
                      <div 
                        key={ticket.ticketId || ticketIndex}
                        className="bg-white/10 border border-white/20 rounded-lg p-3 text-center"
                      >
                        <div className="text-cyan-400 font-bold text-lg">
                          {ticket.numeroAsiento}
                        </div>
                        <div className="text-white/60 text-xs">
                          ${ticket.precioUnitario.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-white/60 text-sm mt-2">
                    Total: {compra.tickets.length} boleto{compra.tickets.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Información de precio */}
                <div className="border-t border-white/10 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center text-white/80 text-sm mb-1">
                        <span>Cédula:</span>
                        <span>{compra.cedula}</span>
                      </div>
                      <div className="flex justify-between items-center text-white/80 text-sm mb-1">
                        <span>Fecha de compra:</span>
                        <span>{formatearFecha(compra.fechaCompra)}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-white/80 text-sm mb-1">
                        <span>Subtotal:</span>
                        <span>${compra.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-white/80 text-sm mb-1">
                        <span>IVA (12%):</span>
                        <span>${compra.iva.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-lg font-bold text-green-400">
                        <span>Total:</span>
                        <span>${compra.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <Link 
                    to={`/evento/${compra.idEvento}`}
                    className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                  >
                    Ver evento →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MisCompras;
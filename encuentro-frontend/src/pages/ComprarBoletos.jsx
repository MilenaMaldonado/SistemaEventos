import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventosAPI } from '../api/eventosAPI';
import { ticketsAPI } from '../api/ticketsAPI';
import { useAuth } from '../contexts/AuthContext';

const ComprarBoletos = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCompra, setLoadingCompra] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Datos del formulario
  const [cantidadBoletos, setCantidadBoletos] = useState(1);
  const [metodoPago, setMetodoPago] = useState('TARJETA_CREDITO');
  const [numerosAsientos, setNumerosAsientos] = useState([]);

  // Constantes para cálculos
  const IVA_RATE = 0.19; // 19% de IVA

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { from: `/comprar-boletos/${id}` } 
      });
      return;
    }
    
    if (id) {
      cargarEvento();
    }
  }, [id, isAuthenticated, navigate]);

  useEffect(() => {
    // Generar números de asientos automáticamente (simulado)
    if (cantidadBoletos > 0) {
      const asientos = [];
      for (let i = 1; i <= cantidadBoletos; i++) {
        // Generar números aleatorios para simular asientos disponibles
        asientos.push(Math.floor(Math.random() * 1000) + 1);
      }
      setNumerosAsientos(asientos);
    }
  }, [cantidadBoletos]);

  const cargarEvento = async () => {
    try {
      setLoading(true);
      console.log('Cargando evento con ID:', id);
      
      const response = await eventosAPI.getById(id);
      console.log('Evento obtenido:', response);
      
      const eventoData = response.respuesta || response.data || response;
      setEvento(eventoData);
    } catch (error) {
      console.error('Error al cargar evento:', error);
      setError('Error al cargar los detalles del evento');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotales = () => {
    if (!evento || !evento.precio) return { subtotal: 0, iva: 0, total: 0 };
    
    const precioUnitario = parseFloat(evento.precio);
    const subtotal = cantidadBoletos * precioUnitario;
    const iva = subtotal * IVA_RATE;
    const total = subtotal + iva;
    
    return {
      precioUnitario,
      subtotal,
      iva,
      total
    };
  };

  const handleComprarBoletos = async () => {
    if (!user || !user.cedula) {
      setError('Error: Usuario no identificado correctamente');
      return;
    }

    // Validar que la cédula tenga exactamente 10 dígitos
    if (user.cedula.length !== 10 || !/^\d{10}$/.test(user.cedula)) {
      setError('Error: La cédula del usuario debe tener exactamente 10 dígitos');
      return;
    }

    if (cantidadBoletos <= 0) {
      setError('Debe seleccionar al menos 1 boleto');
      return;
    }

    if (numerosAsientos.length === 0) {
      setError('Error: No se pudieron generar los números de asientos');
      return;
    }

    try {
      setLoadingCompra(true);
      setError(null);
      
      const totales = calcularTotales();
      
      // Debug logs
      console.log('=== DEBUG INFO COMPRA ===');
      console.log('Usuario actual:', user);
      console.log('Evento actual:', evento);
      console.log('Cantidad de boletos:', cantidadBoletos);
      console.log('Números de asientos:', numerosAsientos);
      console.log('Método de pago:', metodoPago);
      console.log('Cálculos - Subtotal:', totales.subtotal, 'IVA:', totales.iva, 'Total:', totales.total);
      console.log('Cédula del usuario:', user.cedula, 'Longitud:', user.cedula?.length);
      console.log('=========================');
      
      // Crear un ticket por cada boleto
      const ticketsCreados = [];
      
      for (let i = 0; i < cantidadBoletos; i++) {
        const ivaPorBoleto = parseFloat((totales.iva / cantidadBoletos).toFixed(2));
        const totalPorBoleto = parseFloat((totales.precioUnitario + ivaPorBoleto).toFixed(2));
        
        // Asegurarse de que todos los valores sean válidos
        const numeroAsiento = numerosAsientos[i] || (Math.floor(Math.random() * 1000) + 1);
        
        const ticketData = {
          cedula: String(user.cedula).trim(), // Asegurar que sea string y sin espacios
          fechaEmision: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
          idEvento: parseInt(id),
          iva: Math.max(0, ivaPorBoleto), // Asegurar que no sea negativo
          metodoPago: String(metodoPago).trim(),
          numeroAsiento: parseInt(numeroAsiento),
          precioUnitarioTicket: Math.max(0.01, parseFloat(totales.precioUnitario.toFixed(2))),
          subtotal: Math.max(0.01, parseFloat(totales.precioUnitario.toFixed(2))),
          total: Math.max(0.01, totalPorBoleto)
        };

        console.log(`Creando ticket ${i + 1}:`, ticketData);
        console.log('Validaciones - Todos los campos requeridos:');
        console.log('  - cedula (string, 10 chars):', typeof ticketData.cedula, ticketData.cedula.length);
        console.log('  - fechaEmision (string, formato ISO):', typeof ticketData.fechaEmision, ticketData.fechaEmision);
        console.log('  - idEvento (number):', typeof ticketData.idEvento, ticketData.idEvento);
        console.log('  - numeroAsiento (number):', typeof ticketData.numeroAsiento, ticketData.numeroAsiento);
        console.log('  - metodoPago (string):', typeof ticketData.metodoPago, ticketData.metodoPago);
        console.log('  - precioUnitarioTicket (number > 0):', typeof ticketData.precioUnitarioTicket, ticketData.precioUnitarioTicket);
        console.log('  - subtotal (number > 0):', typeof ticketData.subtotal, ticketData.subtotal);
        console.log('  - iva (number >= 0):', typeof ticketData.iva, ticketData.iva);
        console.log('  - total (number > 0):', typeof ticketData.total, ticketData.total);
        
        const response = await ticketsAPI.createTicket(ticketData);
        console.log(`Respuesta del ticket ${i + 1}:`, response);
        
        if (response && (response.mensaje || response.id || response.respuesta)) {
          ticketsCreados.push(response);
        } else {
          throw new Error('Error en la respuesta del servidor al crear ticket');
        }
      }

      console.log('Todos los tickets creados exitosamente:', ticketsCreados);
      setSuccess(true);
      
      // Mostrar mensaje de éxito por 3 segundos y luego redirigir
      setTimeout(() => {
        navigate('/mis-compras');
      }, 3000);

    } catch (error) {
      console.error('Error al comprar boletos:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError('Error al procesar la compra: ' + (error.response?.data?.mensaje || error.message || 'Error desconocido'));
    } finally {
      setLoadingCompra(false);
    }
  };

  const totales = calcularTotales();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white/80">Cargando información del evento...</p>
        </div>
      </div>
    );
  }

  if (error && !evento) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⚠️</div>
          <p className="text-white/80 mb-4">{error}</p>
          <Link 
            to={`/evento/${id}`}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-6 py-2 rounded-lg transition-all duration-200"
          >
            Volver al Evento
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-400 text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-white mb-4">¡Compra Exitosa!</h2>
          <p className="text-white/80 mb-2">Se han creado {cantidadBoletos} boleto(s) para:</p>
          <p className="text-cyan-400 font-semibold text-xl mb-4">{evento?.nombre}</p>
          <p className="text-white/60 mb-6">Redirigiendo a tus compras...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link 
            to={`/evento/${id}`}
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al evento
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Comprar Boletos
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Información del evento */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Información del Evento</h2>
            
            {evento && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-cyan-400">{evento.nombre}</h3>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4 text-white/80">
                  <div>
                    <span className="block text-white/60 text-sm">Fecha</span>
                    <span className="font-medium">
                      {new Date(evento.fecha).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div>
                    <span className="block text-white/60 text-sm">Hora</span>
                    <span className="font-medium">{evento.hora}</span>
                  </div>
                  
                  <div>
                    <span className="block text-white/60 text-sm">Lugar</span>
                    <span className="font-medium">{evento.establecimiento}</span>
                  </div>
                  
                  <div>
                    <span className="block text-white/60 text-sm">Precio por boleto</span>
                    <span className="font-medium text-green-400">${evento.precio}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Formulario de compra */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Detalles de la Compra</h2>
            
            <div className="space-y-6">
              
              {/* Cantidad de boletos */}
              <div>
                <label className="block text-white/80 font-medium mb-2">
                  Cantidad de Boletos
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setCantidadBoletos(Math.max(1, cantidadBoletos - 1))}
                    className="bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold text-white min-w-[3rem] text-center">
                    {cantidadBoletos}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCantidadBoletos(cantidadBoletos + 1)}
                    className="bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Método de pago */}
              <div>
                <label className="block text-white/80 font-medium mb-2">
                  Método de Pago
                </label>
                <select 
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent [&>option]:bg-slate-800 [&>option]:text-white [&>option]:py-2"
                  style={{
                    colorScheme: 'dark',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                >
                  <option value="TARJETA_CREDITO" className="bg-slate-800 text-white">Tarjeta de Crédito</option>
                  <option value="TARJETA_DEBITO" className="bg-slate-800 text-white">Tarjeta de Débito</option>
                  <option value="TRANSFERENCIA" className="bg-slate-800 text-white">Transferencia Bancaria</option>
                  <option value="EFECTIVO" className="bg-slate-800 text-white">Efectivo</option>
                </select>
              </div>

              {/* Números de asientos asignados */}
              <div>
                <label className="block text-white/80 font-medium mb-2">
                  Asientos Asignados
                </label>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex flex-wrap gap-2">
                    {numerosAsientos.map((asiento, index) => (
                      <span 
                        key={index}
                        className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-lg text-sm font-medium"
                      >
                        Asiento {asiento}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resumen de precios */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">Resumen de Compra</h3>
                <div className="space-y-2 text-white/80">
                  <div className="flex justify-between">
                    <span>Cantidad de boletos:</span>
                    <span className="font-medium">{cantidadBoletos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Precio unitario:</span>
                    <span className="font-medium">${totales.precioUnitario?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">${totales.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (19%):</span>
                    <span className="font-medium">${totales.iva?.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-white/20 pt-2 mt-2">
                    <div className="flex justify-between text-xl font-bold text-green-400">
                      <span>Total:</span>
                      <span>${totales.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de compra */}
              <button
                onClick={handleComprarBoletos}
                disabled={loadingCompra || !evento}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                  loadingCompra 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg hover:shadow-green-500/25'
                } text-white`}
              >
                {loadingCompra ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                    Procesando compra...
                  </div>
                ) : (
                  `🎫 Comprar ${cantidadBoletos} Boleto${cantidadBoletos > 1 ? 's' : ''} - $${totales.total?.toFixed(2)}`
                )}
              </button>

              {/* Mostrar errores */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprarBoletos;

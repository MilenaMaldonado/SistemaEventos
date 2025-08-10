import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventosAPI } from '../api/eventosAPI';
import { asientosAPI, ticketsAPI } from '../api/ticketsAPI';
import AsientoSelector from '../components/AsientoSelector';
import useAuth from '../hooks/useAuth';
import './EventoDetalle.css';

const EventoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isCliente } = useAuth();
  
  const [evento, setEvento] = useState(null);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState([]);
  const [asientosInfo, setAsientosInfo] = useState({
    disponibles: 0,
    vendidos: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [loadingCompra, setLoadingCompra] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Verificar autenticación y rol al montar el componente
  useEffect(() => {
    if (!isAuthenticated) {
      // Si no está autenticado, redirigir al login
      navigate('/login', { 
        state: { from: `/evento-detalle/${id}` } 
      });
      return;
    }
    
    if (isAdmin) {
      // Si es administrador, mostrar mensaje y redirigir al dashboard
      alert('Como administrador, debes acceder al panel de administración.');
      navigate('/admin-dashboard');
      return;
    }
    
    if (isCliente && id) {
      // Solo los clientes pueden ver detalles del evento
      cargarEvento();
      cargarInfoAsientos();
    }
  }, [id, isAuthenticated, isAdmin, isCliente, navigate]);

  const cargarEvento = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Cargando evento con ID:', id);
      
      // Usar el microservicio de eventos para obtener la información del evento
      const response = await eventosAPI.getById(id);
      
      console.log('Respuesta del API:', response);
      
      if (response && response.respuesta) {
        console.log('Evento cargado exitosamente:', response.respuesta);
        setEvento(response.respuesta);
      } else {
        console.log('Error en la respuesta:', response);
        setError(`No se pudo cargar el evento. Respuesta: ${JSON.stringify(response)}`);
      }
    } catch (error) {
      console.error('Error loading event:', error);
      setError('Error al cargar el evento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarInfoAsientos = async () => {
    try {
      const [disponiblesRes, vendidosRes, asientosRes] = await Promise.all([
        asientosAPI.getAsientosDisponibles(id),
        asientosAPI.getAsientosVendidos(id),
        asientosAPI.getAsientosPorEvento(id)
      ]);

      const disponibles = disponiblesRes && disponiblesRes.respuesta ? disponiblesRes.respuesta : 0;
      const vendidos = vendidosRes && vendidosRes.respuesta ? vendidosRes.respuesta : 0;
      const total = asientosRes && asientosRes.respuesta ? asientosRes.respuesta.length : 0;

      setAsientosInfo({
        disponibles,
        vendidos,
        total
      });
    } catch (error) {
      console.error('Error loading seats info:', error);
    }
  };

  const handleAsientosSeleccionados = (asientos) => {
    setAsientosSeleccionados(asientos);
    setSuccessMessage(''); // Limpiar mensaje de éxito previo
    setError(null); // Limpiar errores previos
  };

  const handleComprarAsientos = async () => {
    if (!user) {
      setError('Debe iniciar sesión para comprar tickets');
      navigate('/login', { state: { from: `/evento/${id}` } });
      return;
    }

    if (asientosSeleccionados.length === 0) {
      setError('Debe seleccionar al menos un asiento');
      return;
    }

    try {
      setLoadingCompra(true);
      setError(null);
      setSuccessMessage('');

      const precioUnitario = evento?.precio ? parseFloat(evento.precio) : 50.0;
      
      if (asientosSeleccionados.length === 1) {
        // Compra individual
        const compraData = {
          idEvento: parseInt(id),
          numeroAsiento: asientosSeleccionados[0],
          cedulaCliente: user.cedula,
          precio: precioUnitario
        };

        const response = await asientosAPI.comprarAsiento(compraData);
        
        if (response && response.mensaje) {
          setSuccessMessage(`¡Asiento ${asientosSeleccionados[0]} comprado exitosamente!`);
          setAsientosSeleccionados([]);
          await cargarInfoAsientos();
        } else {
          setError(response?.mensaje || 'Error al comprar el asiento');
        }
      } else {
        // Compra múltiple
        const compraData = {
          idEvento: parseInt(id),
          numerosAsientos: asientosSeleccionados,
          cedulaCliente: user.cedula,
          precioUnitario: precioUnitario
        };

        const response = await asientosAPI.comprarMultiplesAsientos(compraData);
        
        if (response && response.mensaje) {
          setSuccessMessage(`¡${asientosSeleccionados.length} asientos comprados exitosamente!`);
          setAsientosSeleccionados([]);
          await cargarInfoAsientos();
          
          // También crear tickets individuales
          try {
            const ticketResponse = await ticketsAPI.compraMultiple(compraData);
            if (!ticketResponse.mensaje) {
              console.warn('Warning: Seats purchased but tickets creation failed');
            }
          } catch (ticketError) {
            console.error('Error creating tickets:', ticketError);
          }
        } else {
          setError(response?.mensaje || 'Error al comprar los asientos');
        }
      }
    } catch (error) {
      console.error('Error purchasing seats:', error);
      setError('Error al procesar la compra: ' + error.message);
    } finally {
      setLoadingCompra(false);
    }
  };

  const calcularTotal = () => {
    // Convertir precio a número si es string o usar valor por defecto
    const precioEvento = evento?.precio ? parseFloat(evento.precio) : 50.0;
    const subtotal = asientosSeleccionados.length * precioEvento;
    const iva = subtotal * 0.19; // IVA del 19%
    const total = subtotal + iva;
    
    return {
      subtotal,
      iva,
      total,
      precio: precioEvento
    };
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="evento-detalle-container">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (error && !evento) {
    return (
      <div className="evento-detalle-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn-volver">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="evento-detalle-container">
        <div className="error-message">
          <h2>Evento no encontrado</h2>
          <button onClick={() => navigate('/')} className="btn-volver">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const totales = calcularTotal();

  return (
    <div className="evento-detalle-container">
      <div className="evento-header">
        <button onClick={() => navigate('/')} className="btn-volver">
          ← Volver
        </button>
        <h1>{evento.nombre}</h1>
      </div>

      <div className="evento-content">
        <div className="evento-info">
          <div className="evento-card">
            {evento.imagenUrl && (
              <div className="evento-imagen">
                <img src={evento.imagenUrl} alt={evento.nombre} />
              </div>
            )}
            
            <div className="evento-detalles">
              <h2>{evento.nombre}</h2>
              <p className="evento-descripcion">{evento.descripcion}</p>
              
              <div className="evento-metadata">
                <div className="metadata-item">
                  <strong>📅 Fecha:</strong>
                  <span>{formatearFecha(evento.fechaHora || evento.fecha)}</span>
                </div>
                
                <div className="metadata-item">
                  <strong>📍 Ubicación:</strong>
                  <span>{evento.ubicacion || evento.establecimiento}</span>
                </div>
                
                
                <div className="metadata-item">
                  <strong>💰 Precio:</strong>
                  <span>${(evento.precio || 50.0).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="asientos-estadisticas">
                <div className="estadistica">
                  <span className="numero">{asientosInfo.disponibles}</span>
                  <span className="etiqueta">Disponibles</span>
                </div>
                <div className="estadistica">
                  <span className="numero">{asientosInfo.vendidos}</span>
                  <span className="etiqueta">Vendidos</span>
                </div>
                <div className="estadistica">
                  <span className="numero">{asientosInfo.total}</span>
                  <span className="etiqueta">Total</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="seleccion-asientos">
          <AsientoSelector
            idEvento={id}
            onAsientosSeleccionados={handleAsientosSeleccionados}
            precioUnitario={evento?.precio ? parseFloat(evento.precio) : 50.0}
          />
          
          {asientosSeleccionados.length > 0 && (
            <div className="compra-panel">
              <div className="compra-resumen">
                <h3>Resumen de compra</h3>
                <div className="resumen-linea">
                  <span>Asientos seleccionados:</span>
                  <span>{asientosSeleccionados.join(', ')}</span>
                </div>
                <div className="resumen-linea">
                  <span>Cantidad:</span>
                  <span>{asientosSeleccionados.length}</span>
                </div>
                <div className="resumen-linea">
                  <span>Precio unitario:</span>
                  <span>${totales.precio.toFixed(2)}</span>
                </div>
                <div className="resumen-linea">
                  <span>Subtotal:</span>
                  <span>${totales.subtotal.toFixed(2)}</span>
                </div>
                <div className="resumen-linea">
                  <span>IVA (19%):</span>
                  <span>${totales.iva.toFixed(2)}</span>
                </div>
                <div className="resumen-linea total">
                  <span><strong>Total:</strong></span>
                  <span><strong>${totales.total.toFixed(2)}</strong></span>
                </div>
              </div>
              
              <button
                onClick={handleComprarAsientos}
                disabled={loadingCompra || asientosSeleccionados.length === 0}
                className="btn-comprar"
              >
                {loadingCompra ? 'Procesando...' : `Comprar ${asientosSeleccionados.length} asiento${asientosSeleccionados.length > 1 ? 's' : ''}`}
              </button>
            </div>
          )}
          
          {!user && (
            <div className="login-prompt">
              <p>Para seleccionar y comprar asientos, debe iniciar sesión</p>
              <button
                onClick={() => navigate('/login', { state: { from: `/evento/${id}` } })}
                className="btn-login"
              >
                Iniciar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="alert alert-success">
          <p>{successMessage}</p>
        </div>
      )}
    </div>
  );
};

export default EventoDetalle;
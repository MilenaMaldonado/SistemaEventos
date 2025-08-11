import React, { useState, useEffect, useCallback } from 'react';
import { asientosAPI, ticketsAPI } from '../api/ticketsAPI';
import { useAuth } from '../contexts/AuthContext';
import './AsientoSelector.css';

const ESTADOS_ASIENTO = {
  DISPONIBLE: 'DISPONIBLE',
  SELECCIONADO: 'SELECCIONADO',
  RESERVADO: 'RESERVADO',
  VENDIDO: 'VENDIDO'
};

const AsientoSelector = ({ idEvento, onAsientosSeleccionados, precioUnitario = 50.0 }) => {
  const [asientos, setAsientos] = useState([]);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState([]);
  const [eventoCapacidad, setEventoCapacidad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

 


  // Cargar capacidad del evento y generar asientos si es necesario
  const cargarAsientos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let capacidad = null;
      let eventoResponse = null;
      
      try {
        // Intentar obtener la capacidad del evento
        console.log('Obteniendo capacidad del evento:', idEvento);
        eventoResponse = await ticketsAPI.getEventoDisponibleById(idEvento);
        
        if (eventoResponse && eventoResponse.respuesta && eventoResponse.respuesta.capacidad) {
          capacidad = eventoResponse.respuesta.capacidad;
          console.log('Capacidad del evento desde API:', capacidad);
        } else {
          console.warn('Evento no encontrado en eventos_disponible, creando entrada con capacidad 20');
          // Si el evento no existe en eventos_disponible, crearlo con capacidad 20
          if (idEvento === '1' || idEvento === 1) {
            // Para evento 1, crear entrada con capacidad 20
            try {
              const createResponse = await ticketsAPI.createEventoDisponible({
                idEvento: parseInt(idEvento),
                capacidad: 20
              });
              if (createResponse && createResponse.respuesta) {
                capacidad = 20;
                console.log('Evento creado en eventos_disponible con capacidad 20');
              }
            } catch (createError) {
              console.warn('Error creando evento en eventos_disponible:', createError.message);
            }
          }
        }
      } catch (eventError) {
        console.warn('Error al obtener capacidad del evento:', eventError.message);
      }
      
      // Si no se pudo obtener la capacidad del evento, usar capacidades específicas por evento
      if (!capacidad) {
        // Capacidades específicas por evento
        const capacidadesPorEvento = {
          '1': 20,
          '2': 30,
          '3': 25
        };
        capacidad = capacidadesPorEvento[String(idEvento)] || 20;
        console.warn(`No se pudo obtener capacidad del evento ${idEvento}, usando valor por defecto: ${capacidad} asientos`);
      }
      
      setEventoCapacidad(capacidad);
      
      // Obtener los asientos existentes (puede que ya los hayamos obtenido en el fallback)
      let asientosResponse;
      if (capacidad === 50 && !eventoResponse) {
        // Si usamos capacidad por defecto y no hay evento_disponible, ya obtuvimos los asientos
        asientosResponse = await asientosAPI.getAsientosPorEvento(idEvento);
      } else {
        // Obtener asientos normalmente
        asientosResponse = await asientosAPI.getAsientosPorEvento(idEvento);
      }
      
      console.log('Respuesta asientos:', asientosResponse);
      
      if (asientosResponse && asientosResponse.respuesta && asientosResponse.respuesta.length > 0) {
        // Si hay asientos, solo usar los que corresponden a la capacidad actual
        const asientosExistentes = asientosResponse.respuesta;
        
        if (asientosExistentes.length > capacidad) {
          // Si hay más asientos que la capacidad, limpiar excedentes y mostrar solo los correctos
          console.warn(`Hay ${asientosExistentes.length} asientos pero capacidad es ${capacidad}. Limpiando excedentes...`);
          
          try {
            await asientosAPI.limpiarAsientosExcedentes(idEvento, capacidad);
            console.log('Asientos excedentes eliminados');
          } catch (cleanupError) {
            console.warn('Error al limpiar asientos excedentes:', cleanupError.message);
          }
          
          const asientosFiltrados = asientosExistentes
            .filter(asiento => asiento.numeroAsiento <= capacidad)
            .sort((a, b) => a.numeroAsiento - b.numeroAsiento);
          setAsientos(asientosFiltrados);
        } else if (asientosExistentes.length < capacidad) {
          // Si hay menos asientos que la capacidad, generar los faltantes
          console.log(`Generando asientos faltantes. Existentes: ${asientosExistentes.length}, Necesarios: ${capacidad}`);
          await asientosAPI.generarAsientos(idEvento, capacidad, precioUnitario);
          const nuevosAsientosResponse = await asientosAPI.getAsientosPorEvento(idEvento);
          if (nuevosAsientosResponse && nuevosAsientosResponse.respuesta) {
            const asientosFiltrados = nuevosAsientosResponse.respuesta
              .filter(asiento => asiento.numeroAsiento <= capacidad)
              .sort((a, b) => a.numeroAsiento - b.numeroAsiento);
            setAsientos(asientosFiltrados);
          }
        } else {
          // Cantidad exacta, usar todos
          setAsientos(asientosExistentes.sort((a, b) => a.numeroAsiento - b.numeroAsiento));
        }
      } else {
        // No hay asientos, generarlos basándose en la capacidad
        console.log('Generando asientos para el evento...');
        await asientosAPI.generarAsientos(idEvento, capacidad, precioUnitario);
        
        // Cargar los asientos recién generados
        const nuevosAsientosResponse = await asientosAPI.getAsientosPorEvento(idEvento);
        if (nuevosAsientosResponse && nuevosAsientosResponse.respuesta) {
          const asientosFiltrados = nuevosAsientosResponse.respuesta
            .filter(asiento => asiento.numeroAsiento <= capacidad)
            .sort((a, b) => a.numeroAsiento - b.numeroAsiento);
          setAsientos(asientosFiltrados);
        } else {
          setError('No se pudieron generar los asientos');
        }
      }
    } catch (error) {
      console.error('Error loading seats:', error);
      setError('Error al cargar los asientos: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [idEvento, precioUnitario]);

  // Cargar asientos al montar el componente o cambiar el evento
  useEffect(() => {
    if (idEvento) {
      cargarAsientos();
    }
  }, [idEvento, cargarAsientos]);

  // Notificar cambios en la selección al componente padre
  useEffect(() => {
    if (onAsientosSeleccionados) {
      onAsientosSeleccionados(asientosSeleccionados);
    }
  }, [asientosSeleccionados, onAsientosSeleccionados]);

  // Limpiar selección cuando cambia el usuario
  useEffect(() => {
    setAsientosSeleccionados([]);
  }, [user?.cedula]);

  const toggleSeleccionAsiento = async (asiento) => {
    if (!user) {
      setError('Debe iniciar sesión para seleccionar asientos');
      return;
    }

    if (asiento.estado === ESTADOS_ASIENTO.VENDIDO) {
      setError('Este asiento ya ha sido vendido');
      return;
    }

    try {
      const reservaData = {
        idEvento: parseInt(idEvento),
        numeroAsiento: asiento.numeroAsiento,
        cedulaCliente: user.cedula,
        precio: precioUnitario
      };

      if (asiento.estado === ESTADOS_ASIENTO.DISPONIBLE) {
        // Seleccionar asiento
        const response = await asientosAPI.seleccionarAsiento(reservaData);
        
        if (response && response.mensaje) {
          // También enviar via WebSocket para notificación en tiempo real

          
          // Actualizar estado local inmediatamente
          setAsientos(prevAsientos => 
            prevAsientos.map(a => 
              a.numeroAsiento === asiento.numeroAsiento
                ? { ...a, estado: ESTADOS_ASIENTO.SELECCIONADO, cedulaCliente: user.cedula }
                : a
            )
          );
          
          setAsientosSeleccionados(prev => [...prev, asiento.numeroAsiento]);
          setError(null);
        } else {
          setError(response?.mensaje || 'No se pudo seleccionar el asiento');
        }
      } else if (asiento.estado === ESTADOS_ASIENTO.SELECCIONADO && asiento.cedulaCliente === user.cedula) {
        // Deseleccionar asiento (solo si es del usuario actual)
        const response = await asientosAPI.deseleccionarAsiento(idEvento, asiento.numeroAsiento);
        
        if (response && response.mensaje) {
          // También enviar via WebSocket
  
          // Actualizar estado local
          setAsientos(prevAsientos => 
            prevAsientos.map(a => 
              a.numeroAsiento === asiento.numeroAsiento
                ? { ...a, estado: ESTADOS_ASIENTO.DISPONIBLE, cedulaCliente: null }
                : a
            )
          );
          
          setAsientosSeleccionados(prev => prev.filter(num => num !== asiento.numeroAsiento));
          setError(null);
        } else {
          setError(response?.mensaje || 'No se pudo deseleccionar el asiento');
        }
      }
    } catch (error) {
      console.error('Error toggling seat selection:', error);
      setError('Error al cambiar selección: ' + error.message);
    }
  };

  const getAsientoClassName = (asiento) => {
    const baseClass = 'asiento';
    
    switch (asiento.estado) {
      case ESTADOS_ASIENTO.DISPONIBLE:
        return `${baseClass} disponible`;
      case ESTADOS_ASIENTO.SELECCIONADO:
        return `${baseClass} ${asiento.cedulaCliente === user?.cedula ? 'seleccionado-propio' : 'seleccionado-otro'}`;
      case ESTADOS_ASIENTO.RESERVADO:
        return `${baseClass} reservado`;
      case ESTADOS_ASIENTO.VENDIDO:
        return `${baseClass} vendido`;
      default:
        return baseClass;
    }
  };

  const getAsientoTitulo = (asiento) => {
    switch (asiento.estado) {
      case ESTADOS_ASIENTO.DISPONIBLE:
        return 'Click para seleccionar';
      case ESTADOS_ASIENTO.SELECCIONADO:
        return asiento.cedulaCliente === user?.cedula 
          ? 'Seleccionado por ti - Click para deseleccionar'
          : `Seleccionado por otro usuario`;
      case ESTADOS_ASIENTO.RESERVADO:
        return 'Asiento reservado';
      case ESTADOS_ASIENTO.VENDIDO:
        return 'Asiento vendido';
      default:
        return 'Asiento';
    }
  };

  const calcularTotal = () => {
    return asientosSeleccionados.length * precioUnitario;
  };

  const comprarAsientosSeleccionados = async () => {
    if (!user) {
      setError('Debe iniciar sesión para comprar asientos');
      return;
    }

    if (asientosSeleccionados.length === 0) {
      setError('Debe seleccionar al menos un asiento para comprar');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Datos para la compra múltiple
      const compraData = {
        idEvento: parseInt(idEvento),
        numerosAsientos: asientosSeleccionados,
        cedulaCliente: user.cedula,
        precio: precioUnitario
      };

      console.log('Realizando compra:', compraData);

      // Realizar compra via API REST
      const response = await asientosAPI.comprarMultiplesAsientos(compraData);
      
      if (response && response.mensaje) {
   
        // Limpiar selección después de compra exitosa
        setAsientosSeleccionados([]);
        
        // Recargar asientos para obtener el estado actualizado
        await cargarAsientos();
        
        alert(`¡Compra exitosa! ${asientosSeleccionados.length} asientos comprados.`);
      } else {
        setError(response?.mensaje || 'No se pudo completar la compra');
      }
    } catch (error) {
      console.error('Error en compra:', error);
      setError('Error al realizar la compra: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const organizarAsientosPorFilas = (asientos) => {
    if (!asientos || asientos.length === 0) return [];
    
    // Usar la capacidad del evento (si está disponible) o la longitud del array
    const totalAsientos = eventoCapacidad || asientos.length;
    let asientosPorFila;
    
    if (totalAsientos <= 20) {
      asientosPorFila = 5; // Eventos pequeños: 4 filas de 5
    } else if (totalAsientos <= 50) {
      asientosPorFila = 10; // Eventos medianos: 5 filas de 10
    } else if (totalAsientos <= 100) {
      asientosPorFila = 15; // Eventos grandes: ~7 filas de 15
    } else {
      asientosPorFila = 20; // Eventos muy grandes: ~filas de 20
    }
    
    const filas = [];
    const asientosOrdenados = [...asientos].sort((a, b) => a.numeroAsiento - b.numeroAsiento);
    
    for (let i = 0; i < asientosOrdenados.length; i += asientosPorFila) {
      filas.push(asientosOrdenados.slice(i, i + asientosPorFila));
    }
    
    return filas;
  };

  if (loading) {
    return (
      <div className="asiento-selector-container">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Cargando asientos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="asiento-selector-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={cargarAsientos} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="asiento-selector-container">
      <div className="asientos-header">
        <div>
          <h3>Selecciona tus asientos</h3>
          {eventoCapacidad && (
            <p className="capacidad-info">
              Capacidad total: {eventoCapacidad} asientos
              {eventoCapacidad === 50 ? ' (capacidad estimada)' : ''}
            </p>
          )}
        </div>
      </div>

      <div className="asientos-leyenda">
        <div className="leyenda-item">
          <div className="asiento disponible"></div>
          <span>Disponible</span>
        </div>
        <div className="leyenda-item">
          <div className="asiento seleccionado-propio"></div>
          <span>Tu selección</span>
        </div>
        <div className="leyenda-item">
          <div className="asiento seleccionado-otro"></div>
          <span>Seleccionado</span>
        </div>
        <div className="leyenda-item">
          <div className="asiento vendido"></div>
          <span>Vendido</span>
        </div>
      </div>

      <div className="venue-container">
        <div className="escenario">
          <span>🎭 ESCENARIO</span>
        </div>
        <div className="asientos-venue">
          {organizarAsientosPorFilas(asientos).map((fila, filaIndex) => (
            <div key={filaIndex} className="fila-asientos">
              <div className="fila-label">
                Fila {String.fromCharCode(65 + filaIndex)}
              </div>
              <div className="asientos-fila">
                {fila.map((asiento) => (
                  <button
                    key={asiento.numeroAsiento}
                    className={getAsientoClassName(asiento)}
                    title={getAsientoTitulo(asiento)}
                    onClick={() => toggleSeleccionAsiento(asiento)}
                    disabled={
                      asiento.estado === ESTADOS_ASIENTO.VENDIDO ||
                      (asiento.estado === ESTADOS_ASIENTO.SELECCIONADO && asiento.cedulaCliente !== user?.cedula)
                    }
                  >
                    {asiento.numeroAsiento}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {asientosSeleccionados.length > 0 && (
        <div className="seleccion-resumen">
          <h4>Resumen de selección</h4>
          <div className="resumen-detalle">
            <p><strong>Asientos seleccionados:</strong> {asientosSeleccionados.join(', ')}</p>
            <p><strong>Cantidad:</strong> {asientosSeleccionados.length}</p>
            <p><strong>Precio unitario:</strong> ${precioUnitario.toFixed(2)}</p>
            <p><strong>Total:</strong> ${calcularTotal().toFixed(2)}</p>
          </div>
          <div className="compra-actions">
            <button 
              className="btn-comprar"
              onClick={comprarAsientosSeleccionados}
              disabled={loading || !user}
              title={!user ? 'Debe iniciar sesión para comprar' : 'Comprar asientos seleccionados'}
            >
              {loading ? 'Procesando...' : `Comprar ${asientosSeleccionados.length} asiento${asientosSeleccionados.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsientoSelector;
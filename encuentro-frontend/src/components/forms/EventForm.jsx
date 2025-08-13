import React, { useState, useEffect } from 'react';
import eventosAPI from '../../api/eventosAPI';

export default function EventForm({ event = null, onSubmit, onCancel, loading = false }) {
  const [formData, setFormData] = useState({
    nombre: '',
    fecha: '',
    hora: '',
    idCiudad: '',
    establecimiento: '',
    capacidad: '',
    precio: '',
    imagenUrl: ''
  });

  const [ciudades, setCiudades] = useState([]);
  const [loadingCiudades, setLoadingCiudades] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCiudades();
  }, []);

  useEffect(() => {
    if (event) {
      console.log('🎯 EventForm: Evento recibido para editar:', event);
      console.log('🎯 EventForm: ID del evento (idEvento):', event.idEvento || event.id || event._id, 'Tipo:', typeof (event.idEvento || event.id || event._id));
      
      // Normalizar el evento para tener un id consistente
      const normalizedEvent = {
        ...event,
        id: event.idEvento || event.id || event._id
      };
      
      const mappedData = {
        nombre: normalizedEvent.nombre || normalizedEvent.titulo || '',
        fecha: normalizedEvent.fecha ? normalizedEvent.fecha.split('T')[0] : '',
        hora: normalizedEvent.hora || (normalizedEvent.fecha ? normalizedEvent.fecha.split('T')[1]?.substring(0, 5) : ''),
        idCiudad: normalizedEvent.idCiudad || normalizedEvent.ciudad?.id || (typeof normalizedEvent.ciudad === 'string' ? normalizedEvent.ciudad : '') || '',
        establecimiento: normalizedEvent.establecimiento || normalizedEvent.lugar || '',
        capacidad: normalizedEvent.capacidad || normalizedEvent.cupos || '',
        precio: normalizedEvent.precio || '',
        imagenUrl: normalizedEvent.imagenUrl || normalizedEvent.imagen || ''
      };
      
      console.log('🎯 EventForm: Datos mapeados para el formulario:', mappedData);
      setFormData(mappedData);
    }
  }, [event]);

  const loadCiudades = async () => {
    setLoadingCiudades(true);
    console.log('🏙️ EventForm: Cargando ciudades...');
    
    try {
      const response = await eventosAPI.getCiudades();
      console.log('🏙️ EventForm: Respuesta ciudades:', response);
      
      // Extraer datos según la estructura del backend
      const payload = response?.data || response;
      const ciudadesList = payload?.respuesta || payload?.data || payload;
      
      console.log('🏙️ EventForm: Lista extraída:', ciudadesList);
      
      // Ya no necesitamos mapear IDs porque vienen del backend
      const ciudadesArray = Array.isArray(ciudadesList) ? ciudadesList : [];
      
      console.log('✅ EventForm: Ciudades procesadas:', ciudadesArray);
      setCiudades(ciudadesArray);
    } catch (error) {
      console.error('❌ EventForm: Error cargando ciudades:', error);
      setCiudades([]);
    } finally {
      setLoadingCiudades(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre del evento es requerido';
    if (!formData.fecha) newErrors.fecha = 'La fecha es requerida';
    if (!formData.hora) newErrors.hora = 'La hora es requerida';
    if (!formData.idCiudad || formData.idCiudad === '') newErrors.idCiudad = 'La ciudad es requerida';
    if (!formData.establecimiento?.trim()) newErrors.establecimiento = 'El establecimiento es requerido';
    if (!formData.imagenUrl?.trim()) newErrors.imagenUrl = 'La URL de la imagen es requerida';
    if (!formData.capacidad || parseInt(formData.capacidad) <= 0) newErrors.capacidad = 'La capacidad debe ser mayor a 0';
    if (formData.precio && parseFloat(formData.precio) < 0) newErrors.precio = 'El precio no puede ser negativo';
    
    // Validar que la fecha no sea anterior a hoy
    if (formData.fecha) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventDate = new Date(formData.fecha);
      if (eventDate < today) {
        newErrors.fecha = 'La fecha del evento no puede ser anterior a hoy';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('📝 EventForm: FormData antes de enviar:', formData);
      
      const eventData = {
        nombre: formData.nombre.trim(),
        fecha: formData.fecha,
        hora: formData.hora,
        idCiudad: formData.idCiudad && formData.idCiudad !== '' ? Number(formData.idCiudad) : null,
        establecimiento: formData.establecimiento.trim(),
        capacidad: formData.capacidad ? parseInt(formData.capacidad, 10) : undefined,
        precio: formData.precio !== '' ? parseFloat(formData.precio) : undefined,
        imagenUrl: formData.imagenUrl.trim()
      };
      
      console.log('🚀 EventForm: Datos enviados al servidor:', eventData);
      onSubmit(eventData);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCrearCiudad = async () => {
    const nombreCiudad = window.prompt('Nombre de la nueva ciudad:');
    if (!nombreCiudad?.trim()) return;
    
    try {
      await eventosAPI.createCiudad({ nombre: nombreCiudad.trim() });
      await loadCiudades();
      alert('Ciudad creada exitosamente. Selecciónala en el listado.');
    } catch (error) {
      console.error('Error al crear ciudad:', error);
      alert('Error al crear ciudad: ' + (error?.message || 'Error desconocido'));
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">
        {event ? 'Editar Evento' : 'Crear Nuevo Evento'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white/90 border-b border-white/10 pb-2">Información Básica</h4>
          
          <div>
            <label className="block text-white/70 text-sm mb-1">Nombre del Evento *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`w-full bg-white/10 border ${errors.nombre ? 'border-red-400' : 'border-white/10'} rounded-lg px-3 py-2 text-white placeholder-white/30`}
              placeholder="Ingrese el nombre del evento"
            />
            {errors.nombre && <span className="text-red-400 text-xs">{errors.nombre}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 text-sm mb-1">Fecha *</label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className={`w-full bg-white/10 border ${errors.fecha ? 'border-red-400' : 'border-white/10'} rounded-lg px-3 py-2 text-white`}
              />
              {errors.fecha && <span className="text-red-400 text-xs">{errors.fecha}</span>}
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-1">Hora *</label>
              <input
                type="time"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                className={`w-full bg-white/10 border ${errors.hora ? 'border-red-400' : 'border-white/10'} rounded-lg px-3 py-2 text-white`}
              />
              {errors.hora && <span className="text-red-400 text-xs">{errors.hora}</span>}
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white/90 border-b border-white/10 pb-2">Ubicación</h4>

          <div>
            <label className="block text-white/70 text-sm mb-1">Ciudad *</label>
            <div className="flex space-x-2">
              <select
                name="idCiudad"
                value={formData.idCiudad}
                onChange={handleChange}
                className={`flex-1 bg-white/10 border ${errors.idCiudad ? 'border-red-400' : 'border-white/10'} rounded-lg px-3 py-2 text-white`}
              >
                <option value="">Seleccione una ciudad</option>
                {ciudades.map((ciudad) => (
                  <option key={ciudad.id} value={ciudad.id}>
                    {ciudad.nombre}
                  </option>
                ))}
              </select>
             
            </div>
            {errors.idCiudad && <span className="text-red-400 text-xs">{errors.idCiudad}</span>}
            {loadingCiudades && <span className="text-white/50 text-xs">Cargando ciudades...</span>}
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-1">Establecimiento *</label>
            <input
              type="text"
              name="establecimiento"
              value={formData.establecimiento}
              onChange={handleChange}
              className={`w-full bg-white/10 border ${errors.establecimiento ? 'border-red-400' : 'border-white/10'} rounded-lg px-3 py-2 text-white placeholder-white/30`}
              placeholder="Ej. Coliseo Rumiñahui"
            />
            {errors.establecimiento && <span className="text-red-400 text-xs">{errors.establecimiento}</span>}
          </div>
        </div>

        {/* Detalles del evento */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white/90 border-b border-white/10 pb-2">Detalles del Evento</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 text-sm mb-1">Capacidad *</label>
              <input
                type="number"
                name="capacidad"
                value={formData.capacidad}
                onChange={handleChange}
                min="1"
                className={`w-full bg-white/10 border ${errors.capacidad ? 'border-red-400' : 'border-white/10'} rounded-lg px-3 py-2 text-white placeholder-white/30`}
                placeholder="Número de asientos"
              />
              {errors.capacidad && <span className="text-red-400 text-xs">{errors.capacidad}</span>}
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-1">Precio</label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full bg-white/10 border ${errors.precio ? 'border-red-400' : 'border-white/10'} rounded-lg px-3 py-2 text-white placeholder-white/30`}
                placeholder="0.00"
              />
              {errors.precio && <span className="text-red-400 text-xs">{errors.precio}</span>}
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-1">URL de Imagen *</label>
            <input
              type="url"
              name="imagenUrl"
              value={formData.imagenUrl}
              onChange={handleChange}
              className={`w-full bg-white/10 border ${errors.imagenUrl ? 'border-red-400' : 'border-white/10'} rounded-lg px-3 py-2 text-white placeholder-white/30`}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            {errors.imagenUrl && <span className="text-red-400 text-xs">{errors.imagenUrl}</span>}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : (event ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </div>
  );
}

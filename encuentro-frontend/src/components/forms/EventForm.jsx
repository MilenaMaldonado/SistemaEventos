import React, { useState, useEffect } from 'react';
import { eventosAPI } from '../../api';

export default function EventForm({ event = null, onSubmit, onCancel, loading = false }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha: '',
    hora: '',
    ciudad: '',
    direccion: '',
    capacidad: '',
    precio: '',
    categoria: '',
    imagen: '',
    activo: true
  });

  const [ciudades, setCiudades] = useState([]);
  const [loadingCiudades, setLoadingCiudades] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCiudades();
  }, []);

  useEffect(() => {
    if (event) {
      setFormData({
        nombre: event.nombre || event.titulo || '',
        descripcion: event.descripcion || '',
        fecha: event.fecha ? event.fecha.split('T')[0] : '',
        hora: event.hora || event.fecha ? event.fecha.split('T')[1]?.substring(0, 5) : '',
        ciudad: event.ciudad || event.lugar || '',
        direccion: event.direccion || '',
        capacidad: event.capacidad || event.cupos || '',
        precio: event.precio || '',
        categoria: event.categoria || '',
        imagen: event.imagen || '',
        activo: event.activo !== undefined ? event.activo : true
      });
    }
  }, [event]);

  const loadCiudades = async () => {
    setLoadingCiudades(true);
    try {
      const response = await eventosAPI.getCiudades();
      const data = response?.data || response;
      setCiudades(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando ciudades:', error);
    } finally {
      setLoadingCiudades(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre del evento es requerido';
    if (!formData.fecha) newErrors.fecha = 'La fecha es requerida';
    if (!formData.ciudad) newErrors.ciudad = 'La ciudad es requerida';
    if (!formData.capacidad || formData.capacidad <= 0) newErrors.capacidad = 'La capacidad debe ser mayor a 0';
    if (formData.precio && formData.precio < 0) newErrors.precio = 'El precio no puede ser negativo';
    
    // Validar que la fecha no sea anterior a hoy
    if (formData.fecha) {
      const today = new Date();
      const eventDate = new Date(formData.fecha);
      if (eventDate < today.setHours(0, 0, 0, 0)) {
        newErrors.fecha = 'La fecha del evento no puede ser anterior a hoy';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Combinar fecha y hora si ambos están presentes
      let fechaCompleta = formData.fecha;
      if (formData.hora) {
        fechaCompleta = `${formData.fecha}T${formData.hora}:00`;
      }
      
      const eventData = {
        ...formData,
        fecha: fechaCompleta
      };
      
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
    if (!nombreCiudad) return;
    
    try {
      await eventosAPI.createCiudad({ nombre: nombreCiudad });
      await loadCiudades();
      setFormData(prev => ({ ...prev, ciudad: nombreCiudad }));
      alert('Ciudad creada exitosamente');
    } catch (error) {
      alert('Error al crear ciudad: ' + (error?.message || 'Error desconocido'));
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">
        {event ? 'Editar Evento' : 'Crear Nuevo Evento'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div>
            <label className="block text-white/70 text-sm mb-1">Categoría</label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white"
            >
              <option value="">Seleccione...</option>
              <option value="CONCIERTO">Concierto</option>
              <option value="TEATRO">Teatro</option>
              <option value="DEPORTE">Deporte</option>
              <option value="CONFERENCIA">Conferencia</option>
              <option value="EXPOSICION">Exposición</option>
              <option value="FESTIVAL">Festival</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

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
            <label className="block text-white/70 text-sm mb-1">Hora</label>
            <input
              type="time"
              name="hora"
              value={formData.hora}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-1">Ciudad *</label>
            <div className="flex space-x-2">
              <select
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                className={`flex-1 bg-white/10 border ${errors.ciudad ? 'border-red-400' : 'border-white/10'} rounded-lg px-3 py-2 text-white`}
              >
                <option value="">Seleccione una ciudad</option>
                {ciudades.map((ciudad) => (
                  <option key={ciudad.id || ciudad.nombre} value={ciudad.nombre}>
                    {ciudad.nombre}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleCrearCiudad}
                className="px-3 py-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white rounded-lg text-sm"
                title="Crear nueva ciudad"
              >
                +
              </button>
            </div>
            {errors.ciudad && <span className="text-red-400 text-xs">{errors.ciudad}</span>}
            {loadingCiudades && <span className="text-white/50 text-xs">Cargando ciudades...</span>}
          </div>

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

          <div>
            <label className="block text-white/70 text-sm mb-1">Estado</label>
            <div className="flex items-center space-x-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  className="w-4 h-4 text-cyan-500 bg-white/10 border-white/10 rounded focus:ring-cyan-500"
                />
                <span className="ml-2 text-white/70">Evento Activo</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-white/70 text-sm mb-1">Dirección</label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30"
            placeholder="Dirección específica del evento"
          />
        </div>

        <div>
          <label className="block text-white/70 text-sm mb-1">Descripción</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows="4"
            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30"
            placeholder="Descripción detallada del evento"
          />
        </div>

        <div>
          <label className="block text-white/70 text-sm mb-1">URL de Imagen</label>
          <input
            type="url"
            name="imagen"
            value={formData.imagen}
            onChange={handleChange}
            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
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

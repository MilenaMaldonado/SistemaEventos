import React, { useState, useEffect } from 'react';

export default function CityForm({ city = null, onSubmit, onCancel, loading = false }) {
  const [formData, setFormData] = useState({
    nombre: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (city) {
      setFormData({
        nombre: city.nombre || ''
      });
    }
  }, [city]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre de la ciudad es requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
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


  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">
        {city ? 'Editar Ciudad' : 'Crear Nueva Ciudad'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white/70 text-sm mb-1">Nombre de la Ciudad *</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={`w-full bg-white/10 border ${errors.nombre ? 'border-red-400' : 'border-white/10'} rounded-lg px-3 py-2 text-white placeholder-white/30`}
            placeholder="Ingrese el nombre de la ciudad"
          />
          {errors.nombre && <span className="text-red-400 text-xs">{errors.nombre}</span>}
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
            {loading ? 'Guardando...' : (city ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </div>
  );
}
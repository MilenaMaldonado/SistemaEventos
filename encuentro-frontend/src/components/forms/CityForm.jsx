import React, { useState, useEffect } from 'react';

export default function CityForm({ city = null, onSubmit, onCancel, loading = false }) {
  const [formData, setFormData] = useState({
    nombre: '',
    provincia: '',
    pais: 'Ecuador',
    activo: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (city) {
      setFormData({
        nombre: city.nombre || '',
        provincia: city.provincia || '',
        pais: city.pais || 'Ecuador',
        activo: city.activo !== undefined ? city.activo : true
      });
    }
  }, [city]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre de la ciudad es requerido';
    if (!formData.provincia.trim()) newErrors.provincia = 'La provincia es requerida';
    
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

  const provinciasEcuador = [
    'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro',
    'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja', 'Los Ríos',
    'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza', 'Pichincha',
    'Santa Elena', 'Santo Domingo de los Tsáchilas', 'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe'
  ];

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">
        {city ? 'Editar Ciudad' : 'Crear Nueva Ciudad'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div>
            <label className="block text-white/70 text-sm mb-1">Provincia *</label>
            <select
              name="provincia"
              value={formData.provincia}
              onChange={handleChange}
              className={`w-full bg-white/10 border ${errors.provincia ? 'border-red-400' : 'border-white/10'} rounded-lg px-3 py-2 text-white`}
            >
              <option value="">Seleccione una provincia</option>
              {provinciasEcuador.map((provincia) => (
                <option key={provincia} value={provincia}>
                  {provincia}
                </option>
              ))}
            </select>
            {errors.provincia && <span className="text-red-400 text-xs">{errors.provincia}</span>}
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-1">País</label>
            <input
              type="text"
              name="pais"
              value={formData.pais}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white"
              readOnly
            />
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
                <span className="ml-2 text-white/70">Ciudad Activa</span>
              </label>
            </div>
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
            {loading ? 'Guardando...' : (city ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </div>
  );
}
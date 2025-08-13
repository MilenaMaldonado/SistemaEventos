import React, { useState, useEffect } from 'react';

export default function UserForm({ user = null, onSubmit, onCancel, loading = false, serverErrors = null }) {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    cedula: '',
    email: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: '',
    edad: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  
  // Efecto para manejar errores del servidor
  useEffect(() => {
    if (serverErrors) {
      console.log('🔍 UserForm recibió errores del servidor:', serverErrors);
      
      // Mapear errores del servidor al estado de errores local
      const mappedErrors = {};
      
      if (serverErrors.respuesta) {
        // Mapear los nombres de campos del servidor a los nombres locales
        const fieldMapping = {
          'nombre': 'nombres',
          'apellido': 'apellidos',
          'correo': 'email'
        };
        
        Object.entries(serverErrors.respuesta).forEach(([serverField, errorMessage]) => {
          const localField = fieldMapping[serverField] || serverField;
          mappedErrors[localField] = errorMessage;
          console.log(`🔍 Mapeando error: ${serverField} -> ${localField}: ${errorMessage}`);
        });
      }
      
      console.log('🔍 Errores mapeados:', mappedErrors);
      setErrors(mappedErrors);
    } else {
      // Si no hay errores del servidor, limpiar errores
      setErrors({});
    }
  }, [serverErrors]);

  useEffect(() => {
    if (user) {
      setFormData({
        nombres: user.nombres || user.nombre || '',
        apellidos: user.apellidos || user.apellido || '',
        cedula: user.cedula || '',
        email: user.email || user.correo || '',
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        fechaNacimiento: user.fechaNacimiento ? user.fechaNacimiento.split('T')[0] : '',
        edad: user.edad || '',
        password: '' // No cargar password al editar
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombres.trim()) newErrors.nombres = 'Los nombres son requeridos';
    if (!formData.apellidos.trim()) newErrors.apellidos = 'Los apellidos son requeridos';
    if (!formData.cedula.trim()) newErrors.cedula = 'La cédula es requerida';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    
    // Password solo es requerido al crear usuario
    if (!user && !formData.password.trim()) newErrors.password = 'La contraseña es requerida';
    if (formData.password && formData.password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    
    if (formData.telefono && !/^\d{10}$/.test(formData.telefono.replace(/\D/g, ''))) {
      newErrors.telefono = 'El teléfono debe tener 10 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Calculate age from birth date
      let edad = null;
      if (formData.fechaNacimiento) {
        const today = new Date();
        const birthDate = new Date(formData.fechaNacimiento);
        edad = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          edad--;
        }
      }

      // Map form data to API expected structure
      const apiData = {
        cedula: formData.cedula,
        nombre: formData.nombres,
        apellido: formData.apellidos,
        edad: edad || 0,
        fechaNacimiento: formData.fechaNacimiento ? new Date(formData.fechaNacimiento).toISOString() : null,
        direccion: formData.direccion,
        telefono: formData.telefono,
        correo: formData.email,
        ...(formData.password && { password: formData.password })
      };
      onSubmit(apiData);
    }
  };

  // Función para calcular la edad
  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age >= 0 ? age : '';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };
    
    // Si cambia la fecha de nacimiento, calcular automáticamente la edad
    if (name === 'fechaNacimiento') {
      newFormData.edad = calculateAge(value);
    }
    
    setFormData(newFormData);
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">
        {user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/70 text-sm mb-1">Nombres *</label>
            <input
              type="text"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              className={`w-full bg-white/10 border ${errors.nombres ? 'border-red-400' : 'border-white/10'} rounded-lg px-3 py-2 text-white placeholder-white/30`}
              placeholder="Ingrese los nombres"
            />
            {errors.nombres && <span className="text-red-400 text-xs">{errors.nombres}</span>}
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-1">Apellidos *</label>
            <input
              type="text"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              className={`w-full bg-white/10 border ${errors.apellidos ? 'border-red-400' : 'border-white/10'} rounded-lg px-3 py-2 text-white placeholder-white/30`}
              placeholder="Ingrese los apellidos"
            />
            {errors.apellidos && <span className="text-red-400 text-xs">{errors.apellidos}</span>}
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-1">Cédula *</label>
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              className={`w-full bg-white/10 border ${errors.cedula ? 'border-red-400' : 'border-white/10'} rounded-lg px-3 py-2 text-white placeholder-white/30`}
              placeholder="Ingrese la cédula"
            />
            {errors.cedula && <span className="text-red-400 text-xs">{errors.cedula}</span>}
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full bg-white/10 border ${errors.email ? 'border-red-400' : 'border-white/10'} rounded-lg px-3 py-2 text-white placeholder-white/30`}
              placeholder="Ingrese el email"
            />
            {errors.email && <span className="text-red-400 text-xs">{errors.email}</span>}
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-1">Teléfono</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className={`w-full bg-white/10 border ${errors.telefono ? 'border-red-400' : 'border-white/10'} rounded-lg px-3 py-2 text-white placeholder-white/30`}
              placeholder="Ingrese el teléfono"
            />
            {errors.telefono && <span className="text-red-400 text-xs">{errors.telefono}</span>}
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-1">Fecha de Nacimiento</label>
            <input
              type="date"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-1">Edad</label>
            <input
              type="number"
              name="edad"
              value={formData.edad}
              onChange={handleChange}
              min="0"
              max="120"
              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30"
              placeholder="Edad"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-1">
              Contraseña {!user && '*'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full bg-white/10 border ${errors.password ? 'border-red-400' : 'border-white/10'} rounded-lg px-3 py-2 text-white placeholder-white/30`}
              placeholder={user ? "Dejar vacío para mantener la actual" : "Ingrese la contraseña"}
            />
            {errors.password && <span className="text-red-400 text-xs">{errors.password}</span>}
          </div>

        </div>

        <div>
          <label className="block text-white/70 text-sm mb-1">Dirección</label>
          <textarea
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            rows="3"
            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30"
            placeholder="Ingrese la dirección completa"
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
            {loading ? 'Guardando...' : (user ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </div>
  );
}

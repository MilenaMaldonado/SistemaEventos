import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerApi } from '../api/auth';
import './Register.css';

export default function Register() {
  const [form, setForm] = useState({
    cedula: '', nombre: '', apellido: '', edad: '', fechaNacimiento: '', direccion: '', telefono: '', correo: '', password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('auth-bg');
    return () => {
      document.body.classList.remove('auth-bg');
    };
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await registerApi(form);
      setSuccess('Registro exitoso. Ahora puedes iniciar sesión.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError('Error al registrar usuario. Verifica los datos.');
    }
  };

  return (
    <div className="register-container">
      <h2>Registrarse</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <input type="text" placeholder="Cédula" value={form.cedula} onChange={handleChange} required />
        <input type="text" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
        <input type="email" placeholder="Correo" value={form.correo} onChange={handleChange} required />
        <input type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required minLength={6} />
        <button type="submit">Registrar</button>
        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}
      </form>
      <p>¿Ya tienes cuenta? <a href="/login">Inicia sesión</a></p>
    </div>
  );
}

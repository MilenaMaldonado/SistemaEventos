import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../api/auth';
import useAuth from '../hooks/useAuth';
import './Login.css';

export default function Login() {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('auth-bg');
    return () => {
      document.body.classList.remove('auth-bg');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await loginApi(cedula, password);
      login(res.data.token);
      if (res.data.token) {
        const userRole = res.data.rol || (res.data.user && res.data.user.rol);
        if (userRole === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError('Credenciales incorrectas o error de conexión');
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <input type="text" placeholder="Cédula" value={cedula} onChange={e => setCedula(e.target.value)} required />
        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
        <button type="submit">Ingresar</button>
        {error && <p className="error-msg">{error}</p>}
      </form>
      <p>¿No tienes cuenta? <a href="/register">Regístrate</a></p>
    </div>
  );
}

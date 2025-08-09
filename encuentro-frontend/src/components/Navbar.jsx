
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import useAuth from '../hooks/useAuth';


export default function Navbar() {
  const { token, user, logout, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-title">Encuentro</span>
      </div>
      <div className="navbar-right">
        {!token ? (
          <>
            <Link to="/login" className="navbar-link">Login</Link>
            <Link to="/register" className="navbar-link">Registrar</Link>
          </>
        ) : (
          <>
            <span className="navbar-user">Bienvenido, {user?.username || user?.email || 'Usuario'}!</span>
            {role === 'ADMIN' && (
              <Link to="/admin" className="navbar-link">Admin</Link>
            )}
            <button className="navbar-link navbar-logout" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

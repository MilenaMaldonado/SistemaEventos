import React from 'react';
import useAuth from '../hooks/useAuth';

export default function AdminDashboard() {
  const { user } = useAuth();
  return (
    <div className="admin-dashboard">
      <h2>Panel de Administración</h2>
      <p>Bienvenido, {user?.nombre || 'Administrador'}.</p>
      <ul>
        <li>Gestión de usuarios</li>
        <li>Gestión de eventos</li>
        <li>Reportes</li>
        <li>Notificaciones</li>
      </ul>
    </div>
  );
}

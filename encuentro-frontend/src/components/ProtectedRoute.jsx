import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Asegurar que roles tenga un valor predeterminado seguro
function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated = false, hasRole = () => false, isLoading = false } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roles.length > 0 && !hasRole(roles)) {
    return <Navigate to="/no-autorizado" />;
  }

  return children;
}

export default ProtectedRoute;

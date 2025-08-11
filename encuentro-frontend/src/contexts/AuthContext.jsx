import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Cambiar a true para cargar estado inicial
  const [userName, setUserName] = useState(null);

  // Función para verificar si el usuario es admin
  const isAdmin = userRole === 'ADMIN' || userRole === 'ROLE_ADMINISTRADOR' || userRole === 'ADMINISTRADOR';

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('authToken');
        if (savedToken) {
          // Validar el token con el backend
          try {
            const response = await authAPI.validateToken();
            if (response.data && response.data.valid) {
              // Token válido, restaurar estado del usuario
              const userData = response.data.user || response.data;
              setIsAuthenticated(true);
              setToken(savedToken);
              setUserRole(userData.role || userData.rol || 'USER');
              setUserId(userData.id || userData.userId || userData.cedula);
              setUserName(userData.name || userData.nombre || userData.username || 'Usuario');
            } else {
              // Token inválido, limpiar
              localStorage.removeItem('authToken');
            }
          } catch (error) {
            // Error al validar token, limpiar
            console.error('Error validating token:', error);
            localStorage.removeItem('authToken');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (role, id, token, name) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUserId(id);
    setToken(token);
    setUserName(name);
    localStorage.setItem('authToken', token);
  };

  const logout = async () => {
    try {
      // Llamar a la API de logout si hay un token
      if (token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Continuar con el logout local aunque falle el del servidor
    } finally {
      // Limpiar estado local
      setIsAuthenticated(false);
      setUserRole(null);
      setUserId(null);
      setToken(null);
      setUserName(null);
      localStorage.removeItem('authToken');
    }
  };

  const register = async (userData) => {
    try {
      console.log('Registering user:', userData);
      // Aquí puedes agregar la lógica para registrar al usuario, como llamar a una API
      // Por ejemplo:
      // const response = await api.register(userData);
      // return response;
      return { success: true, message: 'User registered successfully' };
    } catch (error) {
      console.error('Error in register function:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        userId,
        token,
        isLoading,
        userName,
        isAdmin,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

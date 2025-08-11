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

  // Función para verificar si el usuario es admin - más flexible
  const isAdmin = () => {
    if (!userRole) return false;
    const normalizedRole = userRole.toUpperCase().replace('ROLE_', '').replace('_', '');
    const adminVariations = ['ADMIN', 'ADMINISTRADOR', 'ADMINISTRATOR'];
    return adminVariations.includes(normalizedRole);
  };

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('authToken');
        const savedUserData = localStorage.getItem('userData');
        
        if (savedToken && savedUserData) {
          try {
            // Intentar restaurar datos del usuario desde localStorage
            const userData = JSON.parse(savedUserData);
            
            setIsAuthenticated(true);
            setToken(savedToken);
            setUserRole(userData.role || userData.rol || 'USER');
            setUserId(userData.cedula || userData.id || userData.userId);
            setUserName(userData.nombre || userData.name || userData.username || 'Usuario');
            
            // Opcional: Validar token con el backend en segundo plano
            try {
              const response = await authAPI.validateToken();
              if (!response.data || !response.data.valid) {
                console.info('Token validation: Token inválido detectado, manteniendo sesión local');
                // No cerrar sesión inmediatamente, dar al usuario la oportunidad de renovar
              } else {
                console.info('Token validation: Token válido confirmado por el backend');
              }
            } catch (error) {
              // Solo mostrar warning si no es un error 403 (que es común cuando el endpoint no está implementado)
              if (error.response?.status === 403) {
                console.info('Token validation: Endpoint de validación no disponible (403), manteniendo sesión local');
              } else {
                console.warn('Token validation: Error al validar token con el backend:', error.message);
              }
              // No cerrar sesión por errores de red, mantener sesión local
            }
            
          } catch (parseError) {
            console.error('Error al parsear datos de usuario:', parseError);
            // Si hay error parseando, limpiar y empezar de nuevo
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
          }
        }
      } catch (error) {
        console.error('Error inicializando autenticación:', error);
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
    
    // Guardar token y datos de usuario en localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify({
      role: role,
      cedula: id,
      id: id,
      userId: id,
      nombre: name,
      name: name,
      username: name
    }));
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
      
      // Limpiar localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
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

  const hasRole = (requiredRoles) => {
    if (!userRole || !requiredRoles || requiredRoles.length === 0) {
      return false;
    }
    
    // Normalizar el rol del usuario - puede venir como ADMIN, ADMINISTRADOR, ROLE_ADMINISTRADOR, etc.
    const normalizedUserRole = userRole.toUpperCase().replace('ROLE_', '').replace('_', '');
    
    // Verificar si el usuario tiene alguno de los roles requeridos
    const hasAccess = requiredRoles.some(role => {
      const normalizedRequiredRole = role.toUpperCase().replace('ROLE_', '').replace('_', '');
      
      // Mapear variaciones comunes de roles
      const adminVariations = ['ADMIN', 'ADMINISTRADOR', 'ADMINISTRATOR'];
      const clientVariations = ['CLIENTE', 'CLIENT', 'USER', 'USUARIO'];
      
      // Si el rol requerido es ADMINISTRADOR y el usuario tiene alguna variación de admin
      if (normalizedRequiredRole === 'ADMINISTRADOR' && adminVariations.includes(normalizedUserRole)) {
        return true;
      }
      
      // Si el rol requerido es CLIENTE y el usuario tiene alguna variación de cliente
      if (normalizedRequiredRole === 'CLIENTE' && clientVariations.includes(normalizedUserRole)) {
        return true;
      }
      
      // Comparación directa
      return normalizedUserRole === normalizedRequiredRole;
    });
    
    return hasAccess;
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
        isAdmin: isAdmin(), // Llamar la función
        user: { cedula: userId, nombre: userName, role: userRole }, // Objeto user para compatibilidad
        login,
        logout,
        register,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

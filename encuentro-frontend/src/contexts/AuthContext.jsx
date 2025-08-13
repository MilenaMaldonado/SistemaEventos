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
  const [isValidating, setIsValidating] = useState(false);

  // Función para verificar si el usuario es admin - más flexible
  const isAdmin = () => {
    if (!userRole) return false;
    const normalizedRole = userRole.toUpperCase().replace('ROLE_', '').replace('_', '');
    const adminVariations = ['ADMIN', 'ADMINISTRADOR', 'ADMINISTRATOR'];
    return adminVariations.includes(normalizedRole);
  };

  // Función para auto-logout cuando el token expire o desaparezca
  const autoLogout = (reason = 'desconocida') => {
    console.log('🔴 AUTO-LOGOUT EJECUTADO - Razón:', reason);
    console.trace(); // Esto mostrará el stack trace para ver de dónde viene la llamada
    
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
    setToken(null);
    setUserName(null);
    
    // Limpiar localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Redirigir al login (si hay un router context disponible)
    window.location.href = '/login';
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
            
            // Token restaurado desde localStorage - sesión local válida
            console.log('Sesión restaurada desde localStorage');
            
          } catch (parseError) {
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

  // COMENTADO: Monitorear cambios en localStorage
  // useEffect(() => {
  //   const handleStorageChange = (e) => {
  //     if (e.key === 'authToken' && e.newValue === null && isAuthenticated) {
  //       console.log('Token eliminado desde otra pestaña');
  //       autoLogout('storage-change');
  //     }
  //   };

  //   window.addEventListener('storage', handleStorageChange);
  //   return () => window.removeEventListener('storage', handleStorageChange);
  // }, [isAuthenticated]);

  // Validar token con el servidor
  const validateTokenWithServer = async () => {
    if (isValidating) {
      console.log('Validación ya en curso, saltando...');
      return;
    }

    setIsValidating(true);
    const currentToken = localStorage.getItem('authToken');
    
    if (!currentToken) {
      console.log('No hay token - auto logout');
      autoLogout();
      setIsValidating(false);
      return;
    }

    try {
      console.log('Validando token con servidor...');
      await authAPI.validateToken();
      console.log('✅ Token válido - sesión mantenida');
    } catch (error) {
      console.log('❌ Token inválido o expirado - auto logout', error);
      autoLogout();
    } finally {
      setIsValidating(false);
    }
  };

  // COMENTADO: Verificación periódica automática deshabilitada
  // useEffect(() => {
  //   let intervalId;
    
  //   if (isAuthenticated && !isLoading) {
  //     console.log('🔄 Iniciando validación periódica del token');
      
  //     // Primera validación después de 10 segundos
  //     const initialTimeout = setTimeout(() => {
  //       validateTokenWithServer();
        
  //       // Después configurar validaciones cada 2 minutos
  //       intervalId = setInterval(validateTokenWithServer, 120000);
  //     }, 10000);

  //     return () => {
  //       clearTimeout(initialTimeout);
  //       if (intervalId) {
  //         clearInterval(intervalId);
  //       }
  //     };
  //   }
  // }, [isAuthenticated, isLoading]);

  // COMENTADO: Escuchar evento de token expirado desde httpClient
  // useEffect(() => {
  //   const handleTokenExpired = () => {
  //     if (isAuthenticated) {
  //       console.log('Evento tokenExpired recibido');
  //       autoLogout('token-expired-event');
  //     }
  //   };

  //   window.addEventListener('tokenExpired', handleTokenExpired);
  //   return () => window.removeEventListener('tokenExpired', handleTokenExpired);
  // }, [isAuthenticated]);

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
      const response = await authAPI.register(userData);
      console.log('Registration response:', response);
      return response;
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
        isValidating,
        isAdmin: isAdmin(), // Llamar la función
        user: { cedula: userId, nombre: userName, role: userRole }, // Objeto user para compatibilidad
        login,
        logout,
        register,
        hasRole,
        validateTokenWithServer, // Exponer función para validación manual
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

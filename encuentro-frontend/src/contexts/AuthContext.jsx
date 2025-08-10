import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authAPI, handleApiError } from '../api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(authAPI.getToken());
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Inicializar usuario si hay token
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log('Token decodificado:', decoded);
        
        // Extraer información del JWT según la estructura proporcionada
        const userData = {
          cedula: decoded.sub, // cedula está en "sub"
          role: decoded.role,  // role está en "role"
          iat: decoded.iat,
          exp: decoded.exp
        };
        
        setUser(userData);
        setRole(decoded.role);
        
        // Verificar si el token está expirado
        if (decoded.exp * 1000 < Date.now()) {
          console.log('Token expirado, cerrando sesión');
          logout();
        }
      } catch (error) {
        console.error('Token inválido:', error);
        logout();
      }
    } else {
      setUser(null);
      setRole(null);
    }
  }, [token]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Enviando credenciales al API:', credentials);
      const response = await authAPI.login(credentials);
      console.log('Respuesta del login API:', response);
      
      // La respuesta puede estar en response.data o directamente en response
      const responseData = response.data || response;
      
      // La API devuelve el token en diferentes campos posibles
      const newToken = responseData.token || 
                      responseData.accessToken || 
                      responseData.jwt || 
                      responseData.respuesta; // El token está en 'respuesta' según tu API
      
      if (!newToken) {
        console.error('Estructura de respuesta:', responseData);
        throw new Error('No se recibió token del servidor');
      }
      
      console.log('Token recibido:', newToken);
      
      // Guardar token
      authAPI.setToken(newToken);
      setToken(newToken);
      
      // El useEffect se encargará de decodificar el token y extraer la información del usuario
      
      return responseData;
    } catch (error) {
      console.error('Error en AuthContext.login:', error);
      const processedError = handleApiError(error);
      setError(processedError.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Enviando datos de registro al API:', { ...userData, password: '***' });
      const response = await authAPI.register(userData);
      console.log('Respuesta del registro API:', response);
      
      // La respuesta puede estar en response.data o directamente en response
      const responseData = response.data || response;
      
      return responseData;
    } catch (error) {
      console.error('Error en AuthContext.register:', error);
      const processedError = handleApiError(error);
      setError(processedError.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Intentar cerrar sesión en el servidor
      await authAPI.logout();
    } catch (error) {
      console.warn('Error al cerrar sesión en el servidor:', error);
    } finally {
      // Siempre limpiar el estado local
      authAPI.removeToken();
      setToken(null);
      setUser(null);
      setRole(null);
      setError(null);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authAPI.refreshToken();
      const { token: newToken } = response.data;
      
      authAPI.setToken(newToken);
      setToken(newToken);
      
      return response.data;
    } catch (error) {
      logout();
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = role === 'ROLE_ADMINISTRADOR';
  const isCliente = role === 'ROLE_CLIENTE';

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      role, 
      loading, 
      error,
      isAuthenticated,
      isAdmin,
      isCliente,
      login, 
      register,
      logout,
      refreshToken,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

import React, { createContext, useState, useContext } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = (role, id, token) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUserId(id);
    setToken(token);
    localStorage.setItem('authToken', token);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
    setToken(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        userId,
        token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

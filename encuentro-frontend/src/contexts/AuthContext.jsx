import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(token ? jwtDecode(token) : null);
  const [role, setRole] = useState(user ? user.rol : null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
  const decoded = jwtDecode(token);
      setUser(decoded);
      setRole(decoded.rol);
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setRole(null);
    }
  }, [token]);

  const login = (jwt) => {
    setToken(jwt);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

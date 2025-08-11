import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const auth = useAuth();

  // Debug logging solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('Navbar - Estado de autenticación:', {
      isAuthenticated: auth?.isAuthenticated,
      userName: auth?.userName,
      userRole: auth?.userRole,
      isLoading: auth?.isLoading,
      isAdmin: auth?.isAdmin
    });
  }

  if (!auth) {
    console.error("Navbar: useAuth returned undefined. Ensure AuthProvider is correctly set up.");
    return (
      <nav>
        <div>Error: AuthProvider no está configurado correctamente.</div>
      </nav>
    );
  }

  // Mostrar spinner mientras se carga el estado de autenticación
  if (auth.isLoading) {
    return (
      <nav className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="animate-pulse">Cargando...</div>
          </div>
        </div>
      </nav>
    );
  }

  const { token = null, userName = 'Usuario', logout, userRole = 'guest', isAuthenticated = false, isLoading = true, isAdmin = false } = auth;
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (isLoading) {
    return null; // O un spinner de carga si prefieres
  }

  return (
    <nav className="backdrop-blur-md bg-white/10 border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                EventosApp
              </h1>
              <span className="text-xs text-white/60">Tu plataforma de eventos</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {!isAuthenticated ? (
              <>
                <Link 
                  to="/" 
                  className="text-white/90 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200"
                >
                  Inicio
                </Link>
                <Link 
                  to="/eventos" 
                  className="text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200"
                >
                  Eventos
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/" 
                  className="text-white/90 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200"
                >
                  Inicio
                </Link>
                <Link 
                  to="/eventos" 
                  className="text-white/90 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200"
                >
                  Eventos
                </Link>
                <Link 
                  to="/mis-compras" 
                  className="text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200"
                >
                  Mis Tickets
                </Link>
                
                {/* Opciones específicas de Admin */}
                {isAdmin && (
                  <>
                    <div className="relative group">
                      <button className="text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200 flex items-center space-x-1">
                        <span>Administración</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-sm border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <Link 
                          to="/admin" 
                          className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-t-lg"
                        >
                          Dashboard
                        </Link>
                        <Link 
                          to="/admin/eventos" 
                          className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                        >
                          Gestionar Eventos
                        </Link>
                        <Link 
                          to="/admin/usuarios" 
                          className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                        >
                          Gestionar Usuarios
                        </Link>
                        <Link 
                          to="/admin/ciudades" 
                          className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                        >
                          Gestionar Ciudades
                        </Link>
                        <Link 
                          to="/admin/tickets" 
                          className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                        >
                          Gestionar Tickets
                        </Link>
                        <Link 
                          to="/admin/reportes" 
                          className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                        >
                          Reportes
                        </Link>
                        <Link 
                          to="/admin/configuracion" 
                          className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-b-lg"
                        >
                          Configuración
                        </Link>
                      </div>
                    </div>
                  </>
                )}
                
                <Link 
                  to="/profile" 
                  className="text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200"
                >
                  Perfil
                </Link>
              </>
            )}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && (
              <NotificationBell />
            )}
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Registrarse
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3 bg-white/5 rounded-full px-4 py-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {userName?.slice(-2) || 'U'}
                    </span>
                  </div>
                  <span className="text-white/90 text-sm font-medium">
                    {userName || 'Usuario'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && (
              <NotificationBell />
            )}
            <button
              onClick={toggleMobileMenu}
              className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4">
            <div className="space-y-2">
              {!isAuthenticated ? (
                <>
                  <Link 
                    to="/" 
                    className="block text-white/90 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Inicio
                  </Link>
                  <Link 
                    to="/eventos" 
                    className="block text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Eventos
                  </Link>
                  <div className="pt-4 space-y-2">
                    <Link
                      to="/login"
                      className="block text-white/70 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      to="/register"
                      className="block bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Registrarse
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/" 
                    className="block text-white/90 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Inicio
                  </Link>
                  <Link 
                    to="/eventos" 
                    className="block text-white/90 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Eventos
                  </Link>
                  <Link 
                    to="/mis-compras" 
                    className="block text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Mis Tickets
                  </Link>
                  
                  {/* Opciones de Admin en móvil */}
                  {isAdmin && (
                    <>
                      <div className="pt-2 pb-2">
                        <div className="text-white/50 text-xs uppercase tracking-wider px-3 py-1">
                          Administración
                        </div>
                        <Link
                          to="/admin"
                          className="block text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/admin/eventos"
                          className="block text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Gestionar Eventos
                        </Link>
                        <Link
                          to="/admin/usuarios"
                          className="block text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Gestionar Usuarios
                        </Link>
                        <Link
                          to="/admin/ciudades"
                          className="block text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Gestionar Ciudades
                        </Link>
                        <Link
                          to="/admin/tickets"
                          className="block text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Gestionar Tickets
                        </Link>
                        <Link
                          to="/admin/reportes"
                          className="block text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Reportes
                        </Link>
                        <Link
                          to="/admin/configuracion"
                          className="block text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Configuración
                        </Link>
                      </div>
                    </>
                  )}
                  
                  <Link 
                    to="/profile" 
                    className="block text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Perfil
                  </Link>
                  <div className="pt-4 space-y-2">
                    <div className="flex items-center space-x-3 px-3 py-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {userName?.slice(-2) || 'U'}
                        </span>
                      </div>
                      <span className="text-white/90 text-sm font-medium">
                        {userName || 'Usuario'}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left text-white/70 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

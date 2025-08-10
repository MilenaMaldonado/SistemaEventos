
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Navbar() {
  const { token, user, logout, role, isAuthenticated, isAdmin } = useAuth();
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
                  to="/eventos" 
                  className="text-white/90 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200"
                >
                  Eventos
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin-dashboard" 
                    className="text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200"
                  >
                    Dashboard Admin
                  </Link>
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
                      {user?.cedula?.slice(-2) || 'U'}
                    </span>
                  </div>
                  <span className="text-white/90 text-sm font-medium">
                    {user?.cedula || 'Usuario'}
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
          <div className="md:hidden">
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
                    to="/eventos" 
                    className="block text-white/90 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Eventos
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin-dashboard"
                      className="block text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard Admin
                    </Link>
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
                          {user?.cedula?.slice(-2) || 'U'}
                        </span>
                      </div>
                      <span className="text-white/90 text-sm font-medium">
                        {user?.cedula || 'Usuario'}
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

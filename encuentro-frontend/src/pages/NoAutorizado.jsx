import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const NoAutorizado = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">🚫</div>
          <h1 className="text-4xl font-bold text-white mb-4">Acceso Denegado</h1>
          <p className="text-white/70 mb-8">
            No tienes permisos para acceder a esta página
          </p>
          <Link 
            to="/"
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NoAutorizado;

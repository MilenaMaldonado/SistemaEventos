import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuariosAPI } from '../api/usuariosAPI';
import useAuth from '../hooks/useAuth';

export default function Profile() {
  const { user, isAdmin, isCliente } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.cedula) {
        setError('No se pudo obtener la información del usuario');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Buscando usuario con cédula:', user.cedula);
        
        const response = await usuariosAPI.getUsuarioByCedula(user.cedula);
        console.log('Respuesta del API de usuarios:', response);
        
        // La respuesta del servidor viene directamente sin wrapper
        const userData = response.data || response;
        
        if (userData && userData.cedula) {
          setUserData(userData);
        } else {
          console.error('Respuesta del servidor sin datos válidos:', userData);
          setError('No se encontró información del usuario');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Error al cargar la información del usuario: ' + (error.message || 'Error desconocido'));
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.cedula]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="text-white/90">Cargando información del usuario...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Error</h2>
            <p className="text-white/70 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-6 py-2 rounded-full font-medium transition-all duration-300"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-4xl mx-auto pt-20">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 px-8 py-6 border-b border-white/10">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {userData?.nombre?.charAt(0) || user?.cedula?.slice(-2) || 'U'}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  {userData?.nombre ? `${userData.nombre} ${userData.apellido || ''}` : 'Perfil de Usuario'}
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isAdmin 
                      ? 'bg-purple-500/20 text-purple-300' 
                      : 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {isAdmin ? 'Administrador' : 'Cliente'}
                  </span>
                  <span className="text-white/60">•</span>
                  <span className="text-white/60 text-sm">Cédula: {user?.cedula}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Información Personal */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Información Personal</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Nombre Completo</label>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <span className="text-white">
                        {userData?.nombre && userData?.apellido 
                          ? `${userData.nombre} ${userData.apellido}`
                          : userData?.nombre || 'No disponible'
                        }
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Cédula</label>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <span className="text-white">{userData?.cedula || user?.cedula}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <span className="text-white">{userData?.correo || 'No disponible'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Teléfono</label>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <span className="text-white">{userData?.telefono || 'No disponible'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información Adicional */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Información Adicional</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Tipo de Usuario</label>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${isAdmin ? 'bg-purple-400' : 'bg-cyan-400'}`}></div>
                        <span className="text-white">{isAdmin ? 'Administrador' : 'Cliente'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Edad</label>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <span className="text-white">{userData?.edad || 'No disponible'} años</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Fecha de Nacimiento</label>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <span className="text-white">
                        {userData?.fechaNacimiento 
                          ? new Date(userData.fechaNacimiento).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'No disponible'
                        }
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Dirección</label>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <span className="text-white">{userData?.direccion || 'No disponible'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/')}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/25 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Volver al Inicio</span>
                </button>
                
                {isAdmin && (
                  <button 
                    onClick={() => navigate('/admin-dashboard')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25"
                  >
                    Ir al Dashboard Admin
                  </button>
                )}
                
                <button className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300">
                  Editar Perfil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
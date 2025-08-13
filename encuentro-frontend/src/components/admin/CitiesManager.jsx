import React, { useState, useEffect } from 'react';
import { eventosAPI } from '../../api';
import CityForm from '../forms/CityForm';

export default function CitiesManager() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eventosAPI.getCiudades();
      const data = response?.data || response;
      setCities(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar las ciudades');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCity = async (cityData) => {
    setFormLoading(true);
    try {
      await eventosAPI.createCiudad(cityData);
      await loadCities();
      setShowForm(false);
      showSuccessMessage('Ciudad creada exitosamente');
    } catch (err) {
      showErrorMessage('Error al crear ciudad: ' + (err?.message || 'Error desconocido'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateCity = async (cityData) => {
    setFormLoading(true);
    try {
      await eventosAPI.updateCiudad(editingCity.id, cityData);
      await loadCities();
      setShowForm(false);
      setEditingCity(null);
      showSuccessMessage('Ciudad actualizada exitosamente');
    } catch (err) {
      showErrorMessage('Error al actualizar ciudad: ' + (err?.message || 'Error desconocido'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCity = async (cityId) => {
    if (!confirmDelete('¿Está seguro de que desea eliminar esta ciudad?', 'Esta acción no se puede deshacer.')) return;
    
    try {
      await eventosAPI.deleteCiudad(cityId);
      await loadCities();
      showSuccessMessage('Ciudad eliminada exitosamente');
    } catch (err) {
      showErrorMessage('Error al eliminar ciudad: ' + (err?.message || 'Error desconocido'));
    }
  };

  const handleEditCity = (city) => {
    setEditingCity(city);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCity(null);
  };

  const handleSubmit = (cityData) => {
    if (editingCity) {
      handleUpdateCity(cityData);
    } else {
      handleCreateCity(cityData);
    }
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Gestión de Ciudades</h3>
          <button
            onClick={handleCancelForm}
            className="text-sm text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
          >
            Volver a la lista
          </button>
        </div>
        
        <CityForm
          city={editingCity}
          onSubmit={handleSubmit}
          onCancel={handleCancelForm}
          loading={formLoading}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Gestión de Ciudades</h3>
        <div className="space-x-2">
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-white/90 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-3 py-1.5 rounded-lg"
          >
            Nueva Ciudad
          </button>
          <button
            onClick={loadCities}
            className="text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
          >
            Refrescar
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-white/70 text-center py-8">Cargando ciudades...</div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-white/60 text-left text-sm">
                  <th className="py-2 pr-4">Nombre</th>
                  <th className="py-2 pr-4">Provincia</th>
                  <th className="py-2 pr-4">País</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2 pr-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cities.map((city) => (
                  <tr key={city.id || city.nombre} className="text-white/90 text-sm border-t border-white/10">
                    <td className="py-2 pr-4">{city.nombre || '—'}</td>
                    <td className="py-2 pr-4">{city.provincia || '—'}</td>
                    <td className="py-2 pr-4">{city.pais || 'Ecuador'}</td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        city.activo 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {city.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditCity(city)}
                          className="text-xs text-white/90 bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteCity(city.id)}
                          className="text-xs text-red-300 hover:text-red-200 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded-lg"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {cities.length === 0 && (
                  <tr>
                    <td className="text-white/60 py-4" colSpan={5}>No hay ciudades registradas</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // Helper functions for better UX
  const showSuccessMessage = (message) => {
    // Crear notificación de éxito
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const showErrorMessage = (message) => {
    // Crear notificación de error
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remover después de 5 segundos
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 5000);
  };

  const confirmDelete = (title, message) => {
    return new Promise((resolve) => {
      // Crear modal de confirmación
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center';
      modal.innerHTML = `
        <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-95 opacity-0">
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">${title}</h3>
            <p class="text-white/70 mb-6">${message}</p>
            <div class="flex space-x-3">
              <button id="cancel-btn" class="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors">
                Cancelar
              </button>
              <button id="confirm-btn" class="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Animar entrada
      setTimeout(() => {
        modal.querySelector('.bg-white\\/10').classList.remove('scale-95', 'opacity-0');
      }, 100);
      
      // Event listeners
      modal.querySelector('#cancel-btn').onclick = () => {
        modal.querySelector('.bg-white\\/10').classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
          document.body.removeChild(modal);
          resolve(false);
        }, 300);
      };
      
      modal.querySelector('#confirm-btn').onclick = () => {
        modal.querySelector('.bg-white\\/10').classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
          document.body.removeChild(modal);
          resolve(true);
        }, 300);
      };
      
      // Cerrar con ESC
      const handleEsc = (e) => {
        if (e.key === 'Escape') {
          modal.querySelector('#cancel-btn').click();
          document.removeEventListener('keydown', handleEsc);
        }
      };
      document.addEventListener('keydown', handleEsc);
    });
  };
}

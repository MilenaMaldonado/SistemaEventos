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
      alert('Ciudad creada exitosamente');
    } catch (err) {
      alert('Error al crear ciudad: ' + (err?.message || 'Error desconocido'));
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
      alert('Ciudad actualizada exitosamente');
    } catch (err) {
      alert('Error al actualizar ciudad: ' + (err?.message || 'Error desconocido'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCity = async (cityId) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta ciudad?')) return;
    
    try {
      await eventosAPI.deleteCiudad(cityId);
      await loadCities();
      alert('Ciudad eliminada exitosamente');
    } catch (err) {
      alert('Error al eliminar ciudad: ' + (err?.message || 'Error desconocido'));
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
}

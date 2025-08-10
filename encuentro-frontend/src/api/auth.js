// Este archivo ha sido deprecado. 
// Usa la nueva estructura de APIs en /api/authAPI.js
import { authAPI } from './index';

export async function login(cedula, password) {
  return authAPI.login({ cedula, password });
}

export async function register(data) {
  return authAPI.register(data);
}

// Exportar la nueva API por compatibilidad
export { authAPI as default };
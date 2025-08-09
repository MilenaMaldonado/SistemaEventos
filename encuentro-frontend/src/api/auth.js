import axios from 'axios';

export async function login(cedula, password) {
  return axios.post('http://localhost:8000/api/ms-autenticacion/api/auth/login', { cedula, password });
}

export async function register(data) {
  return axios.post('http://localhost:8000/api/ms-autenticacion/api/auth/register', data);
}

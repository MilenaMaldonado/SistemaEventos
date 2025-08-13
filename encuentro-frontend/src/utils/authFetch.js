// Wrapper para fetch que maneja automáticamente el auto-logout
export const authFetch = async (url, options = {}) => {
  try {
    // Agregar token automáticamente si existe
    const token = localStorage.getItem('authToken');
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }

    const response = await fetch(url, options);

    // Verificar errores de autenticación
    if (response.status === 401 || response.status === 403) {
      const currentPath = window.location.pathname;
      const publicPaths = ['/login', '/register', '/', '/eventos'];
      
      if (!publicPaths.includes(currentPath)) {
        console.log('Token inválido detectado en authFetch - auto logout');
        
        // Limpiar tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        
        // Disparar evento para AuthContext
        window.dispatchEvent(new CustomEvent('tokenExpired'));
        
        // Redirigir
        window.location.href = '/login';
        
        throw new Error('Token expirado o inválido');
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
};

export default authFetch;
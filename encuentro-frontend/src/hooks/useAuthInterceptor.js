import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useAuthInterceptor = () => {
  const auth = useAuth();

  useEffect(() => {
    // Interceptar fetch global para detectar errores 401/403
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Si recibimos 401 (Unauthorized) o 403 (Forbidden) con token expirado
        if (response.status === 401 || response.status === 403) {
          const responseText = await response.clone().text();
          
          // Verificar si el error indica token expirado/inválido
          if (responseText.includes('token') || 
              responseText.includes('expired') || 
              responseText.includes('unauthorized') ||
              responseText.includes('forbidden')) {
            
            console.log('Token expirado detectado en respuesta HTTP');
            
            if (auth && auth.logout) {
              auth.logout();
              window.location.href = '/login';
            }
          }
        }
        
        return response;
      } catch (error) {
        return Promise.reject(error);
      }
    };

    // Cleanup: restaurar fetch original
    return () => {
      window.fetch = originalFetch;
    };
  }, [auth]);
};
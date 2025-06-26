import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'react';

export const useAuthenticatedFetch = () => {
  const { getToken, isLoaded, userId, isSignedIn } = useAuth();

  const authenticatedFetch = useCallback(async (
    url: string,
    options: RequestInit = {}
  ) => {
    try {
      if (!isLoaded) {
        throw new Error('Clerk not loaded yet');
      }

      if (!isSignedIn) {
        throw new Error('User not signed in');
      }

      // ✅ Remove template parameter - use default Clerk token
      let token = await getToken({ 
        skipCache: true // Force fresh token
      });
      
      if (!token) {
        // Try one more time with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        token = await getToken({ skipCache: true });
        if (!token) {
          throw new Error('Unable to obtain authentication token');
        }
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        ...options.headers as Record<string, string>
      };

      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      // ✅ Use environment variable instead of hardcoded URL
      const fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_API_BASE_URL}${url}`;
      
      const response = await fetch(fullUrl, {
        ...options,
        headers,
        credentials: 'include'
      });

      // Handle authentication errors
      if (response.status === 401) {
        console.log('🔄 Token expired, attempting refresh...');
        token = await getToken({ skipCache: true });
        if (token) {
          // Retry with new token
          const retryResponse = await fetch(fullUrl, {
            ...options,
            headers: {
              ...headers,
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
          });
          return retryResponse;
        }
        throw new Error('Authentication failed - please sign in again');
      }

      return response;
    } catch (error) {
      console.error('❌ Authentication fetch error:', error);
      throw error;
    }
  }, [getToken, isLoaded, userId, isSignedIn]);

  return { authenticatedFetch, userId, isLoaded };
};

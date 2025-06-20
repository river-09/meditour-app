import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'react';

export const useAuthenticatedFetch = () => {
  const { getToken, isLoaded, userId } = useAuth();

  const authenticatedFetch = useCallback(async (
    url: string,
    options: RequestInit = {}
  ) => {
    try {
      if (!isLoaded) {
        throw new Error('Clerk not loaded yet');
      }

      const token = await getToken();
      console.log('🔑 Token obtained:', token ? 'Present' : 'Missing');
      console.log('👤 User ID:', userId);

      if (!token) {
        throw new Error('No authentication token available');
      }

      // Prepare headers with proper typing
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
      };

      // Add existing headers if any
      if (options.headers) {
        Object.assign(headers, options.headers);
      }

      // Only set Content-Type for non-FormData requests
      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return response;
    } catch (error) {
      console.error('❌ Authentication fetch error:', error);
      throw error;
    }
  }, [getToken, isLoaded, userId]);

  return { authenticatedFetch, userId, isLoaded };
};
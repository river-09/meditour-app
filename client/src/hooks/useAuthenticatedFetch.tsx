// src/hooks/useAuthenticatedFetch.ts
import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'react';

export const useAuthenticatedFetch = () => {
  const { getToken, isLoaded, userId } = useAuth();

  const authenticatedFetch = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ) => {
    try {
      // Wait for Clerk to load before attempting to get token
      if (!isLoaded) {
        throw new Error('Clerk not loaded yet');
      }

      // Get the session token
      const token = await getToken();
      console.log('🔑 Token obtained:', token ? 'Present' : 'Missing');
      console.log('👤 User ID:', userId);
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Make the authenticated request
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Handle non-200 responses explicitly (Fetch API doesn't throw for these)
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

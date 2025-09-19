import { useAuth } from '../contexts/AuthContext';
import { useCallback } from 'react';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export function useAuthenticatedFetch() {
  const { token, logout } = useAuth();

  const authenticatedFetch = useCallback(async (
    url: string,
    options: FetchOptions = {}
  ): Promise<Response> => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth header if we have a token
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle unauthorized responses by logging out
    if (response.status === 401) {
      logout();
      throw new Error('Authentication required');
    }

    return response;
  }, [token, logout]);

  return authenticatedFetch;
}

// Helper function for common API operations
export function useApi() {
  const authenticatedFetch = useAuthenticatedFetch();

  const get = useCallback(async (url: string) => {
    const response = await authenticatedFetch(url);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `Request failed with status ${response.status}`);
    }
    return response.json();
  }, [authenticatedFetch]);

  const post = useCallback(async (url: string, data: any) => {
    const response = await authenticatedFetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `Request failed with status ${response.status}`);
    }
    return response.json();
  }, [authenticatedFetch]);

  const put = useCallback(async (url: string, data: any) => {
    const response = await authenticatedFetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `Request failed with status ${response.status}`);
    }
    return response.json();
  }, [authenticatedFetch]);

  const del = useCallback(async (url: string) => {
    const response = await authenticatedFetch(url, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `Request failed with status ${response.status}`);
    }
    return response.json();
  }, [authenticatedFetch]);

  const postFormData = useCallback(async (url: string, formData: FormData) => {
    // Don't set Content-Type for FormData, let browser set it with boundary
    const response = await authenticatedFetch(url, {
      method: 'POST',
      body: formData,
      headers: {}, // Override default Content-Type for FormData
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `Request failed with status ${response.status}`);
    }
    return response.json();
  }, [authenticatedFetch]);

  return { get, post, put, del, postFormData, authenticatedFetch };
}
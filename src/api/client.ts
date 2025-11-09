/**
 * API Client
 * Centralized HTTP client with error handling and interceptors
 */

import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import { env } from '../config/env';
import { handleApiError } from '../utils/error-handler';

/**
 * Create and configure axios instance
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - Add auth token, logging, etc.
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (env.appEnvironment === 'development') {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors globally
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log responses in development
    if (env.appEnvironment === 'development') {
      console.log(`[API] Response from ${response.config.url}:`, response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
          break;

        case 403:
          // Forbidden
          console.error('Access forbidden:', error.response.data);
          break;

        case 404:
          // Not found
          console.warn('Resource not found:', error.config?.url);
          break;

        case 422:
          // Validation error
          console.warn('Validation error:', error.response.data);
          break;

        case 429:
          // Rate limit exceeded
          console.warn('Rate limit exceeded. Please try again later.');
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          console.error('Server error:', status);
          break;

        default:
          console.error('API error:', error.response.data);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('No response from server. Please check your connection.');
    } else {
      // Something else happened
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * API helper functions
 */

export async function get<T>(url: string, params?: Record<string, any>): Promise<T> {
  try {
    const response = await apiClient.get<T>(url, { params });
    return response.data;
  } catch (error) {
    handleApiError(error, url, { params });
  }
}

export async function post<T>(url: string, data?: any): Promise<T> {
  try {
    const response = await apiClient.post<T>(url, data);
    return response.data;
  } catch (error) {
    handleApiError(error, url, { requestData: data });
  }
}

export async function put<T>(url: string, data?: any): Promise<T> {
  try {
    const response = await apiClient.put<T>(url, data);
    return response.data;
  } catch (error) {
    handleApiError(error, url, { requestData: data });
  }
}

export async function patch<T>(url: string, data?: any): Promise<T> {
  try {
    const response = await apiClient.patch<T>(url, data);
    return response.data;
  } catch (error) {
    handleApiError(error, url, { requestData: data });
  }
}

export async function del<T>(url: string): Promise<T> {
  try {
    const response = await apiClient.delete<T>(url);
    return response.data;
  } catch (error) {
    handleApiError(error, url);
  }
}

export default apiClient;

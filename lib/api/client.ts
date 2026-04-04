/**
 * API Client Base
 * Shared HTTP client for all API calls
 */

import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

export class APIClient {
  private instance: AxiosInstance;

  constructor(baseURL?: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  /**
   * Set authorization header
   */
  setAuthHeader(token: string): void {
    this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Add interceptor
   */
  addInterceptor(
    onRequest?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig,
    onError?: (error: any) => Promise<any>
  ) {
    this.instance.interceptors.request.use(onRequest);
    this.instance.interceptors.response.use(
      (response) => response,
      onError
    );
  }
}

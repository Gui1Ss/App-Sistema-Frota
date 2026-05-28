import { API_BASE_URL, API_TIMEOUT } from '../utils/constants';
import type { ApiError } from '../types/api';
import { CapacitorHttp } from '@capacitor/core';
import type { HttpResponse } from '@capacitor/core';

class ApiService {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    // Garantir que a URL não termine com barra para evitar barras duplas nas requisições
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    // console.log("DEBUG - BASE_URL CARREGADA:", baseUrl);
    // this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Faz requisição GET
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * Faz requisição POST
   */
  async post<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Faz requisição PUT
   */
  async put<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Faz requisição PATCH
   */
  async patch<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Faz requisição DELETE
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Faz upload de arquivo
   */
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.handleError(response);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleRequestError(error);
    }
  }

  /**
   * Requisição genérica
   */


  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const method = (options.method || 'GET').toUpperCase();
      const body = options.body
        ? typeof options.body === 'string'
          ? JSON.parse(options.body)
          : options.body
        : undefined;

      let responseData: any;
      let status = 0;

      try {
        const response: HttpResponse = await CapacitorHttp.request({
          url: `${this.baseUrl}${endpoint}`,
          method,
          headers: this.getHeaders() as Record<string, string>,
          data: body,
        });

        responseData = response.data;
        status = response.status;
      } catch (error) {
        // Fallback para web browsers sem suporte ao plugin CapacitorHttp
        if (
          error instanceof Error &&
          /Plugin|CapacitorHttp/.test(error.message)
        ) {
          const fetchResponse = await fetch(`${this.baseUrl}${endpoint}`, {
            method,
            headers: this.getHeaders(),
            body: options.body,
            signal: controller.signal,
          });

          status = fetchResponse.status;
          responseData = await fetchResponse.json();

          if (!fetchResponse.ok) {
            throw await this.handleError(fetchResponse);
          }
        } else {
          throw error;
        }
      }

      clearTimeout(timeoutId);

      console.log('STATUS:', status);
      console.log('URL:', `${this.baseUrl}${endpoint}`);

      if (status < 200 || status >= 300) {
        throw await this.handleError({ status, data: responseData } as any);
      }

      return responseData as T;
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleRequestError(error);
    }
  }

  /**
   * Retorna headers padrão
   */
  private getHeaders(skipContentType: boolean = false): HeadersInit {
    const headers: HeadersInit = {};

    if (!skipContentType) {
      headers['Content-Type'] = 'application/json';
    }

    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Trata erro de resposta
   */
  private async handleError(response: HttpResponse | Response): Promise<ApiError> {
    let data: any = null;

    if ('data' in response) {
      data = response.data;
    } else {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    }

    return {
      status: response.status,
      message: data?.message || `Erro: ${response.status}`,
      details: data,
    };
  }

  /**
   * Trata erro de requisição
   */
  private handleRequestError(error: any): ApiError {
    if (error instanceof TypeError) {
      if (error.name === 'AbortError') {
        return {
          status: 408,
          message: 'Requisição expirou',
        };
      }
      return {
        status: 0,
        message: 'Erro de conexão',
      };
    }

    return {
      status: 0,
      message: error?.message || 'Erro desconhecido',
    };
  }
}

export const apiService = new ApiService();

import axios from 'axios';

// --- Suas interfaces (Mantidas) ---
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// --- A PARTE QUE ESTÁ FALTANDO ---

const api = axios.create({
  // Adicione o http:// na frente!
  baseURL: 'http://192.168.1.178:8000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adiciona o token em todas as chamadas se ele existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('AUTH_TOKEN_KEY'); // Ajuste para sua constante
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Isso é o que o seu AuthContext está tentando importar!
export const apiService = {
  async get<T>(url: string): Promise<T> {
    const response = await api.get<T>(url);
    return response.data;
  },
  async post<T>(url: string, data: any): Promise<T> {
    const response = await api.post<T>(url, data);
    return response.data;
  },
};
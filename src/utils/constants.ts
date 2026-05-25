// API
const getApiUrl = () => {
  // Em desenvolvimento local
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000/api';
  }
  // Em produção, usa o mesmo host
  return `http://${window.location.hostname}:8000/api`;
};

// export const API_BASE_URL = getApiUrl( );
export const API_BASE_URL = 'http://192.168.1.178:8000';
export const API_TIMEOUT = 30000; // 30 segundos

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  MOTORISTA_ID: 'motorista_id',
  USER_PREFERENCES: 'user_preferences',
  SYNC_QUEUE: 'sync_queue',
};

// IndexedDB
export const INDEXEDDB_NAME = 'app_motorista_db';
export const INDEXEDDB_VERSION = 1;
export const INDEXEDDB_STORES = {
  ENTREGAS: 'entregas',
  CONFIRMACOES: 'confirmacoes',
  SYNC_QUEUE: 'sync_queue',
};

// Status de Entrega
export const ENTREGA_STATUS = {
  PENDENTE: 'pendente',
  EM_ANDAMENTO: 'em_andamento',
  ENTREGUE: 'entregue',
  FALHA: 'falha',
};

export const ENTREGA_STATUS_LABELS = {
  pendente: 'Pendente',
  em_andamento: 'Em Andamento',
  entregue: 'Entregue',
  falha: 'Falha na Entrega',
};

export const ENTREGA_STATUS_COLORS = {
  pendente: 'bg-gray-100 text-gray-800',
  em_andamento: 'bg-blue-100 text-blue-800',
  entregue: 'bg-green-100 text-green-800',
  falha: 'bg-red-100 text-red-800',
};

// GPS
export const GPS_CONFIG = {
  ACCURACY: 'best' as const,
  DISTANCE_FILTER: 10, // metros
  TIMEOUT: 5000, // ms
  ENABLE_HIGH_ACCURACY: true,
};

// Validação
export const VALIDATION = {
  CPF_PATTERN: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  PHONE_PATTERN: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// Paginação
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// Timeouts
export const TIMEOUTS = {
  DEBOUNCE: 300,
  THROTTLE: 500,
  TOAST_DURATION: 3000,
  MODAL_ANIMATION: 300,
};

// Limites
export const LIMITS = {
  MAX_FOTO_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_ASSINATURA_SIZE: 1 * 1024 * 1024, // 1MB
  MAX_TENTATIVAS_ENTREGA: 3,
};

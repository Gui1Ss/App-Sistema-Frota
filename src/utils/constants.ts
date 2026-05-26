// API
export const API_BASE_URL = 'http://192.168.1.178:8000';
export const API_TIMEOUT = 30000; // 30 segundos

// Storage Keys (AsyncStorage)
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  MOTORISTA_DATA: 'motorista_data',
  USER_PREFERENCES: 'user_preferences',
  SYNC_QUEUE: 'sync_queue',
};

// Status de Entrega
export const ENTREGA_STATUS = {
  PENDENTE: 'pendente',
  EM_ANDAMENTO: 'em_andamento',
  ENTREGUE: 'entregue',
  FALHA: 'falha',
};

export const ENTREGA_STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em Andamento',
  entregue: 'Entregue',
  falha: 'Falha na Entrega',
};

export const ENTREGA_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pendente: { bg: '#F3F4F6', text: '#374151' },
  em_andamento: { bg: '#DBEAFE', text: '#1E40AF' },
  entregue: { bg: '#D1FAE5', text: '#065F46' },
  falha: { bg: '#FEE2E2', text: '#991B1B' },
};

// GPS
export const GPS_CONFIG = {
  ACCURACY: 'best' as const,
  DISTANCE_FILTER: 10,
  TIMEOUT: 5000,
  ENABLE_HIGH_ACCURACY: true,
};

// Validação
export const VALIDATION = {
  CPF_PATTERN: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  PHONE_PATTERN: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// Timeouts
export const TIMEOUTS = {
  DEBOUNCE: 300,
  THROTTLE: 500,
  TOAST_DURATION: 3000,
};

// Limites
export const LIMITS = {
  MAX_FOTO_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_ASSINATURA_SIZE: 1 * 1024 * 1024, // 1MB
  MAX_TENTATIVAS_ENTREGA: 3,
};

// Cores do tema
export const COLORS = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  secondary: '#6B7280',
  success: '#10B981',
  successDark: '#059669',
  danger: '#EF4444',
  dangerDark: '#DC2626',
  warning: '#F59E0B',
  background: '#F9FAFB',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};

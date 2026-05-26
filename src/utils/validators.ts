import { VALIDATION } from './constants';

/**
 * Valida CPF
 */
export const validateCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  if (cleaned.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;

  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[10])) return false;

  return true;
};

/**
 * Valida email
 */
export const validateEmail = (email: string): boolean => {
  return VALIDATION.EMAIL_PATTERN.test(email);
};

/**
 * Valida telefone
 */
export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 11;
};

/**
 * Valida CEP
 */
export const validateCEP = (cep: string): boolean => {
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.length === 8;
};

/**
 * Valida senha
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Senha deve ter no mínimo 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida coordenadas GPS
 */
export const validateCoordinates = (
  latitude: number,
  longitude: number
): boolean => {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

/**
 * Valida tamanho de arquivo
 */
export const validateFileSize = (
  file: File,
  maxSizeInMB: number
): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

/**
 * Valida tipo de arquivo
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[]
): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Valida imagem
 */
export const validateImage = (file: File): {
  isValid: boolean;
  error?: string;
} => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSizeInMB = 5;

  if (!validateFileType(file, allowedTypes)) {
    return {
      isValid: false,
      error: 'Tipo de arquivo não suportado. Use JPEG, PNG ou WebP',
    };
  }

  if (!validateFileSize(file, maxSizeInMB)) {
    return {
      isValid: false,
      error: `Arquivo muito grande. Máximo ${maxSizeInMB}MB`,
    };
  }

  return { isValid: true };
};

/**
 * Valida formulário de login
 */
export const validateLoginForm = (cpf: string, password: string): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};

  if (!cpf) {
    errors.cpf = 'CPF é obrigatório';
  } else if (!validateCPF(cpf)) {
    errors.cpf = 'CPF inválido';
  }

  if (!password) {
    errors.password = 'Senha é obrigatória';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Valida formulário de entrega
 */
export const validateEntregaForm = (data: {
  endereco?: string;
  numero?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};

  if (!data.endereco) {
    errors.endereco = 'Endereço é obrigatório';
  }

  if (!data.numero) {
    errors.numero = 'Número é obrigatório';
  }

  if (!data.cidade) {
    errors.cidade = 'Cidade é obrigatória';
  }

  if (!data.estado) {
    errors.estado = 'Estado é obrigatório';
  }

  if (!data.cep || !validateCEP(data.cep)) {
    errors.cep = 'CEP inválido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

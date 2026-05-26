export interface LoginRequest {
  cpf: string;
  passwordHash: string;
}

export interface LoginResponse {
  access_token: string;
  driver: DriverResponse;
}

export interface DriverResponse {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email?: string;
  licensenumber: string;
  licenseexpiry?: string;
  licensecategory?: string;
  status: string;
  createdat?: string;
  updatedat?: string;
}

export interface Motorista {
  id: string;
  nome: string;
  cpf: string;
  cnh: string;
  telefone: string;
  email?: string;
  categoria?: string;
  cnhValidade?: string;
  status: 'ativo' | 'inativo' | 'bloqueado' | string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface AuthContextType {
  motorista: Motorista | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (cpf: string, senha: string) => Promise<void>;
  logout: () => void;
}

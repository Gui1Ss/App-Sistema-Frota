export interface LoginRequest {
  cpf: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  motorista: Motorista;
}

export interface Motorista {
  id: string;
  nome: string;
  cpf: string;
  cnh: string;
  telefone: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  cnhValidade?: string;
  status: 'ativo' | 'inativo' | 'bloqueado';
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

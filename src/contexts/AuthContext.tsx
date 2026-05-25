import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

export interface Motorista {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  licensenumber: string;
}

export interface AuthContextType {
  motorista: Motorista | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (cpf: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  MOTORISTA_ID: 'motorista_id',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [motorista, setMotorista] = useState<Motorista | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Restaurar sessão ao carregar
  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const login = async (cpf: string, senha: string) => {
    setIsLoading(true);
    try {
      // Remover formatação do CPF
      const cpfLimpo = cpf.replace(/\D/g, '');
      
      const response = await apiService.post<{
        token: string;
        motorista: Motorista;
      }>('/api/login', { cpf: cpfLimpo, senha });
      
      const { token: newToken, motorista: motoristData } = response;
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
      localStorage.setItem(STORAGE_KEYS.MOTORISTA_ID, motoristData.id);
      setToken(newToken);
      setMotorista(motoristData);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.MOTORISTA_ID);
    setToken(null);
    setMotorista(null);
  };

  const value: AuthContextType = {
    motorista,
    token,
    isLoading,
    isAuthenticated: !!token && !!motorista,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

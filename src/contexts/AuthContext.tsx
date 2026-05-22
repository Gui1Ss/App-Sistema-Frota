import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Motorista, AuthContextType } from '../types/auth';
import { apiService } from '../services/api';
import { STORAGE_KEYS } from '../utils/constants';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [motorista, setMotorista] = useState<Motorista | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializa contexto ao montar
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (savedToken) {
          setToken(savedToken);
          // Valida token no backend
          const response = await apiService.get<{ motorista: Motorista }>(
            '/motoristas/me'
          );
          setMotorista(response.motorista);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (cpf: string, senha: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.post<{
        token: string;
        motorista: Motorista;
      }>('/login', { cpf, senha });

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

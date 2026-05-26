import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Motorista, AuthContextType } from '../types/auth';
import { apiService } from '../services/api';
import { STORAGE_KEYS } from '../utils/constants';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [motorista, setMotorista] = useState<Motorista | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (savedToken) {
          setToken(savedToken);
          const savedMotorista = await AsyncStorage.getItem(STORAGE_KEYS.MOTORISTA_DATA);
          if (savedMotorista) {
            try {
              setMotorista(JSON.parse(savedMotorista));
            } catch (e) {
              console.error('Erro ao parsear motorista salvo:', e);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (cpf: string, passwordHash: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.post<any>('/drivers/login', {
        cpf,
        passwordHash,
      });

      const newToken = response.access_token;
      const driverData = response.driver;

      if (!newToken) {
        throw new Error('Token não recebido do servidor');
      }

      const motoristaFormatado: Motorista = {
        id: driverData.id,
        nome: driverData.name,
        cpf: driverData.cpf,
        telefone: driverData.phone,
        email: driverData.email,
        cnh: driverData.licensenumber,
        cnhValidade: driverData.licenseexpiry,
        categoria: driverData.licensecategory,
        status: driverData.status,
        criadoEm: driverData.createdat || new Date().toISOString(),
        atualizadoEm: driverData.updatedat || new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
      await AsyncStorage.setItem(STORAGE_KEYS.MOTORISTA_DATA, JSON.stringify(motoristaFormatado));

      setToken(newToken);
      setMotorista(motoristaFormatado);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.MOTORISTA_DATA);
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

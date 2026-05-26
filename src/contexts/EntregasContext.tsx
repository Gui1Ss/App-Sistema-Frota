import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Entrega, ConfirmacaoEntrega, EntregasContextType } from '../types/entrega';
import { apiService } from '../services/api';
import { STORAGE_KEYS } from '../utils/constants';

const EntregasContext = createContext<EntregasContextType | undefined>(undefined);

export const EntregasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [entregaSelecionada, setEntregaSelecionada] = useState<Entrega | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarEntregas = async (rotaId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.get<Entrega[]>(`/entregas/rota/${rotaId}`);
      setEntregas(response);
      // Cache local
      await AsyncStorage.setItem(
        `entregas_${rotaId}`,
        JSON.stringify({ data: response, timestamp: Date.now() })
      );
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar entregas');
      // Tenta carregar do cache
      try {
        const cached = await AsyncStorage.getItem(`entregas_${rotaId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          setEntregas(parsed.data);
        }
      } catch (cacheErr) {
        console.error('Erro ao carregar cache:', cacheErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selecionarEntrega = (entrega: Entrega) => {
    setEntregaSelecionada(entrega);
  };

  const atualizarStatus = async (entregaId: string, status: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.put<Entrega>(`/entregas/${entregaId}/status`, { status });
      setEntregas((prev) => prev.map((e) => (e.id === entregaId ? response : e)));
      if (entregaSelecionada?.id === entregaId) {
        setEntregaSelecionada(response);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar status');
      // Salva na fila de sincronização
      try {
        const syncQueue = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
        const queue = syncQueue ? JSON.parse(syncQueue) : [];
        queue.push({
          id: `sync_${entregaId}_${Date.now()}`,
          type: 'update_status',
          entregaId,
          status,
          timestamp: Date.now(),
          pending: true,
        });
        await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
      } catch (e) {
        console.error('Erro ao salvar na fila de sync:', e);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmarEntrega = async (confirmacao: ConfirmacaoEntrega) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      // Monta FormData com URI da foto (React Native)
      const formData = new FormData();

      // Adiciona a foto como arquivo
      const fotoFileName = confirmacao.fotoUri.split('/').pop() || 'foto.jpg';
      const fotoType = fotoFileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
      (formData as any).append('foto', {
        uri: confirmacao.fotoUri,
        name: fotoFileName,
        type: fotoType,
      });

      formData.append('assinatura', confirmacao.assinatura);
      formData.append('latitude', confirmacao.latitude.toString());
      formData.append('longitude', confirmacao.longitude.toString());
      if (confirmacao.observacoes) {
        formData.append('observacoes', confirmacao.observacoes);
      }

      const response = await fetch(
        `http://192.168.1.178:8000/api/entregas/${confirmacao.entregaId}/confirmar`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao confirmar entrega');
      }

      const data = await response.json();
      setEntregas((prev) => prev.map((e) => (e.id === confirmacao.entregaId ? data : e)));
    } catch (err: any) {
      setError(err.message || 'Erro ao confirmar entrega');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: EntregasContextType = {
    entregas,
    entregaSelecionada,
    isLoading,
    error,
    carregarEntregas,
    selecionarEntrega,
    atualizarStatus,
    confirmarEntrega,
  };

  return <EntregasContext.Provider value={value}>{children}</EntregasContext.Provider>;
};

export const useEntregas = (): EntregasContextType => {
  const context = useContext(EntregasContext);
  if (!context) {
    throw new Error('useEntregas deve ser usado dentro de EntregasProvider');
  }
  return context;
};

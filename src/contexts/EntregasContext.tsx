import React, { createContext, useContext, useState } from 'react';
import type { Entrega, EntregasContextType, ConfirmacaoEntrega } from '../types/entrega';
import { apiService } from '../services/api';
import { storageService } from '../services/storage';
import { INDEXEDDB_STORES } from '../utils/constants';

const EntregasContext = createContext<EntregasContextType | undefined>(undefined);

export const EntregasProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [entregaSelecionada, setEntregaSelecionada] = useState<Entrega | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarEntregas = async (rotaId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.get<Entrega[]>(
        `/entregas/rota/${rotaId}`
      );
      setEntregas(response);

      // Salva em cache local
      await storageService.save(INDEXEDDB_STORES.ENTREGAS, {
        id: `entregas_${rotaId}`,
        data: response,
        timestamp: Date.now(),
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar entregas');

      // Tenta carregar do cache
      const cached = await storageService.get<any>(
        INDEXEDDB_STORES.ENTREGAS,
        `entregas_${rotaId}`
      );
      if (cached) {
        setEntregas(cached.data);
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
      const response = await apiService.put<Entrega>(
        `/entregas/${entregaId}/status`,
        { status }
      );

      // Atualiza lista local
      setEntregas((prev) =>
        prev.map((e) => (e.id === entregaId ? response : e))
      );

      // Atualiza selecionada
      if (entregaSelecionada?.id === entregaId) {
        setEntregaSelecionada(response);
      }

      // Salva na fila de sincronização
      await storageService.save(INDEXEDDB_STORES.SYNC_QUEUE, {
        id: `sync_${entregaId}_${Date.now()}`,
        type: 'update_status',
        entregaId,
        status,
        timestamp: Date.now(),
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar status');

      // Salva na fila para sincronizar depois
      await storageService.save(INDEXEDDB_STORES.SYNC_QUEUE, {
        id: `sync_${entregaId}_${Date.now()}`,
        type: 'update_status',
        entregaId,
        status,
        timestamp: Date.now(),
        pending: true,
      });

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmarEntrega = async (confirmacao: ConfirmacaoEntrega) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('foto', confirmacao.foto);
      formData.append('assinatura', confirmacao.assinatura);
      formData.append('latitude', confirmacao.latitude.toString());
      formData.append('longitude', confirmacao.longitude.toString());
      if (confirmacao.observacoes) {
        formData.append('observacoes', confirmacao.observacoes);
      }

      const response = await fetch(
        `http://localhost:8000/api/entregas/${confirmacao.entregaId}/confirmar`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao confirmar entrega');
      }

      const data = await response.json();

      // Atualiza lista local
      setEntregas((prev) =>
        prev.map((e) => (e.id === confirmacao.entregaId ? data : e))
      );

      // Salva confirmação localmente
      await storageService.save(INDEXEDDB_STORES.CONFIRMACOES, {
        id: confirmacao.entregaId,
        ...confirmacao,
        timestamp: Date.now(),
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao confirmar entrega');

      // Salva para sincronizar depois
      await storageService.save(INDEXEDDB_STORES.SYNC_QUEUE, {
        id: `sync_${confirmacao.entregaId}_${Date.now()}`,
        type: 'confirmar_entrega',
        confirmacao,
        timestamp: Date.now(),
        pending: true,
      });

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

  return (
    <EntregasContext.Provider value={value}>{children}</EntregasContext.Provider>
  );
};

export const useEntregas = (): EntregasContextType => {
  const context = useContext(EntregasContext);
  if (!context) {
    throw new Error('useEntregas deve ser usado dentro de EntregasProvider');
  }
  return context;
};

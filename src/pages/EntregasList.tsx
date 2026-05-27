import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { Loading } from '../components/Loading';
import { useAuth } from '../contexts/AuthContext';
import { useEntregas } from '../contexts/EntregasContext';
import type { Entrega } from '../types/entrega';
import { ENTREGA_STATUS_COLORS, ENTREGA_STATUS_LABELS } from '../utils/constants';

export const EntregasList: React.FC = () => {
  const [, setLocation] = useLocation();
  const { motorista } = useAuth();
  const { entregas, isLoading, carregarEntregas, selecionarEntrega } = useEntregas();

  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [entregasFiltradas, setEntregasFiltradas] = useState<Entrega[]>([]);

  useEffect(() => {
    // Carrega entregas da rota do motorista
    if (motorista?.id) {
      carregarEntregas(motorista.cpf);
    }
  }, [motorista?.id, carregarEntregas]);

  useEffect(() => {
    let filtered = entregas;

    // Filtro por status
    if (statusFiltro) {
      filtered = filtered.filter((e) => e.status === statusFiltro);
    }

    // Filtro por texto (cliente, endereço)
    if (filtro) {
      const termo = filtro.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.address?.toLowerCase().includes(termo) ||
          e.city?.toLowerCase().includes(termo)
      );
    }

    setEntregasFiltradas(filtered);
  }, [entregas, filtro, statusFiltro]);

  const handleSelectEntrega = (entrega: Entrega) => {
    selecionarEntrega(entrega);
    setLocation(`/entregas/${entrega.id}`);
  };

  if (isLoading) {
    return <Loading fullScreen message="Carregando entregas..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Entregas" subtitle="Sua rota de hoje" />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filtros */}
        <Card className="mb-6">
          <div className="space-y-4">
            <Input
              placeholder="Buscar por endereço ou cidade..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              icon={<span>🔍</span>}
            />

            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFiltro === '' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFiltro('')}
              >
                Todas ({entregas.length})
              </Button>
              <Button
                variant={statusFiltro === 'pendente' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFiltro('pendente')}
              >
                Pendentes ({entregas.filter((e) => e.status === 'pendente').length})
              </Button>
              <Button
                variant={statusFiltro === 'em_rota' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFiltro('em_rota')}
              >
                Em Andamento ({entregas.filter((e) => e.status === 'em_rota').length})
              </Button>
              <Button
                variant={statusFiltro === 'entregue' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFiltro('entregue')}
              >
                Concluídas ({entregas.filter((e) => e.status === 'entregue').length})
              </Button>
            </div>
          </div>
        </Card>

        {/* Lista de Entregas */}
        {entregasFiltradas.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600 text-lg">Nenhuma entrega encontrada</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {entregasFiltradas.map((entrega) => (
              <Card
                key={entrega.id}
                hoverable
                onClick={() => handleSelectEntrega(entrega)}
              >
                <div className="flex justify-center items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {entrega.address}, {entrega.address_number}
                      </h3>
                      <span
                        className={`text-xs text-nowrap px-2 py-1 rounded-full ${
                          ENTREGA_STATUS_COLORS[entrega.status as keyof typeof ENTREGA_STATUS_COLORS]
                        }`}
                      >
                        {ENTREGA_STATUS_LABELS[entrega.status as keyof typeof ENTREGA_STATUS_LABELS]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 ml-1">
                      {entrega.city}, {entrega.state} - {entrega.zipcode}
                    </p>
                  </div>
                  <span className="text-2xl ml-4 mb-10">→</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Botão Voltar */}
        <div className="mt-8">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setLocation('/dashboard')}
          >
            ← Voltar
          </Button>
        </div>
      </main>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useRouter } from 'wouter';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Loading } from '../components/Loading';
import { useEntregas } from '../contexts/EntregasContext';
import { useAuth } from '../contexts/AuthContext';
import { ENTREGA_STATUS_LABELS, ENTREGA_STATUS_COLORS } from '../utils/constants';
import type { Entrega } from '../types/entrega';

export const EntregasList: React.FC = () => {
  const [, navigate] = useRouter() as any;
  const { motorista } = useAuth();
  const { entregas, isLoading, carregarEntregas, selecionarEntrega } = useEntregas();

  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [entregasFiltradas, setEntregasFiltradas] = useState<Entrega[]>([]);

  useEffect(() => {
    // Carrega entregas da rota do motorista
    if (motorista?.id) {
      carregarEntregas(motorista.id);
    }
  }, [motorista?.id]);

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
          e.endereco?.toLowerCase().includes(termo) ||
          e.cidade?.toLowerCase().includes(termo)
      );
    }

    setEntregasFiltradas(filtered);
  }, [entregas, filtro, statusFiltro]);

  const handleSelectEntrega = (entrega: Entrega) => {
    selecionarEntrega(entrega);
    navigate(`/entregas/${entrega.id}`);
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
                variant={statusFiltro === 'em_andamento' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFiltro('em_andamento')}
              >
                Em Andamento ({entregas.filter((e) => e.status === 'em_andamento').length})
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
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {entrega.endereco}, {entrega.numero}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          ENTREGA_STATUS_COLORS[entrega.status as keyof typeof ENTREGA_STATUS_COLORS]
                        }`}
                      >
                        {ENTREGA_STATUS_LABELS[entrega.status as keyof typeof ENTREGA_STATUS_LABELS]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {entrega.cidade}, {entrega.estado} - {entrega.cep}
                    </p>
                    {entrega.complemento && (
                      <p className="text-sm text-gray-500 mt-1">{entrega.complemento}</p>
                    )}
                  </div>
                  <span className="text-2xl ml-4">→</span>
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
            onClick={() => navigate('/dashboard')}
          >
            ← Voltar
          </Button>
        </div>
      </main>
    </div>
  );
};

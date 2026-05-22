import React, { useEffect, useState } from 'react';
import { useRouter } from 'wouter';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { apiService } from '../services/api';
import { formatDate } from '../utils/formatters';
import type { Entrega } from '../types/entrega';

export const Historico: React.FC = () => {
  const [, navigate] = useRouter() as any;

  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroData, setFiltroData] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const loadHistorico = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.get<Entrega[]>(
          `/entregas?status=entregue&data=${filtroData}`
        );
        setEntregas(response);
      } catch (error: any) {
        console.error('Erro ao carregar histórico:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistorico();
  }, [filtroData]);

  if (isLoading) {
    return <Loading fullScreen message="Carregando histórico..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Histórico de Entregas"
        subtitle="Entregas concluídas"
      />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filtro de Data */}
        <Card className="mb-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data
              </label>
              <input
                type="date"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </Card>

        {/* Lista de Entregas */}
        {entregas.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600 text-lg">Nenhuma entrega concluída nesta data</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {entregas.map((entrega) => (
              <Card key={entrega.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {entrega.endereco}, {entrega.numero}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {entrega.cidade}, {entrega.estado} - {entrega.cep}
                    </p>

                    {/* Fotos e Assinatura */}
                    {(entrega.fotoConfirmacao || entrega.assinatura) && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {entrega.fotoConfirmacao && (
                          <div>
                            <p className="text-xs text-gray-600 mb-2">Foto</p>
                            <img
                              src={entrega.fotoConfirmacao}
                              alt="Foto da entrega"
                              className="w-full h-24 object-cover rounded"
                            />
                          </div>
                        )}
                        {entrega.assinatura && (
                          <div>
                            <p className="text-xs text-gray-600 mb-2">Assinatura</p>
                            <img
                              src={entrega.assinatura}
                              alt="Assinatura"
                              className="w-full h-24 object-cover rounded bg-white"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Informações */}
                    <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                      <p>
                        Entregue em:{' '}
                        <span className="font-medium">
                          {entrega.dataEntrega
                            ? formatDate(entrega.dataEntrega)
                            : 'N/A'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <span className="text-2xl ml-4">✓</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Estatísticas */}
        {entregas.length > 0 && (
          <Card className="mt-6 bg-gradient-to-r from-success to-green-600 text-white">
            <div className="text-center">
              <p className="text-green-100">Total de Entregas Concluídas</p>
              <p className="text-4xl font-bold mt-2">{entregas.length}</p>
            </div>
          </Card>
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

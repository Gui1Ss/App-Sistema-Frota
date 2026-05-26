import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { useEntregas } from '../contexts/EntregasContext';
import { useToast } from '../components/Toast';
import { apiService } from '../services/api';
import { ENTREGA_STATUS_LABELS, ENTREGA_STATUS_COLORS } from '../utils/constants';
import type { Entrega } from '../types/entrega';

export const EntregaDetails: React.FC = () => {
  const [, setLocation] = useLocation();
  const params = useParams();
  const entregaId = params.id;

  const { entregaSelecionada, atualizarStatus } = useEntregas();
  const { show: showToast } = useToast();

  const [entrega, setEntrega] = useState<Entrega | null>(entregaSelecionada || null);
  const [isLoading, setIsLoading] = useState(!entregaSelecionada);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!entregaSelecionada && entregaId) {
      const loadEntrega = async () => {
        try {
          const response = await apiService.get<Entrega>(`/entregas/${entregaId}`);
          setEntrega(response);
        } catch (error: any) {
          showToast('Erro ao carregar entrega', 'error');
          setLocation('/entregas');
        } finally {
          setIsLoading(false);
        }
      };

      loadEntrega();
    }
  }, [entregaId, entregaSelecionada, setLocation, showToast]);

  const handleSaiuParaEntrega = async () => {
    if (!entrega) return;

    setIsUpdating(true);
    try {
      await atualizarStatus(entrega.id, 'em_andamento');
      showToast('Status atualizado para "Em Andamento"', 'success');

      // Envia WhatsApp (comentado por enquanto)
      // await apiService.post('/whatsapp/send', {
      //   telefone: entrega.clienteId,
      //   mensagem: `Olá! Sua entrega está a caminho. Motorista: ${entrega.motorista}`,
      // });

      showToast('WhatsApp enviado com sucesso!', 'success');
      setLocation('/entregas');
    } catch (error: any) {
      showToast(error.message || 'Erro ao atualizar status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmarEntrega = () => {
    if (!entrega) return;
    setLocation(`/confirmar/${entrega.id}`);
  };

  if (isLoading) {
    return <Loading fullScreen message="Carregando detalhes..." />;
  }

  if (!entrega) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <p className="text-danger mb-4">Entrega não encontrada</p>
          <Button onClick={() => setLocation('/entregas')}>Voltar</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Detalhes da Entrega"
        subtitle={`${entrega.endereco}, ${entrega.numero}`}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Status */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status Atual</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {ENTREGA_STATUS_LABELS[entrega.status as keyof typeof ENTREGA_STATUS_LABELS]}
              </p>
            </div>
            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold ${
                ENTREGA_STATUS_COLORS[entrega.status as keyof typeof ENTREGA_STATUS_COLORS]
              }`}
            >
              {ENTREGA_STATUS_LABELS[entrega.status as keyof typeof ENTREGA_STATUS_LABELS]}
            </span>
          </div>
        </Card>

        {/* Informações da Entrega */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Endereço */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">📍 Endereço</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Rua</p>
                <p className="text-gray-900 font-medium">{entrega.endereco}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Número</p>
                  <p className="text-gray-900 font-medium">{entrega.numero}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Complemento</p>
                  <p className="text-gray-900 font-medium">
                    {entrega.complemento || '-'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Cidade</p>
                  <p className="text-gray-900 font-medium">{entrega.cidade}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <p className="text-gray-900 font-medium">{entrega.estado}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">CEP</p>
                <p className="text-gray-900 font-medium">{entrega.cep}</p>
              </div>
            </div>
          </Card>

          {/* Informações Adicionais */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">ℹ️ Informações</h3>
            <div className="space-y-2">
              <div>
                  <p className="text-sm text-gray-600">ID</p>
                <p className="text-gray-900 font-medium">{entrega.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tentativas</p>
                <p className="text-gray-900 font-medium">{entrega.tentativas}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Criado em</p>
                <p className="text-gray-900 font-medium">
                  {new Date(entrega.criadoEm).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Observações */}
        {entrega.observacoes && (
          <Card className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">📝 Observações</h3>
            <p className="text-gray-700">{entrega.observacoes}</p>
          </Card>
        )}

        {/* Ações */}
        <Card>
          <div className="space-y-3">
            {entrega.status === 'pendente' && (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isUpdating}
                onClick={handleSaiuParaEntrega}
              >
                🚗 Saiu para Entrega
              </Button>
            )}

            {entrega.status === 'em_andamento' && (
              <Button
                variant="success"
                size="lg"
                fullWidth
                onClick={handleConfirmarEntrega}
              >
                ✓ Confirmar Entrega
              </Button>
            )}

            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => setLocation('/entregas')}
            >
              ← Voltar
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

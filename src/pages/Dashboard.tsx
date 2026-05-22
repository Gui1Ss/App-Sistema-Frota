import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { useAuth } from '../contexts/AuthContext';
import { useEntregas } from '../contexts/EntregasContext';
import { apiService } from '../services/api';

interface DashboardData {
  totalEntregas: number;
  pendentes: number;
  emAndamento: number;
  concluidas: number;
  rotaAtual: {
    id: string;
    numero: string;
    dataInicio: string;
  } | null;
}

export const Dashboard: React.FC = () => {
  const [, setLocation] = useLocation();
  const { motorista, logout } = useAuth();
  const { carregarEntregas } = useEntregas();

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.get<DashboardData>('/dashboard/motorista');
        setData(response);

        // Carrega entregas da rota atual
        if (response.rotaAtual) {
          await carregarEntregas(response.rotaAtual.id);
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  if (isLoading) {
    return <Loading fullScreen message="Carregando dashboard..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <div className="text-center">
            <p className="text-danger mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Dashboard"
        subtitle={`Bem-vindo, ${motorista?.nome}`}
        showUserInfo={true}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Rota Atual */}
        {data?.rotaAtual && (
          <Card className="mb-6 bg-gradient-to-r from-primary to-blue-600 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold mb-2">Rota do Dia</h3>
                <p className="text-blue-100">Rota #{data.rotaAtual.numero}</p>
              </div>
              <span className="text-3xl">📍</span>
            </div>
          </Card>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm">Total de Entregas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {data?.totalEntregas || 0}
                </p>
              </div>
              <span className="text-2xl">📦</span>
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm">Pendentes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {data?.pendentes || 0}
                </p>
              </div>
              <span className="text-2xl">⏳</span>
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm">Em Andamento</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {data?.emAndamento || 0}
                </p>
              </div>
              <span className="text-2xl">🚗</span>
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm">Concluídas</p>
                <p className="text-3xl font-bold text-success mt-2">
                  {data?.concluidas || 0}
                </p>
              </div>
              <span className="text-2xl">✓</span>
            </div>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <Card className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => setLocation('/entregas')}
            >
              📋 Ver Entregas
            </Button>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => setLocation('/historico')}
            >
              📊 Histórico
            </Button>
          </div>
        </Card>

        {/* Logout */}
        <div className="flex justify-end">
          <Button variant="danger" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </main>
    </div>
  );
};

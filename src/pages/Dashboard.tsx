import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
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
    createdat: string;
  } | null;
}

export const Dashboard: React.FC = () => {
  const [, setLocation] = useLocation();
  const { motorista, logout } = useAuth();
  const { carregarEntregas } = useEntregas();

  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await apiService.get<DashboardData>(`/app/dashboard/${motorista?.cpf}`);
        setData(response);

        // Carrega entregas da rota atual
        if (response.rotaAtual) {
          await carregarEntregas(response.rotaAtual.id);
        }
      } catch (err: any) {
        console.error('Erro ao carregar dashboard:', err);
        // Não travar a tela se o dashboard falhar (endpoint pode não existir ainda)
        setData({
          totalEntregas: 0,
          pendentes: 0,
          emAndamento: 0,
          concluidas: 0,
          rotaAtual: null
        });
      }
    };

    loadDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  // if (isLoading) {
  //   return <Loading fullScreen message="Carregando dashboard..." />;
  // }

  

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
          <Card className="mb-6 bg-gradient-to-tr from-blue-600 to-cyan-600 to-80% text-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold mb-2">Rota do Dia</h3>
                <p className="text-blue-100">Rota #{data.rotaAtual.id}</p>
              </div>
              <span className="text-3xl">📍</span>
            </div>
          </Card>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* <Card>
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
          </Card> */}

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
        <Card className="mb-4">
          <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="secondary"
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
        <div className="flex justify-end">
          <Button variant="danger" className='w-full mt-10' onClick={handleLogout}>
            Sair
          </Button>
        </div>
        {/* Logout */}
        
      </main>
    </div>
  );
};

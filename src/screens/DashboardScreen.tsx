import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useEntregas } from '../contexts/EntregasContext';
import { useToast } from '../contexts/ToastContext';
import { apiService } from '../services/api';
import { DashboardData } from '../types/entrega';
import { RootStackParamList } from '../navigation/types';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import { COLORS } from '../utils/constants';

type DashboardNavProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardNavProp>();
  const { motorista, logout } = useAuth();
  const { carregarEntregas } = useEntregas();
  const { showToast } = useToast();

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      const response = await apiService.get<DashboardData>('/drivers');
      setData(response);
      if (response.rotaAtual) {
        await carregarEntregas(response.rotaAtual.id);
      }
    } catch (err: any) {
      console.error('Erro ao carregar dashboard:', err);
      setData({
        totalEntregas: 0,
        pendentes: 0,
        emAndamento: 0,
        concluidas: 0,
        rotaAtual: null,
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return <Loading fullScreen message="Carregando dashboard..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Header
        title="Dashboard"
        subtitle={`Bem-vindo, ${motorista?.nome?.split(' ')[0] || ''}`}
        showUserInfo={true}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Rota Atual */}
        {data?.rotaAtual && (
          <Card style={styles.rotaCard}>
            <View style={styles.rotaContent}>
              <View>
                <Text style={styles.rotaTitle}>Rota do Dia</Text>
                <Text style={styles.rotaNumero}>Rota #{data.rotaAtual.numero}</Text>
              </View>
              <Text style={styles.rotaIcon}>📍</Text>
            </View>
          </Card>
        )}

        {/* Estatísticas */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <View>
                <Text style={styles.statLabel}>Em Andamento</Text>
                <Text style={styles.statValue}>{data?.emAndamento || 0}</Text>
              </View>
              <Text style={styles.statIcon}>🚗</Text>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <View>
                <Text style={styles.statLabel}>Concluídas</Text>
                <Text style={[styles.statValue, styles.statValueSuccess]}>
                  {data?.concluidas || 0}
                </Text>
              </View>
              <Text style={styles.statIcon}>✅</Text>
            </View>
          </Card>
        </View>

        {/* Informações do Motorista */}
        {motorista && (
          <Card style={styles.driverCard}>
            <Text style={styles.sectionTitle}>👤 Meus Dados</Text>
            <View style={styles.driverInfo}>
              <View style={styles.driverRow}>
                <Text style={styles.driverLabel}>Nome</Text>
                <Text style={styles.driverValue}>{motorista.nome}</Text>
              </View>
              <View style={styles.driverRow}>
                <Text style={styles.driverLabel}>CPF</Text>
                <Text style={styles.driverValue}>{motorista.cpf}</Text>
              </View>
              {motorista.cnh && (
                <View style={styles.driverRow}>
                  <Text style={styles.driverLabel}>CNH</Text>
                  <Text style={styles.driverValue}>{motorista.cnh}</Text>
                </View>
              )}
              {motorista.telefone && (
                <View style={styles.driverRow}>
                  <Text style={styles.driverLabel}>Telefone</Text>
                  <Text style={styles.driverValue}>{motorista.telefone}</Text>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Ações Rápidas */}
        <Card style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionsGrid}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={() => navigation.navigate('EntregasList')}
              style={styles.actionButton}
            >
              📋 Ver Entregas
            </Button>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onPress={() => navigation.navigate('Historico')}
              style={styles.actionButton}
            >
              📊 Histórico
            </Button>
          </View>
        </Card>

        {/* Logout */}
        <Button
          variant="danger"
          fullWidth
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          Sair da Conta
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  rotaCard: {
    marginBottom: 16,
    backgroundColor: COLORS.primary,
  },
  rotaContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rotaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 4,
  },
  rotaNumero: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  rotaIcon: {
    fontSize: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.gray500,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.gray900,
  },
  statValueSuccess: {
    color: COLORS.success,
  },
  statIcon: {
    fontSize: 28,
  },
  driverCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 12,
  },
  driverInfo: {
    gap: 8,
  },
  driverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  driverLabel: {
    fontSize: 13,
    color: COLORS.gray500,
  },
  driverValue: {
    fontSize: 13,
    color: COLORS.gray900,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
  actionsCard: {
    marginBottom: 16,
  },
  actionsGrid: {
    gap: 10,
  },
  actionButton: {
    marginBottom: 0,
  },
  logoutButton: {
    marginTop: 8,
  },
});

export default DashboardScreen;

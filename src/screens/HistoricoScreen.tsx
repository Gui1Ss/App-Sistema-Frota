import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiService } from '../services/api';
import { Entrega } from '../types/entrega';
import { RootStackParamList } from '../navigation/types';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import { COLORS } from '../utils/constants';
import { formatDate } from '../utils/formatters';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Historico'>;

const HistoricoScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();

  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroData, setFiltroData] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  useEffect(() => {
    loadHistorico();
  }, [filtroData]);

  const loadHistorico = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.get<Entrega[]>(
        `/entregas?status=entregue&data=${filtroData}`
      );
      setEntregas(response);
    } catch (error: any) {
      console.error('Erro ao carregar histórico:', error);
      setEntregas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousDay = () => {
    const date = new Date(filtroData + 'T12:00:00');
    date.setDate(date.getDate() - 1);
    setFiltroData(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const date = new Date(filtroData + 'T12:00:00');
    date.setDate(date.getDate() + 1);
    const today = new Date().toISOString().split('T')[0];
    if (date.toISOString().split('T')[0] <= today) {
      setFiltroData(date.toISOString().split('T')[0]);
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const isToday = filtroData === new Date().toISOString().split('T')[0];

  const renderEntrega = ({ item: entrega }: { item: Entrega }) => (
    <Card style={styles.entregaCard}>
      <View style={styles.entregaHeader}>
        <View style={styles.entregaInfo}>
          <Text style={styles.entregaEndereco}>
            {entrega.endereco}, {entrega.numero}
          </Text>
          <Text style={styles.entregaCidade}>
            {entrega.cidade}, {entrega.estado} - {entrega.cep}
          </Text>
        </View>
        <View style={styles.checkIcon}>
          <Text style={styles.checkIconText}>✓</Text>
        </View>
      </View>

      <View style={styles.entregaFooter}>
        <Text style={styles.entregaData}>
          Entregue em:{' '}
          <Text style={styles.entregaDataValue}>
            {entrega.dataEntrega ? formatDate(entrega.dataEntrega) : 'N/A'}
          </Text>
        </Text>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Header
        title="Histórico"
        subtitle="Entregas concluídas"
        showBackButton
        onBack={() => navigation.navigate('Dashboard')}
      />

      {/* Seletor de Data */}
      <View style={styles.dateSelector}>
        <TouchableOpacity onPress={handlePreviousDay} style={styles.dateArrow}>
          <Text style={styles.dateArrowText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>{formatDisplayDate(filtroData)}</Text>
          {isToday && <Text style={styles.todayBadge}>Hoje</Text>}
        </View>
        <TouchableOpacity
          onPress={handleNextDay}
          style={[styles.dateArrow, isToday && styles.dateArrowDisabled]}
          disabled={isToday}
        >
          <Text style={[styles.dateArrowText, isToday && styles.dateArrowTextDisabled]}>›</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <Loading message="Carregando histórico..." />
      ) : (
        <FlatList
          data={entregas}
          renderItem={renderEntrega}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>
                Nenhuma entrega concluída nesta data
              </Text>
            </View>
          }
          ListFooterComponent={
            entregas.length > 0 ? (
              <View>
                <Card style={styles.totalCard}>
                  <Text style={styles.totalLabel}>Total de Entregas Concluídas</Text>
                  <Text style={styles.totalValue}>{entregas.length}</Text>
                </Card>
                <Button
                  variant="secondary"
                  fullWidth
                  onPress={() => navigation.navigate('Dashboard')}
                  style={styles.backButton}
                >
                  ← Voltar ao Dashboard
                </Button>
              </View>
            ) : (
              <Button
                variant="secondary"
                fullWidth
                onPress={() => navigation.navigate('Dashboard')}
                style={styles.backButton}
              >
                ← Voltar ao Dashboard
              </Button>
            )
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  dateArrow: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.gray100,
  },
  dateArrowDisabled: {
    opacity: 0.3,
  },
  dateArrowText: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  dateArrowTextDisabled: {
    color: COLORS.gray400,
  },
  dateInfo: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray800,
    textTransform: 'capitalize',
  },
  todayBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  entregaCard: {
    marginBottom: 10,
  },
  entregaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entregaInfo: {
    flex: 1,
    marginRight: 12,
  },
  entregaEndereco: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  entregaCidade: {
    fontSize: 13,
    color: COLORS.gray500,
  },
  checkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIconText: {
    fontSize: 16,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  entregaFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    paddingTop: 8,
  },
  entregaData: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  entregaDataValue: {
    fontWeight: '600',
    color: COLORS.gray700,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.gray500,
    textAlign: 'center',
  },
  totalCard: {
    backgroundColor: COLORS.success,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  backButton: {
    marginTop: 0,
  },
});

export default HistoricoScreen;

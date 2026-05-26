import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useEntregas } from '../contexts/EntregasContext';
import { Entrega } from '../types/entrega';
import { RootStackParamList } from '../navigation/types';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import StatusBadge from '../components/StatusBadge';
import { COLORS, ENTREGA_STATUS_LABELS } from '../utils/constants';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'EntregasList'>;

const EntregasListScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { motorista } = useAuth();
  const { entregas, isLoading, carregarEntregas, selecionarEntrega } = useEntregas();

  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [entregasFiltradas, setEntregasFiltradas] = useState<Entrega[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (motorista?.id) {
      carregarEntregas(motorista.id);
    }
  }, [motorista?.id]);

  useEffect(() => {
    let filtered = entregas;
    if (statusFiltro) {
      filtered = filtered.filter((e) => e.status === statusFiltro);
    }
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

  const handleRefresh = async () => {
    setRefreshing(true);
    if (motorista?.id) {
      await carregarEntregas(motorista.id);
    }
    setRefreshing(false);
  };

  const handleSelectEntrega = (entrega: Entrega) => {
    selecionarEntrega(entrega);
    navigation.navigate('EntregaDetails', { entregaId: entrega.id });
  };

  const statusFilters = [
    { key: '', label: `Todas (${entregas.length})` },
    { key: 'pendente', label: `Pendentes (${entregas.filter((e) => e.status === 'pendente').length})` },
    { key: 'em_andamento', label: `Em Andamento (${entregas.filter((e) => e.status === 'em_andamento').length})` },
    { key: 'entregue', label: `Concluídas (${entregas.filter((e) => e.status === 'entregue').length})` },
  ];

  if (isLoading && !refreshing) {
    return <Loading fullScreen message="Carregando entregas..." />;
  }

  const renderEntrega = ({ item: entrega }: { item: Entrega }) => (
    <Card
      key={entrega.id}
      hoverable
      onPress={() => handleSelectEntrega(entrega)}
      style={styles.entregaCard}
    >
      <View style={styles.entregaHeader}>
        <View style={styles.entregaInfo}>
          <Text style={styles.entregaEndereco} numberOfLines={1}>
            {entrega.endereco}, {entrega.numero}
          </Text>
          <StatusBadge status={entrega.status} />
        </View>
        <Text style={styles.arrowIcon}>›</Text>
      </View>
      <Text style={styles.entregaCidade}>
        {entrega.cidade}, {entrega.estado} - {entrega.cep}
      </Text>
      {entrega.complemento ? (
        <Text style={styles.entregaComplemento}>{entrega.complemento}</Text>
      ) : null}
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Header
        title="Entregas"
        subtitle="Sua rota de hoje"
        showBackButton
        onBack={() => navigation.navigate('Dashboard')}
      />

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por endereço ou cidade..."
            placeholderTextColor={COLORS.gray400}
            value={filtro}
            onChangeText={setFiltro}
          />
          {filtro.length > 0 && (
            <TouchableOpacity onPress={() => setFiltro('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statusFilters}
          contentContainerStyle={styles.statusFiltersContent}
        >
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setStatusFiltro(filter.key)}
              style={[
                styles.filterChip,
                statusFiltro === filter.key && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  statusFiltro === filter.key && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista */}
      {entregasFiltradas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>Nenhuma entrega encontrada</Text>
        </View>
      ) : (
        <FlatList
          data={entregasFiltradas}
          renderItem={renderEntrega}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <Button
              variant="secondary"
              fullWidth
              onPress={() => navigation.navigate('Dashboard')}
              style={styles.backButton}
            >
              ← Voltar ao Dashboard
            </Button>
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
  filtersContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray900,
    padding: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: COLORS.gray400,
    padding: 4,
  },
  statusFilters: {
    marginBottom: 4,
  },
  statusFiltersContent: {
    gap: 8,
    paddingRight: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.gray600,
  },
  filterChipTextActive: {
    color: COLORS.white,
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
    marginBottom: 6,
  },
  entregaInfo: {
    flex: 1,
    marginRight: 8,
    gap: 6,
  },
  entregaEndereco: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  arrowIcon: {
    fontSize: 24,
    color: COLORS.gray400,
    fontWeight: 'bold',
  },
  entregaCidade: {
    fontSize: 13,
    color: COLORS.gray500,
  },
  entregaComplemento: {
    fontSize: 12,
    color: COLORS.gray400,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray500,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 16,
  },
});

export default EntregasListScreen;

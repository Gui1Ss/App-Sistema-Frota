import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEntregas } from '../contexts/EntregasContext';
import { useToast } from '../contexts/ToastContext';
import { Entrega } from '../types/entrega';
import { apiService } from '../services/api';
import { RootStackParamList } from '../navigation/types';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import StatusBadge from '../components/StatusBadge';
import { COLORS, ENTREGA_STATUS_LABELS } from '../utils/constants';
import { formatDate } from '../utils/formatters';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'EntregaDetails'>;
type RouteType = RouteProp<RootStackParamList, 'EntregaDetails'>;

const EntregaDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { entregaId } = route.params;

  const { entregas, entregaSelecionada, selecionarEntrega, atualizarStatus } = useEntregas();
  const { showToast } = useToast();

  const [entrega, setEntrega] = useState<Entrega | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Busca a entrega pelo ID na lista ou usa a selecionada
    const found = entregas.find((e) => e.id === entregaId);
    if (found) {
      setEntrega(found);
      selecionarEntrega(found);
    } else if (entregaSelecionada?.id === entregaId) {
      setEntrega(entregaSelecionada);
    } else {
      // Busca da API se não encontrou localmente
      fetchEntrega();
    }
  }, [entregaId, entregas]);

  const fetchEntrega = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.get<Entrega>(`/entregas/${entregaId}`);
      setEntrega(response);
      selecionarEntrega(response);
    } catch (err: any) {
      showToast('Erro ao carregar entrega', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaiuParaEntrega = async () => {
    if (!entrega) return;
    Alert.alert(
      'Confirmar',
      'Confirmar saída para entrega?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setIsUpdating(true);
            try {
              await atualizarStatus(entrega.id, 'em_andamento');
              setEntrega((prev) => prev ? { ...prev, status: 'em_andamento' } : null);
              showToast('Status atualizado!', 'success');
            } catch (err: any) {
              showToast(err.message || 'Erro ao atualizar status', 'error');
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handleConfirmarEntrega = () => {
    if (!entrega) return;
    navigation.navigate('ConfirmacaoEntrega', { entregaId: entrega.id });
  };

  if (isLoading) {
    return <Loading fullScreen message="Carregando entrega..." />;
  }

  if (!entrega) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <Header title="Detalhes da Entrega" showBackButton onBack={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Entrega não encontrada</Text>
          <Button onPress={() => navigation.navigate('EntregasList')}>Voltar</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Header
        title="Detalhes da Entrega"
        subtitle={`${entrega.endereco}, ${entrega.numero}`}
        showBackButton
        onBack={() => navigation.navigate('EntregasList')}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status */}
        <Card style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.statusLabel}>Status Atual</Text>
              <Text style={styles.statusValue}>
                {ENTREGA_STATUS_LABELS[entrega.status] || entrega.status}
              </Text>
            </View>
            <StatusBadge status={entrega.status} />
          </View>
        </Card>

        {/* Endereço */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>📍 Endereço</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rua</Text>
              <Text style={styles.infoValue}>{entrega.endereco}</Text>
            </View>
            <View style={styles.infoRowGrid}>
              <View style={styles.infoHalf}>
                <Text style={styles.infoLabel}>Número</Text>
                <Text style={styles.infoValue}>{entrega.numero}</Text>
              </View>
              <View style={styles.infoHalf}>
                <Text style={styles.infoLabel}>Complemento</Text>
                <Text style={styles.infoValue}>{entrega.complemento || '-'}</Text>
              </View>
            </View>
            <View style={styles.infoRowGrid}>
              <View style={styles.infoHalf}>
                <Text style={styles.infoLabel}>Cidade</Text>
                <Text style={styles.infoValue}>{entrega.cidade}</Text>
              </View>
              <View style={styles.infoHalf}>
                <Text style={styles.infoLabel}>Estado</Text>
                <Text style={styles.infoValue}>{entrega.estado}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>CEP</Text>
              <Text style={styles.infoValue}>{entrega.cep}</Text>
            </View>
          </View>
        </Card>

        {/* Informações Adicionais */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>ℹ️ Informações</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID</Text>
              <Text style={[styles.infoValue, styles.infoValueMono]} numberOfLines={1}>
                {entrega.id}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tentativas</Text>
              <Text style={styles.infoValue}>{entrega.tentativas}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Criado em</Text>
              <Text style={styles.infoValue}>{formatDate(entrega.criadoEm)}</Text>
            </View>
            {entrega.dataEntrega && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Data Entrega</Text>
                <Text style={styles.infoValue}>{formatDate(entrega.dataEntrega)}</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Observações */}
        {entrega.observacoes ? (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>📝 Observações</Text>
            <Text style={styles.observacoesText}>{entrega.observacoes}</Text>
          </Card>
        ) : null}

        {/* Foto e Assinatura (se já entregue) */}
        {(entrega.fotoConfirmacao || entrega.assinatura) && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>📸 Comprovante</Text>
            <Text style={styles.infoValue}>Entrega confirmada com foto e assinatura</Text>
          </Card>
        )}

        {/* Ações */}
        <Card style={styles.card}>
          <View style={styles.actionsContainer}>
            {entrega.status === 'pendente' && (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isUpdating}
                onPress={handleSaiuParaEntrega}
                style={styles.actionButton}
              >
                🚗 Saiu para Entrega
              </Button>
            )}
            {entrega.status === 'em_andamento' && (
              <Button
                variant="success"
                size="lg"
                fullWidth
                onPress={handleConfirmarEntrega}
                style={styles.actionButton}
              >
                ✓ Confirmar Entrega
              </Button>
            )}
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onPress={() => navigation.navigate('EntregasList')}
            >
              ← Voltar
            </Button>
          </View>
        </Card>
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
    textAlign: 'center',
  },
  statusCard: {
    marginBottom: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 13,
    color: COLORS.gray500,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray900,
  },
  card: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 12,
  },
  infoGrid: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoRowGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  infoHalf: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray900,
    flex: 1,
    textAlign: 'right',
  },
  infoValueMono: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
  },
  observacoesText: {
    fontSize: 14,
    color: COLORS.gray700,
    lineHeight: 20,
  },
  actionsContainer: {
    gap: 10,
  },
  actionButton: {
    marginBottom: 0,
  },
});

// Importar Platform
import { Platform } from 'react-native';

export default EntregaDetailsScreen;

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import SignatureCanvas from 'react-native-signature-canvas';
import { useEntregas } from '../contexts/EntregasContext';
import { useToast } from '../contexts/ToastContext';
import { RootStackParamList } from '../navigation/types';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import { COLORS } from '../utils/constants';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'ConfirmacaoEntrega'>;
type RouteType = RouteProp<RootStackParamList, 'ConfirmacaoEntrega'>;

interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

const ConfirmacaoEntregaScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { entregaId } = route.params;

  const { entregaSelecionada, confirmarEntrega } = useEntregas();
  const { showToast } = useToast();

  const signatureRef = useRef<any>(null);

  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [assinatura, setAssinatura] = useState<string>('');
  const [gpsPosition, setGpsPosition] = useState<GPSPosition | null>(null);
  const [isGPSLoading, setIsGPSLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signatureKey, setSignatureKey] = useState(0);

  useEffect(() => {
    obterLocalizacao();
  }, []);

  const obterLocalizacao = async () => {
    setIsGPSLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast('Permissão de localização negada', 'warning');
        setIsGPSLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setGpsPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
      });
    } catch (error) {
      showToast('Não foi possível obter localização', 'warning');
    } finally {
      setIsGPSLoading(false);
    }
  };

  const handleTirarFoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para tirar a foto da entrega.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setFotoUri(result.assets[0].uri);
      }
    } catch (error) {
      showToast('Erro ao acessar câmera', 'error');
    }
  };

  const handleSelecionarFoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para selecionar a foto.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setFotoUri(result.assets[0].uri);
      }
    } catch (error) {
      showToast('Erro ao acessar galeria', 'error');
    }
  };

  const handleLimparAssinatura = () => {
    if (signatureRef.current) {
      signatureRef.current.clearSignature();
    }
    setAssinatura('');
    setSignatureKey((k) => k + 1);
  };

  const handleSignatureOK = (sig: string) => {
    setAssinatura(sig);
  };

  const handleSignatureEmpty = () => {
    setAssinatura('');
  };

  const handleConfirmar = async () => {
    if (!fotoUri) {
      showToast('Por favor, tire uma foto da entrega', 'warning');
      return;
    }
    if (!assinatura) {
      showToast('Por favor, colete a assinatura do destinatário', 'warning');
      return;
    }
    if (!gpsPosition) {
      showToast('Localização GPS não disponível', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      await confirmarEntrega({
        entregaId,
        fotoUri,
        assinatura,
        latitude: gpsPosition.latitude,
        longitude: gpsPosition.longitude,
      });
      showToast('Entrega confirmada com sucesso!', 'success');
      navigation.navigate('EntregasList');
    } catch (error: any) {
      showToast(error.message || 'Erro ao confirmar entrega', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Entrega selecionada disponível para uso no header

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Header
        title="Confirmar Entrega"
        subtitle={entregaSelecionada?.endereco || 'Confirmação de entrega'}
        showBackButton
        onBack={() => navigation.navigate('EntregasList')}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Foto da Entrega */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>📸 Foto da Entrega</Text>
          {fotoUri ? (
            <View>
              <Image
                source={{ uri: fotoUri }}
                style={styles.fotoPreview}
                resizeMode="cover"
              />
              <View style={styles.fotoActions}>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={handleTirarFoto}
                  style={styles.fotoActionBtn}
                >
                  📷 Nova Foto
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => setFotoUri(null)}
                  style={styles.fotoActionBtn}
                >
                  🗑 Remover
                </Button>
              </View>
            </View>
          ) : (
            <View style={styles.fotoButtons}>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onPress={handleTirarFoto}
                style={styles.fotoButton}
              >
                📷 Tirar Foto
              </Button>
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onPress={handleSelecionarFoto}
              >
                🖼 Escolher da Galeria
              </Button>
            </View>
          )}
        </Card>

        {/* Assinatura */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>✍️ Assinatura do Destinatário</Text>
          <Text style={styles.signatureHint}>Peça ao destinatário para assinar abaixo</Text>
          <View style={styles.signatureContainer}>
            <SignatureCanvas
              key={signatureKey}
              ref={signatureRef}
              onOK={handleSignatureOK}
              onEmpty={handleSignatureEmpty}
              descriptionText=""
              clearText="Limpar"
              confirmText="Confirmar"
              webStyle={`
                .m-signature-pad {
                  box-shadow: none;
                  border: none;
                }
                .m-signature-pad--body {
                  border: 1px solid #D1D5DB;
                  border-radius: 8px;
                }
                .m-signature-pad--footer {
                  display: none;
                }
                body, html {
                  background-color: #FFFFFF;
                }
              `}
              style={styles.signatureCanvas}
              backgroundColor="white"
              penColor="black"
              autoClear={false}
            />
          </View>
          {assinatura ? (
            <View style={styles.signatureStatus}>
              <Text style={styles.signatureStatusText}>✓ Assinatura coletada</Text>
            </View>
          ) : null}
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onPress={handleLimparAssinatura}
            style={styles.clearSignatureBtn}
          >
            Limpar Assinatura
          </Button>
        </Card>

        {/* GPS */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>📍 Localização</Text>
          {isGPSLoading ? (
            <View style={styles.gpsLoading}>
              <Loading message="Obtendo localização..." />
            </View>
          ) : gpsPosition ? (
            <View style={styles.gpsInfo}>
              <View style={styles.gpsRow}>
                <Text style={styles.gpsLabel}>Latitude</Text>
                <Text style={styles.gpsValue}>{gpsPosition.latitude.toFixed(6)}</Text>
              </View>
              <View style={styles.gpsRow}>
                <Text style={styles.gpsLabel}>Longitude</Text>
                <Text style={styles.gpsValue}>{gpsPosition.longitude.toFixed(6)}</Text>
              </View>
              <View style={styles.gpsRow}>
                <Text style={styles.gpsLabel}>Precisão</Text>
                <Text style={styles.gpsValue}>{gpsPosition.accuracy.toFixed(0)}m</Text>
              </View>
              <TouchableOpacity onPress={obterLocalizacao} style={styles.refreshGps}>
                <Text style={styles.refreshGpsText}>🔄 Atualizar localização</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.gpsUnavailable}>
              <Text style={styles.gpsUnavailableText}>⚠️ GPS não disponível</Text>
              <Button variant="secondary" size="sm" onPress={obterLocalizacao}>
                Tentar Novamente
              </Button>
            </View>
          )}
        </Card>

        {/* Ações */}
        <Card style={styles.card}>
          <View style={styles.actionsContainer}>
            <Button
              variant="success"
              size="lg"
              fullWidth
              isLoading={isLoading}
              onPress={handleConfirmar}
              style={styles.confirmButton}
            >
              ✓ Confirmar Entrega
            </Button>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onPress={() => navigation.navigate('EntregasList')}
            >
              ← Cancelar
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
  card: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 12,
  },
  fotoPreview: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    marginBottom: 10,
  },
  fotoActions: {
    flexDirection: 'row',
    gap: 10,
  },
  fotoActionBtn: {
    flex: 1,
  },
  fotoButtons: {
    gap: 10,
  },
  fotoButton: {
    marginBottom: 0,
  },
  signatureHint: {
    fontSize: 13,
    color: COLORS.gray500,
    marginBottom: 10,
  },
  signatureContainer: {
    height: 200,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: COLORS.white,
  },
  signatureCanvas: {
    flex: 1,
  },
  signatureStatus: {
    backgroundColor: '#D1FAE5',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  signatureStatusText: {
    color: COLORS.success,
    fontWeight: '600',
    fontSize: 13,
  },
  clearSignatureBtn: {
    marginTop: 4,
  },
  gpsLoading: {
    paddingVertical: 8,
  },
  gpsInfo: {
    gap: 8,
  },
  gpsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gpsLabel: {
    fontSize: 13,
    color: COLORS.gray500,
  },
  gpsValue: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.gray900,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  refreshGps: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  refreshGpsText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  gpsUnavailable: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  gpsUnavailableText: {
    fontSize: 14,
    color: COLORS.warning,
    fontWeight: '500',
  },
  actionsContainer: {
    gap: 10,
  },
  confirmButton: {
    marginBottom: 0,
  },
});

export default ConfirmacaoEntregaScreen;

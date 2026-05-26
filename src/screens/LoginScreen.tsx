import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { COLORS } from '../utils/constants';

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ cpf?: string; senha?: string }>({});

  const formatCPFInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 3) formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length > 6) formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    if (cleaned.length > 9) formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
    return formatted;
  };

  const validate = () => {
    const newErrors: { cpf?: string; senha?: string } = {};
    if (!cpf) {
      newErrors.cpf = 'CPF é obrigatório';
    }
    if (!senha) {
      newErrors.senha = 'Senha é obrigatória';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(cpf.replace(/\D/g, ''), senha);
    } catch (error: any) {
      const msg = error?.message || 'Erro ao fazer login. Verifique suas credenciais.';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header / Logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>🚚</Text>
            </View>
            <Text style={styles.appTitle}>Sistema Frota</Text>
            <Text style={styles.appSubtitle}>Gestão de Entregas</Text>
          </View>

          {/* Formulário */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Entrar</Text>
            <Text style={styles.formSubtitle}>
              Faça login com suas credenciais de motorista
            </Text>

            <View style={styles.inputGroup}>
              <Input
                label="CPF"
                placeholder="000.000.000-00"
                value={cpf}
                onChangeText={(text) => {
                  setCpf(formatCPFInput(text));
                  if (errors.cpf) setErrors((e) => ({ ...e, cpf: undefined }));
                }}
                error={errors.cpf}
                keyboardType="numeric"
                maxLength={14}
                autoComplete="off"
              />
            </View>

            <View style={styles.inputGroup}>
              <Input
                label="Senha"
                placeholder="Digite sua senha"
                value={senha}
                onChangeText={(text) => {
                  setSenha(text);
                  if (errors.senha) setErrors((e) => ({ ...e, senha: undefined }));
                }}
                error={errors.senha}
                secureTextEntry={!showPassword}
                autoComplete="off"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.showPasswordBtn}
              >
                <Text style={styles.showPasswordText}>
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              onPress={handleLogin}
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              style={styles.loginButton}
            >
              Entrar
            </Button>
          </View>

          <Text style={styles.footer}>
            Sistema de Gestão de Frota v1.0
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoIcon: {
    fontSize: 40,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 15,
    color: COLORS.gray500,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 14,
    color: COLORS.gray500,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  showPasswordBtn: {
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  showPasswordText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 8,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.gray400,
  },
});

export default LoginScreen;

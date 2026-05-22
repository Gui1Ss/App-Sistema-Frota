import React, { useState } from 'react';
import { useRouter } from 'wouter';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { validateLoginForm } from '../utils/validators';
import { formatCPF } from '../utils/formatters';

export const Login: React.FC = () => {
  const [, navigate] = useRouter() as any;
  const { login } = useAuth();
  const { show: showToast } = useToast();

  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      setCpf(formatCPF(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    const validation = validateLoginForm(cpf, senha);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await login(cpf.replace(/\D/g, ''), senha);
      showToast('Login realizado com sucesso!', 'success');
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage =
        error?.message || 'Erro ao fazer login. Tente novamente.';
      showToast(errorMessage, 'error');
      setErrors({ form: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">🚗</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">App Motorista</h1>
          <p className="text-blue-100">Sistema de Entregas</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Fazer Login
          </h2>

          {errors.form && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-danger">{errors.form}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="CPF"
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={handleCPFChange}
              error={errors.cpf}
              icon={<span>👤</span>}
            />

            <Input
              label="Senha"
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              error={errors.password}
              icon={<span>🔒</span>}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Problemas ao fazer login?{' '}
              <a href="#" className="text-primary font-medium hover:underline">
                Contate o suporte
              </a>
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-blue-100 text-sm">
          <p>© 2026 Sistema de Logística. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';

const formatCPF = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
};

const validateLoginForm = (cpf: string, senha: string) => {
  const errors: Record<string, string> = {};
  const cpfLimpo = cpf.replace(/\D/g, '');

  if (!cpfLimpo) {
    errors.cpf = 'CPF é obrigatório';
  } else if (cpfLimpo.length !== 11) {
    errors.cpf = 'CPF deve ter 11 dígitos';
  }

  if (!senha) {
    errors.senha = 'Senha é obrigatória';
  } else if (senha.length < 6) {
    errors.senha = 'Senha deve ter no mínimo 6 caracteres';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const Login: React.FC = () => {
  const [, setLocation] = useLocation();
  const { login, isLoading } = useAuth();
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      setCpf(formatCPF(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateLoginForm(cpf, senha);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSuccessMessage('');

    try {
      await login(cpf, senha);
      setSuccessMessage('Login realizado com sucesso!');
      setTimeout(() => {
        setLocation('/dashboard');
      }, 1000);
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao fazer login. Tente novamente.';
      setErrors({ form: errorMessage });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-lg">
            <svg
              className="w-10 h-10 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">App Motorista</h1>
          <p className="text-blue-100 text-lg">Sistema de Entregas</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sucesso */}
            {successMessage && (
              <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                <p className="text-green-700 text-sm font-medium">{successMessage}</p>
              </div>
            )}

            {/* Erro geral */}
            {errors.form && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                <p className="text-red-700 text-sm font-medium">{errors.form}</p>
              </div>
            )}

            {/* CPF */}
            <div>
              <label htmlFor="cpf" className="block text-sm font-semibold text-gray-800 mb-3">
                CPF
              </label>
              <input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCPFChange}
                disabled={isLoading}
                className={`w-full text-lg py-3 px-4 border-2 rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.cpf
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.cpf && (
                <p className="text-red-600 text-sm mt-2 font-medium">{errors.cpf}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="senha" className="block text-sm font-semibold text-gray-800 mb-3">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={isLoading}
                className={`w-full text-lg py-3 px-4 border-2 rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.senha
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.senha && (
                <p className="text-red-600 text-sm mt-2 font-medium">{errors.senha}</p>
              )}
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <div className="px-4 text-gray-500 text-sm">Ou</div>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Demo Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 text-sm font-medium">
              <strong>Credenciais de Teste:</strong>
            </p>
            <p className="text-blue-800 text-sm mt-2">
              CPF: <code className="bg-blue-100 px-2 py-1 rounded">12345678901</code>
            </p>
            <p className="text-blue-800 text-sm mt-1">
              Senha: <code className="bg-blue-100 px-2 py-1 rounded">password123</code>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-blue-100 text-sm">
            Versão 1.0.0 • © 2024 App Motorista
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

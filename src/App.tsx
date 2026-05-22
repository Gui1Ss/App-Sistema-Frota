import React, { useEffect, useState } from 'react';
import { Router, Route, useLocation } from 'wouter';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EntregasProvider } from './contexts/EntregasContext';
import { ToastContainer } from './components/Toast';
import { storageService } from './services/storage';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { EntregasList } from './pages/EntregasList';
import { EntregaDetails } from './pages/EntregaDetails';
import { ConfirmacaoEntrega } from './pages/ConfirmacaoEntrega';
import { Historico } from './pages/Historico';

// Loading screen
const LoadingScreen: React.FC = () => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
      <p className="text-gray-600 font-medium">Inicializando aplicação...</p>
    </div>
  </div>
);

// Not Found screen
const NotFound: React.FC = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
      <p className="text-gray-600">Página não encontrada</p>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Redireciona para login se não autenticado e tenta acessar rota protegida
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Se está em uma rota protegida, redireciona para login
      if (location !== '/login') {
        setLocation('/login');
      }
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Se não autenticado, mostra apenas login
  if (!isAuthenticated) {
    return (
      <>
        <Route path="/login" component={Login} />
        <Route path="*" component={Login} />
      </>
    );
  }

  // Se autenticado, mostra todas as rotas
  return (
    <>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/entregas" component={EntregasList} />
      <Route path="/entregas/:id" component={EntregaDetails} />
      <Route path="/confirmar/:id" component={ConfirmacaoEntrega} />
      <Route path="/historico" component={Historico} />
      <Route path="/" component={Dashboard} />
      <Route path="*" component={NotFound} />
    </>
  );
};

interface AppProps {
  storageReady: boolean;
}

const AppWithStorage: React.FC<AppProps> = ({ storageReady }) => {
  if (!storageReady) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <AuthProvider>
        <EntregasProvider>
          <AppContent />
          <ToastContainer />
        </EntregasProvider>
      </AuthProvider>
    </Router>
  );
};

function App() {
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const initStorage = async () => {
      try {
        await storageService.init();
        setStorageReady(true);
      } catch (error) {
        console.error('Erro ao inicializar storage:', error);
        // Continua mesmo com erro de storage
        setStorageReady(true);
      }
    };

    initStorage();
  }, []);

  return <AppWithStorage storageReady={storageReady} />;
}

export default App;

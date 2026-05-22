import React, { useEffect, useState } from 'react';
import { Router, Route, useLocation } from 'wouter';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EntregasProvider } from './contexts/EntregasContext';
import { ToastContainer } from './components/Toast';
import { storageService } from './services/storage';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { EntregasList } from './pages/EntregasList';
import { EntregaDetails } from './pages/EntregaDetails';
import { ConfirmacaoEntrega } from './pages/ConfirmacaoEntrega';
import { Historico } from './pages/Historico';

const ProtectedRoute: React.FC<{ component: React.ComponentType<any> }> = ({
  component: Component,
}) => {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, setLocation]);

  return isAuthenticated ? <Component /> : null;
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Route path="/login">
        <Login />
      </Route>

      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>

      <Route path="/entregas">
        <ProtectedRoute component={EntregasList} />
      </Route>

      <Route path="/entregas/:id">
        <ProtectedRoute component={EntregaDetails} />
      </Route>

      <Route path="/confirmar/:id">
        <ProtectedRoute component={ConfirmacaoEntrega} />
      </Route>

      <Route path="/historico">
        <ProtectedRoute component={Historico} />
      </Route>

      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
    </>
  );
};

function App() {
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    storageService.init()
      .then(() => setStorageReady(true))
      .catch((error) => {
        console.error('Erro ao inicializar storage:', error);
        setStorageReady(true);
      });
  }, []);

  if (!storageReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando...</p>
        </div>
      </div>
    );
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
}

export default App;
import React, { useEffect } from 'react';
import { Router, Route, Redirect } from 'wouter';
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

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Inicializa IndexedDB
  useEffect(() => {
    storageService.init().catch(console.error);
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return (
    <>
      <Route path="/login" component={Login} />

      {isAuthenticated && (
        <>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/entregas" component={EntregasList} />
          <Route path="/entregas/:id" component={EntregaDetails} />
          <Route path="/confirmar/:id" component={ConfirmacaoEntrega} />
          <Route path="/historico" component={Historico} />
        </>
      )}

      {/* Redirect default */}
      <Route path="/">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
      </Route>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <EntregasProvider>
        <Router>
          <AppContent />
        </Router>
        <ToastContainer />
      </EntregasProvider>
    </AuthProvider>
  );
}

export default App;

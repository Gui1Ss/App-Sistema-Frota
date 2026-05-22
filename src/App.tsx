import React, { useEffect } from 'react';
import { Router, Route, Redirect, Switch } from 'wouter';
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

const ProtectedRoute: React.FC<{ component: React.ComponentType }> = ({
  component: Component,
}) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Component /> : <Redirect to="/login" />;
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Carregando...
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Login />}
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

      <Route>
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
      </Route>
    </Switch>
  );
};

function App() {
  useEffect(() => {
    storageService.init().catch(console.error);
  }, []);

  return (
    <AuthProvider>
      <EntregasProvider>
        <Router>
          <AppContent />
          <ToastContainer />
        </Router>
      </EntregasProvider>
    </AuthProvider>
  );
}

export default App;
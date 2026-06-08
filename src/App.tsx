import React, { useEffect, useState } from 'react';
import { Route, Router, useLocation, useRoute } from 'wouter';
import { ToastContainer } from './components/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EntregasProvider } from './contexts/EntregasContext';
import { storageService } from './services/storage';
import { App as CapacitorApp } from '@capacitor/app';
// Pages
import { ConfirmacaoEntrega } from './pages/ConfirmacaoEntrega';
import { Dashboard } from './pages/Dashboard';
import { EntregaDetails } from './pages/EntregaDetails';
import { EntregasList } from './pages/EntregasList';
import { Historico } from './pages/Historico';
import { Login } from './pages/Login';
import { Preferences } from '@capacitor/preferences';
import { Toast } from '@capacitor/toast';
// import { apiService } from './services/api';
// import { CapacitorHttp, type HttpResponse } from '@capacitor/core';

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

// Renderiza 404 somente quando nenhuma rota conhecida casar
const NotFoundRoute: React.FC = () => {

  // verifica se alguma rota conhecida casa com a URL atual
  const [isHome] = useRoute('/');
  const [isDashboard] = useRoute('/dashboard');
  const [isEntregas] = useRoute('/entregas');
  const [isEntregaId] = useRoute('/entregas/:id');
  const [isConfirm] = useRoute('/confirmar/:id');
  const [isHistorico] = useRoute('/historico');
  const [isLogin] = useRoute('/login');

  if (isHome || isDashboard || isEntregas || isEntregaId || isConfirm || isHistorico || isLogin) {
    return null;
  }

  // Se estiver em qualquer outra rota, mostra NotFound
  return <NotFound />;
};

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redireciona para dashboard se autenticado, senão para login
    setLocation(isAuthenticated ? '/dashboard' : '/login');
  }, [isAuthenticated, setLocation]);

  return null;
};

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
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
      </>
    );
  }

  // Se autenticado, mostra todas as rotas
  return (
    <>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/entregas" component={EntregasList} />
      <Route path="/entregas/:id" component={EntregaDetails} />
      <Route path="/confirmar/:id" component={ConfirmacaoEntrega} />
      <Route path="/historico" component={Historico} />
      {/* <Route path="/" component={Dashboard} /> */}
      <NotFoundRoute />
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
  // const [foto, setFoto] = useState<any>()

  useEffect(() => {
    console.log("APP MONTADO");

    CapacitorApp.addListener('appRestoredResult', async (data) => {
      console.log('APP RESTORED RESULT:', data);
    
      if (
      data.pluginId === 'Camera' &&
      data.methodName === 'getPhoto' &&
      data.success
      ) {
        const photo = data.data;

        console.log('FOTO RECUPERADA', photo);

        const blob = await fetch(photo.webPath).then(r => r.blob());

        // continuar upload aqui
        const formData = new FormData();

        formData.append(
          'file',
          blob,
          `foto.${photo.format}`
        );

        const { value: codigoLido } = await Preferences.get({
          key: 'codigoEntrega'
        });

        console.log(codigoLido)

        const response = await fetch(
          `http://192.168.1.178:8001/upload-canhoto/${codigoLido}`,
          {
            method: 'POST',
            body: formData,
          }
        );

        console.log(await response.text());
        await Toast.show({
          text: 'Upload realizado com sucesso!'
        });
      }
    
    });



    const initStorage = async () => {
      try {
        await Promise.race([
          storageService.init(),
          new Promise<void>((resolve) => setTimeout(resolve, 5000)),
        ]);
      } catch (error) {
        console.error('Erro ao inicializar storage:', error);
      } finally {
        setStorageReady(true);
      }
    };

    initStorage();
  }, []);

  return <AppWithStorage storageReady={storageReady} />;
}

export default App;

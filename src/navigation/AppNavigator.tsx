import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from './types';
import { COLORS } from '../utils/constants';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import EntregasListScreen from '../screens/EntregasListScreen';
import EntregaDetailsScreen from '../screens/EntregaDetailsScreen';
import ConfirmacaoEntregaScreen from '../screens/ConfirmacaoEntregaScreen';
import HistoricoScreen from '../screens/HistoricoScreen';
import LoadingScreen from '../screens/LoadingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Inicializando aplicação..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="EntregasList" component={EntregasListScreen} />
            <Stack.Screen name="EntregaDetails" component={EntregaDetailsScreen} />
            <Stack.Screen name="ConfirmacaoEntrega" component={ConfirmacaoEntregaScreen} />
            <Stack.Screen name="Historico" component={HistoricoScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

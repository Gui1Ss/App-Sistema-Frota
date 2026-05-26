import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { EntregasProvider } from './src/contexts/EntregasContext';
import { ToastProvider } from './src/contexts/ToastContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <AuthProvider>
          <EntregasProvider>
            <AppNavigator />
            <StatusBar style="dark" />
          </EntregasProvider>
        </AuthProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

interface LoadingProps {
  fullScreen?: boolean;
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({
  fullScreen = false,
  message = 'Carregando...',
}) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  message: {
    marginTop: 16,
    fontSize: 15,
    color: COLORS.gray600,
    textAlign: 'center',
  },
});

export default Loading;

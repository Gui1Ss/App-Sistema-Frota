import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS } from '../utils/constants';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({ children, style, onPress, hoverable }) => {
  if (onPress || hoverable) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.card, style]}
        activeOpacity={0.85}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});

export default Card;

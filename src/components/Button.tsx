import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS } from '../utils/constants';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  style,
}) => {
  const isDisabled = disabled || isLoading;

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: isDisabled ? '#93C5FD' : COLORS.primary };
      case 'secondary':
        return {
          backgroundColor: COLORS.white,
          borderWidth: 1,
          borderColor: COLORS.gray300,
        };
      case 'success':
        return { backgroundColor: isDisabled ? '#6EE7B7' : COLORS.success };
      case 'danger':
        return { backgroundColor: isDisabled ? '#FCA5A5' : COLORS.danger };
      case 'warning':
        return { backgroundColor: isDisabled ? '#FCD34D' : COLORS.warning };
      default:
        return { backgroundColor: COLORS.primary };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'secondary':
        return { color: COLORS.gray700 };
      default:
        return { color: COLORS.white };
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 12 };
      case 'lg':
        return { paddingVertical: 16, paddingHorizontal: 24 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 16 };
    }
  };

  const getTextSizeStyle = (): TextStyle => {
    switch (size) {
      case 'sm':
        return { fontSize: 13 };
      case 'lg':
        return { fontSize: 16 };
      default:
        return { fontSize: 14 };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        getVariantStyle(),
        getSizeStyle(),
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? COLORS.primary : COLORS.white}
          size="small"
        />
      ) : (
        <Text style={[styles.text, getTextStyle(), getTextSizeStyle()]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.7,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Button;

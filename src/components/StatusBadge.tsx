import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ENTREGA_STATUS_COLORS, ENTREGA_STATUS_LABELS } from '../utils/constants';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colors = ENTREGA_STATUS_COLORS[status] || { bg: '#F3F4F6', text: '#374151' };
  const label = ENTREGA_STATUS_LABELS[status] || status;

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default StatusBadge;

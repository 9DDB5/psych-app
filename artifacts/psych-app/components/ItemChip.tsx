import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';

interface Props {
  label: string;
  selected: boolean;
  disabled?: boolean;
  activeColor: string;
  onPress: () => void;
}

export function ItemChip({ label, selected, disabled, activeColor, onPress }: Props) {
  const colors = useColors();

  function handlePress() {
    if (disabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={disabled ? 1 : 0.7}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? activeColor : colors.card,
          borderColor: selected ? activeColor : colors.border,
          opacity: disabled && !selected ? 0.35 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: selected ? '#FFFFFF' : colors.foreground },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    margin: 3,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
});

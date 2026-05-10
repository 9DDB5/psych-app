import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Patient } from '@/types';

interface Props {
  patient: Patient;
  sessionCount: number;
  onPress: () => void;
  onDelete?: () => void;
}

export function PatientCard({ patient, sessionCount, onPress, onDelete }: Props) {
  const colors = useColors();

  const initials = patient.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Text style={[styles.initials, { color: colors.primaryForeground }]}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]}>{patient.name}</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          {sessionCount} {sessionCount === 1 ? 'seduta' : 'sedute'}
        </Text>
      </View>
      {onDelete ? (
        <Pressable
          onPress={onDelete}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.5 : 1 }]}
        >
          <Feather name="trash-2" size={18} color={colors.destructive} />
        </Pressable>
      ) : (
        <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 14,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  info: { flex: 1 },
  name: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 2,
  },
  sub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  deleteBtn: {
    padding: 4,
  },
});

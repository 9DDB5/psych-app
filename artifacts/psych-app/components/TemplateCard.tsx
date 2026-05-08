import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Template } from '@/types';

interface Props {
  template: Template;
  onPress: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

export function TemplateCard({ template, onPress, onDuplicate, onDelete, canDelete }: Props) {
  const colors = useColors();

  const totalItems = template.sections.reduce((acc, s) => acc + s.items.length, 0);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.main}>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground }]}>{template.name}</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            {template.sections.length} sezioni · {totalItems} voci
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onDuplicate} style={styles.action} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="copy" size={18} color={colors.primary} />
          </TouchableOpacity>
          {canDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.action} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="trash-2" size={18} color={colors.destructive} />
            </TouchableOpacity>
          )}
          <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: { flex: 1 },
  name: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 3,
  },
  sub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  action: {},
});

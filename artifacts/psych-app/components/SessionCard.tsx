import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Session } from '@/types';

interface Props {
  session: Session;
  onPress: () => void;
  onDelete?: () => void;
}

export function SessionCard({ session, onPress, onDelete }: Props) {
  const colors = useColors();

  const date = new Date(session.completedAt);
  const dateStr = date.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

  const totalSelected = session.selections.reduce((acc, s) => acc + s.items.length, 0);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.dateBlock}>
          <Text style={[styles.date, { color: colors.foreground }]}>{dateStr}</Text>
          <Text style={[styles.time, { color: colors.mutedForeground }]}>{timeStr}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.badge, { backgroundColor: colors.muted }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>{totalSelected} voci</Text>
          </View>
          {onDelete && (
            <Pressable
              onPress={onDelete}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.5 : 1 }]}
            >
              <Feather name="trash-2" size={16} color={colors.destructive} />
            </Pressable>
          )}
        </View>
      </View>
      {session.freezingText ? (
        <Text style={[styles.preview, { color: colors.mutedForeground }]} numberOfLines={2}>
          {session.freezingText}
        </Text>
      ) : null}
      <View style={styles.footer}>
        <Text style={[styles.template, { color: colors.mutedForeground }]}>
          {session.templateSnapshot.name}
        </Text>
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateBlock: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  date: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  time: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  deleteBtn: {
    padding: 4,
  },
  preview: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  template: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
});

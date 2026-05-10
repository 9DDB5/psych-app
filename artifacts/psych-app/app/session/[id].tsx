import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAppContext } from '@/context/AppContext';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sessions, patients, deleteSession, duplicateSession } = useAppContext();
  const [showDelete, setShowDelete] = useState(false);

  const session = sessions.find(s => s.id === id);
  const patient = session ? patients.find(p => p.id === session.patientId) : undefined;

  if (!session) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Seduta' }} />
        <Text style={{ color: colors.foreground, padding: 20 }}>Seduta non trovata</Text>
      </View>
    );
  }

  const date = new Date(session.completedAt);
  const dateStr = date.toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

  function handleEdit() {
    router.push({ pathname: '/session/new', params: { patientId: session!.patientId, editSessionId: session!.id } });
  }

  function handleDuplicate() {
    duplicateSession(session!.id);
    router.back();
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: patient?.name ?? 'Seduta',
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleDuplicate} style={styles.headerBtn}>
                <Feather name="copy" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEdit} style={styles.headerBtn}>
                <Feather name="edit-2" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowDelete(true)} style={styles.headerBtn}>
                <Feather name="trash-2" size={20} color={colors.destructive} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.dateCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Text style={[styles.dateStr, { color: colors.foreground }]}>{dateStr}</Text>
          <Text style={[styles.timeStr, { color: colors.mutedForeground }]}>{timeStr}</Text>
          <Text style={[styles.templateName, { color: colors.mutedForeground }]}>
            Template: {session.templateSnapshot.name}
          </Text>
        </View>

        <View style={[styles.summaryBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Frase riepilogativa</Text>
          {(() => {
            const sections = session.templateSnapshot.sections;
            const s1 = session.selections.find(s => s.sectionId === sections[0]?.id);
            const s2 = session.selections.find(s => s.sectionId === sections[1]?.id);
            const s3 = session.selections.find(s => s.sectionId === sections[2]?.id);
            const freezing = s1?.items.join(' / ') || '—';
            const eventi = s2?.items.join(' / ') || '—';
            const caratteristiche = s3?.items.join(' / ') || '—';
            const per = session.freezingText || '—';
            return (
              <Text style={[styles.summaryText, { color: colors.foreground }]}>
                {'Lo '}
                <Text style={{ fontFamily: 'Inter_700Bold', color: '#3B5BDB' }}>{freezing}</Text>
                {' per '}
                <Text style={{ fontFamily: 'Inter_600SemiBold' }}>{per}</Text>
                {' mi vuole proteggere da '}
                <Text style={{ fontFamily: 'Inter_700Bold', color: '#D62839' }}>{eventi}</Text>
                {' e da una situazione/realtà/esperienza '}
                <Text style={{ fontFamily: 'Inter_700Bold', color: '#7C3AED' }}>{caratteristiche}</Text>
              </Text>
            );
          })()}
        </View>

        {session.templateSnapshot.sections.map(section => {
          const sel = session.selections.find(s => s.sectionId === section.id);
          if (!sel || sel.items.length === 0) return null;
          return (
            <View key={section.id} style={styles.sectionBlock}>
              <View style={[styles.sectionHeader, { backgroundColor: section.bgColor }]}>
                <Text style={[styles.sectionTitle, { color: section.color }]}>{section.title}</Text>
              </View>
              <View style={[styles.itemsWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {sel.items.map(item => (
                  <View key={item} style={[styles.itemBadge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                    <Text style={[styles.itemText, { color: colors.foreground }]}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {session.notes ? (
          <View style={[styles.notesBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.notesLabel, { color: colors.mutedForeground }]}>Note</Text>
            <Text style={[styles.notesText, { color: colors.foreground }]}>{session.notes}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity onPress={handleEdit} style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
            <Feather name="edit-2" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Modifica seduta</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDuplicate} style={[styles.actionBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
            <Feather name="copy" size={18} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>Duplica seduta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ConfirmDeleteModal
        visible={showDelete}
        title="Elimina seduta"
        message="Eliminare questa seduta definitivamente?"
        onCancel={() => setShowDelete(false)}
        onConfirm={() => {
          setShowDelete(false);
          deleteSession(session!.id);
          router.back();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: { padding: 4 },
  content: { padding: 16, gap: 14 },
  dateCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 4 },
  dateStr: { fontSize: 16, fontFamily: 'Inter_600SemiBold', textTransform: 'capitalize' },
  timeStr: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  templateName: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 4 },
  summaryBox: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 8 },
  summaryLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.8 },
  summaryText: { fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 26 },
  sectionBlock: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' },
  sectionHeader: { paddingHorizontal: 16, paddingVertical: 10 },
  sectionTitle: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  itemsWrap: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 6 },
  itemBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  itemText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  notesBox: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 6 },
  notesLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.8 },
  notesText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22 },
  actions: { gap: 10, marginTop: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 14, paddingVertical: 14 },
  actionBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});

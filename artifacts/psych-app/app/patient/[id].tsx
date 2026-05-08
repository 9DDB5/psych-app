import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Modal, TextInput, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAppContext } from '@/context/AppContext';
import { SessionCard } from '@/components/SessionCard';
import { EmptyState } from '@/components/EmptyState';
import { exportPatient } from '@/utils/export';

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    patients, templates, sessions: allSessions,
    getPatientSessions, updatePatient, deletePatient,
  } = useAppContext();

  const patient = patients.find(p => p.id === id);
  const sessions = getPatientSessions(id);

  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState(patient?.name ?? '');
  const [editNotes, setEditNotes] = useState(patient?.notes ?? '');

  if (!patient) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Paziente' }} />
        <EmptyState icon="user" title="Paziente non trovato" />
      </View>
    );
  }

  function handleSaveEdit() {
    if (!editName.trim()) return;
    updatePatient(patient!.id, { name: editName.trim(), notes: editNotes.trim() });
    setEditModal(false);
  }

  function handleDelete() {
    Alert.alert('Elimina paziente', `Eliminare ${patient!.name} e tutte le sue sedute?`, [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Elimina', style: 'destructive', onPress: () => {
          deletePatient(patient!.id);
          router.back();
        },
      },
    ]);
  }

  async function handleExport() {
    try {
      await exportPatient(patient!, allSessions, templates);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert('Esportazione fallita', msg);
    }
  }

  function startSession() {
    if (templates.length === 0) {
      Alert.alert('Nessun template', 'Crea prima un template nella sezione Template.');
      return;
    }
    router.push({ pathname: '/session/new', params: { patientId: patient!.id } });
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: patient.name,
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleExport} style={styles.headerBtn}>
                <Feather name="share" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setEditName(patient.name); setEditNotes(patient.notes); setEditModal(true); }}
                style={styles.headerBtn}
              >
                <Feather name="edit-2" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
                <Feather name="trash-2" size={20} color={colors.destructive} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {patient.notes ? (
          <View style={[styles.notesBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Text style={[styles.notesText, { color: colors.mutedForeground }]}>{patient.notes}</Text>
          </View>
        ) : null}

        <View style={styles.sessionHeader}>
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
            Sedute ({sessions.length})
          </Text>
          <TouchableOpacity onPress={startSession} style={[styles.newBtn, { backgroundColor: colors.primary }]}>
            <Feather name="plus" size={16} color="#fff" />
            <Text style={styles.newBtnText}>Nuova seduta</Text>
          </TouchableOpacity>
        </View>

        {sessions.length === 0 ? (
          <EmptyState
            icon="clipboard"
            title="Nessuna seduta"
            subtitle="Avvia una nuova seduta per registrare le selezioni del paziente"
          />
        ) : (
          sessions.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              onPress={() => router.push(`/session/${session.id}`)}
            />
          ))
        )}
      </ScrollView>

      <Modal
        visible={editModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setEditModal(false)}
      >
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: insets.top + 16 }]}>
            <TouchableOpacity onPress={() => setEditModal(false)}>
              <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Annulla</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Modifica paziente</Text>
            <TouchableOpacity onPress={handleSaveEdit}>
              <Text style={[styles.saveText, { color: colors.primary }]}>Salva</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.foreground }]}>Nome</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              value={editName}
              onChangeText={setEditName}
              autoFocus
            />
            <Text style={[styles.label, { color: colors.foreground }]}>Note</Text>
            <TextInput
              style={[styles.input, styles.textarea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              value={editNotes}
              onChangeText={setEditNotes}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: { padding: 4 },
  content: { padding: 16 },
  notesBox: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 16 },
  notesText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  sessionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionLabel: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  newBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  cancelText: { fontSize: 16, fontFamily: 'Inter_400Regular' },
  saveText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  form: { padding: 20, gap: 4 },
  label: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, fontFamily: 'Inter_400Regular' },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
});

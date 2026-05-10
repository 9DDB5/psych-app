import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAppContext } from '@/context/AppContext';
import { PatientCard } from '@/components/PatientCard';
import { EmptyState } from '@/components/EmptyState';

export default function PatientsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { patients, getPatientSessions, addPatient, deletePatient } = useAppContext();

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNotes, setNewNotes] = useState('');

  function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    addPatient(name, newNotes.trim());
    setNewName('');
    setNewNotes('');
    setShowAdd(false);
  }

  function handleDelete(id: string, name: string) {
    Alert.alert(
      'Elimina paziente',
      `Eliminare ${name} e tutte le sue sedute?`,
      [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Elimina', style: 'destructive', onPress: () => deletePatient(id) },
      ]
    );
  }

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Pazienti</Text>
        <TouchableOpacity
          onPress={() => setShowAdd(true)}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {patients.length === 0 ? (
          <EmptyState
            icon="users"
            title="Nessun paziente"
            subtitle="Aggiungi il tuo primo paziente per iniziare"
          />
        ) : (
          patients.map(patient => (
            <PatientCard
              key={patient.id}
              patient={patient}
              sessionCount={getPatientSessions(patient.id).length}
              onPress={() => router.push(`/patient/${patient.id}`)}
              onDelete={() => handleDelete(patient.id, patient.name)}
            />
          ))
        )}
      </ScrollView>

      <Modal visible={showAdd} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setShowAdd(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: insets.top + 16 }]}>
            <TouchableOpacity onPress={() => { setShowAdd(false); setNewName(''); setNewNotes(''); }}>
              <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Annulla</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Nuovo paziente</Text>
            <TouchableOpacity onPress={handleAdd}>
              <Text style={[styles.saveText, { color: newName.trim() ? colors.primary : colors.mutedForeground }]}>Aggiungi</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.foreground }]}>Nome e cognome</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Es. Mario Rossi"
              placeholderTextColor={colors.mutedForeground}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              returnKeyType="next"
            />
            <Text style={[styles.label, { color: colors.foreground }]}>Note (opzionale)</Text>
            <TextInput
              style={[styles.input, styles.textarea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Note sul paziente..."
              placeholderTextColor={colors.mutedForeground}
              value={newNotes}
              onChangeText={setNewNotes}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: 16 },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  cancelText: { fontSize: 16, fontFamily: 'Inter_400Regular' },
  saveText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  form: { padding: 20, gap: 8 },
  label: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, fontFamily: 'Inter_400Regular' },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
});

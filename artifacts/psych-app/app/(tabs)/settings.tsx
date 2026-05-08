import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAppContext } from '@/context/AppContext';
import { exportAllData, exportTemplates, importFromFile } from '@/utils/export';
import { createDefaultTemplate } from '@/utils/defaultTemplate';

function SettingRow({
  icon, label, sub, onPress, danger,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  sub?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: danger ? '#FEE2E2' : colors.muted }]}>
        <Feather name={icon} size={20} color={danger ? colors.destructive : colors.primary} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: danger ? colors.destructive : colors.foreground }]}>{label}</Text>
        {sub ? <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{sub}</Text> : null}
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { patients, templates, sessions, addTemplate, importData } = useAppContext();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  function showError(e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    Alert.alert('Esportazione fallita', msg);
  }

  async function handleExportAll() {
    try {
      await exportAllData(patients, templates, sessions);
    } catch (e) { showError(e); }
  }

  async function handleExportTemplates() {
    try {
      await exportTemplates(templates);
    } catch (e) { showError(e); }
  }

  async function handleImport() {
    try {
      const data = await importFromFile();
      if (!data) return;

      const pCount = data.patients?.length ?? 0;
      const tCount = data.templates?.length ?? 0;
      const sCount = data.sessions?.length ?? 0;

      Alert.alert(
        'Importa dati',
        `Trovati:\n• ${pCount} pazienti\n• ${tCount} template\n• ${sCount} sedute\n\nVerranno aggiunti a quelli esistenti (senza duplicati).`,
        [
          { text: 'Annulla', style: 'cancel' },
          {
            text: 'Importa', onPress: () => {
              importData(data);
              Alert.alert('Fatto', 'Dati importati con successo.');
            },
          },
        ]
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert('Importazione fallita', msg);
    }
  }

  function handleResetDefaultTemplate() {
    Alert.alert(
      'Ripristina template standard',
      'Verrà aggiunto un nuovo "Template Standard" con le voci aggiornate. I template esistenti non saranno eliminati.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Ripristina', onPress: () => {
            addTemplate('Template Standard');
            Alert.alert('Fatto', 'Template standard aggiunto.');
          },
        },
      ]
    );
  }

  function handleICloud() {
    Alert.alert(
      'Sincronizzazione iCloud',
      'La sincronizzazione iCloud sarà disponibile nella versione pubblicata sull\'App Store. Usa l\'esportazione/importazione manuale come backup nel frattempo.',
      [{ text: 'OK' }]
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, {
        paddingTop: topPad + 12,
        backgroundColor: colors.background,
        borderBottomColor: colors.border,
      }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Impostazioni</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, {
          paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20,
        }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Importa</Text>
        <SettingRow
          icon="upload"
          label="Importa da file"
          sub="Ripristina un backup .json di PsychSession"
          onPress={handleImport}
        />

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginTop: 20 }]}>Esporta</Text>
        <SettingRow
          icon="database"
          label="Esporta tutto"
          sub={`${patients.length} pazienti · ${sessions.length} sedute · ${templates.length} template`}
          onPress={handleExportAll}
        />
        <SettingRow
          icon="layout"
          label="Esporta solo template"
          sub={`${templates.length} template`}
          onPress={handleExportTemplates}
        />

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginTop: 20 }]}>Esporta per paziente</Text>
        {patients.length === 0 ? (
          <View style={[styles.emptyPatients, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.emptyPatientsText, { color: colors.mutedForeground }]}>
              Nessun paziente da esportare
            </Text>
          </View>
        ) : (
          patients.map(patient => {
            const count = sessions.filter(s => s.patientId === patient.id).length;
            return (
              <SettingRow
                key={patient.id}
                icon="user"
                label={patient.name}
                sub={`${count} ${count === 1 ? 'seduta' : 'sedute'}`}
                onPress={async () => {
                  try {
                    const { exportPatient } = await import('@/utils/export');
                    await exportPatient(patient, sessions, templates);
                  } catch (e) { showError(e); }
                }}
              />
            );
          })
        )}

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginTop: 20 }]}>Avanzate</Text>
        <SettingRow
          icon="cloud"
          label="Sincronizzazione iCloud"
          sub="Disponibile nella versione App Store"
          onPress={handleICloud}
        />
        <SettingRow
          icon="refresh-cw"
          label="Ripristina template standard"
          sub="Aggiunge il template predefinito con le voci aggiornate"
          onPress={handleResetDefaultTemplate}
        />

        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 20 }]}>
          {[
            { label: 'Pazienti', value: patients.length },
            { label: 'Sedute totali', value: sessions.length },
            { label: 'Template', value: templates.length },
          ].map((stat, i) => (
            <View key={stat.label} style={[styles.stat, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          PsychSession · Dati salvati localmente sul dispositivo
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  content: { padding: 16, gap: 8 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 14,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  rowSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  emptyPatients: {
    padding: 16, borderRadius: 14, borderWidth: 1, alignItems: 'center',
  },
  emptyPatientsText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  statsCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  stat: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  statLabel: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  statValue: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  footer: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 8 },
});

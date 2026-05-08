import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAppContext } from '@/context/AppContext';
import { exportAllData, exportTemplates } from '@/utils/export';

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
  const { patients, templates, sessions } = useAppContext();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  async function handleExportAll() {
    try {
      await exportAllData(patients, templates, sessions);
    } catch {
      Alert.alert('Errore', 'Esportazione fallita. Riprova.');
    }
  }

  async function handleExportTemplates() {
    try {
      await exportTemplates(templates);
    } catch {
      Alert.alert('Errore', 'Esportazione fallita. Riprova.');
    }
  }

  function handleICloud() {
    Alert.alert(
      'Sincronizzazione iCloud',
      'La sincronizzazione iCloud sarà disponibile nella versione pubblicata dell\'app sull\'App Store. Puoi usare l\'esportazione manuale come backup nel frattempo.',
      [{ text: 'OK' }]
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Impostazioni</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Backup ed esportazione</Text>
        <SettingRow
          icon="download"
          label="Esporta tutto"
          sub={`${patients.length} pazienti · ${sessions.length} sedute · ${templates.length} template`}
          onPress={handleExportAll}
        />
        <SettingRow
          icon="layout"
          label="Esporta template"
          sub={`${templates.length} template`}
          onPress={handleExportTemplates}
        />
        <SettingRow
          icon="cloud"
          label="Sincronizzazione iCloud"
          sub="Disponibile nella versione App Store"
          onPress={handleICloud}
        />

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginTop: 24 }]}>Riepilogo dati</Text>
        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  content: { padding: 16, gap: 8 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
    marginTop: 8,
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
  statsCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  stat: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  statLabel: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  statValue: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  footer: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 24 },
});

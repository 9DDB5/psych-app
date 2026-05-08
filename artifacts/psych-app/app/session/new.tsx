import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAppContext } from '@/context/AppContext';
import { ItemChip } from '@/components/ItemChip';
import { SummaryModal } from '@/components/SummaryModal';
import { SessionSelection } from '@/types';
import * as Haptics from 'expo-haptics';

export default function NewSessionScreen() {
  const { patientId, editSessionId } = useLocalSearchParams<{ patientId: string; editSessionId?: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { patients, templates, sessions, addSession, updateSession } = useAppContext();

  const patient = patients.find(p => p.id === patientId);
  const editSession = editSessionId ? sessions.find(s => s.id === editSessionId) : undefined;

  const defaultTemplateId = editSession?.templateId ?? templates[0]?.id ?? '';
  const [selectedTemplateId, setSelectedTemplateId] = useState(defaultTemplateId);

  const template = useMemo(() => templates.find(t => t.id === selectedTemplateId) ?? templates[0], [selectedTemplateId, templates]);

  const initialSelections: SessionSelection[] = useMemo(() => {
    if (editSession && editSession.templateId === selectedTemplateId) return editSession.selections;
    return template?.sections.map(s => ({ sectionId: s.id, items: [] })) ?? [];
  }, [template]);

  const [selections, setSelections] = useState<SessionSelection[]>(initialSelections);
  const [freezingText, setFreezingText] = useState(editSession?.freezingText ?? '');
  const [showSummary, setShowSummary] = useState(false);

  function handleTemplateChange(id: string) {
    setSelectedTemplateId(id);
    const t = templates.find(t => t.id === id);
    if (t) setSelections(t.sections.map(s => ({ sectionId: s.id, items: [] })));
  }

  function toggleItem(sectionId: string, item: string) {
    const section = template?.sections.find(s => s.id === sectionId);
    if (!section) return;
    const sectionSel = selections.find(s => s.sectionId === sectionId);
    const current = sectionSel?.items ?? [];
    const isSelected = current.includes(item);

    if (isSelected) {
      setSelections(prev => prev.map(s => s.sectionId === sectionId ? { ...s, items: s.items.filter(i => i !== item) } : s));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      if (section.maxSelect !== undefined && current.length >= section.maxSelect) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }
      setSelections(prev => prev.map(s => s.sectionId === sectionId ? { ...s, items: [...s.items, item] } : s));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  function handleSave(notes: string) {
    if (!template) return;
    if (editSession) {
      updateSession(editSession.id, {
        templateId: selectedTemplateId,
        templateSnapshot: template,
        freezingText,
        selections,
        notes,
        completedAt: new Date().toISOString(),
      });
    } else {
      addSession({ patientId, templateId: selectedTemplateId, templateSnapshot: template, freezingText, selections, notes });
    }
    setShowSummary(false);
    router.back();
  }

  if (!template) return null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: patient ? `${patient.name}` : 'Nuova seduta' }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>
        {templates.length > 1 && (
          <View style={styles.templatePicker}>
            <Text style={[styles.pickerLabel, { color: colors.mutedForeground }]}>Template</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templateRow}>
              {templates.map(t => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => handleTemplateChange(t.id)}
                  style={[styles.templateChip, {
                    backgroundColor: t.id === selectedTemplateId ? colors.primary : colors.card,
                    borderColor: t.id === selectedTemplateId ? colors.primary : colors.border,
                  }]}
                >
                  <Text style={[styles.templateChipText, { color: t.id === selectedTemplateId ? '#fff' : colors.foreground }]}>
                    {t.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {template.sections.map(section => {
          const sectionSel = selections.find(s => s.sectionId === section.id);
          const selectedItems = sectionSel?.items ?? [];
          const atMax = section.maxSelect !== undefined && selectedItems.length >= section.maxSelect;

          return (
            <View key={section.id} style={styles.section}>
              <View style={[styles.sectionHeader, { backgroundColor: section.bgColor }]}>
                <Text style={[styles.sectionTitle, { color: section.color }]}>{section.title}</Text>
                {section.maxSelect && (
                  <Text style={[styles.sectionBadge, { color: section.color, opacity: 0.8 }]}>
                    {selectedItems.length}/{section.maxSelect}
                  </Text>
                )}
              </View>
              {selectedItems.length > 0 && (
                <View style={[styles.selectionPreview, { backgroundColor: section.bgColor + '22' }]}>
                  <Text style={[styles.selectionText, { color: section.bgColor }]}>
                    {selectedItems.join('  ·  ')}
                  </Text>
                </View>
              )}
              <View style={[styles.itemsWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.chips}>
                  {section.items.map(item => {
                    const selected = selectedItems.includes(item);
                    const disabled = atMax && !selected;
                    return (
                      <ItemChip
                        key={item}
                        label={item}
                        selected={selected}
                        disabled={disabled}
                        activeColor={section.bgColor}
                        onPress={() => toggleItem(section.id, item)}
                      />
                    );
                  })}
                </View>
              </View>
            </View>
          );
        })}

        <View style={styles.freezingSection}>
          <Text style={[styles.freezingLabel, { color: colors.foreground }]}>Frase "Freezing" (per...)</Text>
          <TextInput
            style={[styles.freezingInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            placeholder="Inserisci la frase del paziente..."
            placeholderTextColor={colors.mutedForeground}
            value={freezingText}
            onChangeText={setFreezingText}
            multiline
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, {
        backgroundColor: colors.background,
        borderTopColor: colors.border,
        paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 12,
      }]}>
        <TouchableOpacity
          style={[styles.completeBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowSummary(true)}
          activeOpacity={0.8}
        >
          <Feather name="check-circle" size={20} color="#fff" />
          <Text style={styles.completeBtnText}>Completa seduta</Text>
        </TouchableOpacity>
      </View>

      <SummaryModal
        visible={showSummary}
        template={template}
        selections={selections}
        freezingText={freezingText}
        initialNotes={editSession?.notes}
        isEditing={!!editSession}
        onSave={handleSave}
        onCancel={() => setShowSummary(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 16, gap: 16 },
  templatePicker: { gap: 8 },
  pickerLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 4 },
  templateRow: { gap: 8, paddingHorizontal: 2 },
  templateChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  templateChipText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  section: { gap: 0, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  sectionTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', flex: 1 },
  sectionBadge: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  selectionPreview: { paddingHorizontal: 16, paddingVertical: 8 },
  selectionText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  itemsWrap: { padding: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  freezingSection: { gap: 8, marginTop: 4 },
  freezingLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  freezingInput: { borderWidth: 1, borderRadius: 12, padding: 14, minHeight: 90, fontSize: 15, fontFamily: 'Inter_400Regular' },
  footer: { padding: 16, paddingTop: 12, borderTopWidth: 1 },
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 14, paddingVertical: 16 },
  completeBtnText: { color: '#fff', fontSize: 17, fontFamily: 'Inter_700Bold' },
});

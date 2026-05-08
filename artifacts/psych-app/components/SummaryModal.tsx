import React, { useState } from 'react';
import {
  Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Platform, KeyboardAvoidingView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { Template, SessionSelection } from '@/types';

interface Props {
  visible: boolean;
  template: Template;
  selections: SessionSelection[];
  freezingText: string;
  initialNotes?: string;
  isEditing?: boolean;
  onSave: (notes: string) => void;
  onCancel: () => void;
}

export function SummaryModal({
  visible, template, selections, freezingText, initialNotes = '', isEditing, onSave, onCancel,
}: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [notes, setNotes] = useState(initialNotes);

  const sections = template.sections;
  const s1 = selections.find(s => s.sectionId === sections[0]?.id);
  const s2 = selections.find(s => s.sectionId === sections[1]?.id);
  const s3 = selections.find(s => s.sectionId === sections[2]?.id);

  const freezing = s1?.items.join(' / ') || '—';
  const eventi = s2?.items.join(' / ') || '—';
  const caratteristiche = s3?.items.join(' / ') || '—';
  const per = freezingText || '—';

  function handleSave() {
    onSave(notes);
    setNotes('');
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={onCancel} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.cancel, { color: colors.mutedForeground }]}>Annulla</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {isEditing ? 'Modifica seduta' : 'Riepilogo seduta'}
          </Text>
          <TouchableOpacity onPress={handleSave} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.save, { color: colors.primary }]}>Salva</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.summaryBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Frase riepilogativa</Text>
            <Text style={[styles.summaryText, { color: colors.foreground }]}>
              {'Lo '}
              <Text style={{ fontFamily: 'Inter_700Bold', color: colors.primary }}>{freezing}</Text>
              {' per '}
              <Text style={{ fontFamily: 'Inter_600SemiBold', color: colors.foreground }}>{per}</Text>
              {' mi vuole proteggere da '}
              <Text style={{ fontFamily: 'Inter_700Bold', color: '#D62839' }}>{eventi}</Text>
              {' e da una situazione/realtà/esperienza '}
              <Text style={{ fontFamily: 'Inter_700Bold', color: '#7C3AED' }}>{caratteristiche}</Text>
            </Text>
          </View>

          {sections.map((section, idx) => {
            const sel = selections.find(s => s.sectionId === section.id);
            if (!sel || sel.items.length === 0) return null;
            return (
              <View key={section.id} style={styles.sectionBlock}>
                <View style={[styles.sectionTag, { backgroundColor: section.bgColor }]}>
                  <Text style={[styles.sectionTagText, { color: section.color }]}>{section.title}</Text>
                </View>
                <View style={styles.itemsWrap}>
                  {sel.items.map(item => (
                    <View key={item} style={[styles.itemBadge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                      <Text style={[styles.itemText, { color: colors.foreground }]}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}

          <View style={styles.notesSection}>
            <Text style={[styles.notesLabel, { color: colors.foreground }]}>Note aggiuntive</Text>
            <TextInput
              style={[styles.notesInput, {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
              }]}
              placeholder="Aggiungi note opzionali..."
              placeholderTextColor={colors.mutedForeground}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
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
  cancel: { fontSize: 16, fontFamily: 'Inter_400Regular' },
  headerTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  save: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 16 },
  summaryBox: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  summaryLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.8 },
  summaryText: { fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 24 },
  sectionBlock: { gap: 10 },
  sectionTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  sectionTagText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  itemsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  itemBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  itemText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  notesSection: { gap: 8, marginTop: 8 },
  notesLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
});

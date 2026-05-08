import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAppContext } from '@/context/AppContext';
import { Template, TemplateSection } from '@/types';
import { generateId } from '@/utils/generateId';

export default function TemplateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { templates, updateTemplate } = useAppContext();

  const original = templates.find(t => t.id === id);
  const [template, setTemplate] = useState<Template | null>(original ?? null);
  const [addingItemSection, setAddingItemSection] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  if (!template) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Template' }} />
        <Text style={{ color: colors.foreground, padding: 20 }}>Template non trovato</Text>
      </View>
    );
  }

  function setT(fn: (prev: Template) => Template) {
    setTemplate(fn);
    setHasChanges(true);
  }

  function handleSave() {
    if (!template) return;
    updateTemplate(template.id, template);
    setHasChanges(false);
    router.back();
  }

  function removeItem(sectionId: string, item: string) {
    setT(t => ({
      ...t,
      sections: t.sections.map(s =>
        s.id === sectionId ? { ...s, items: s.items.filter(i => i !== item) } : s
      ),
    }));
  }

  function addItem(sectionId: string) {
    const text = newItemText.trim();
    if (!text) return;
    setT(t => ({
      ...t,
      sections: t.sections.map(s =>
        s.id === sectionId ? { ...s, items: [...s.items, text] } : s
      ),
    }));
    setNewItemText('');
    setAddingItemSection(null);
  }

  function updateName(name: string) {
    setT(t => ({ ...t, name }));
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Modifica template',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} disabled={!hasChanges}>
              <Text style={[styles.saveBtn, { color: hasChanges ? colors.primary : colors.mutedForeground }]}>Salva</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.nameSection}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Nome template</Text>
          <TextInput
            style={[styles.nameInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            value={template.name}
            onChangeText={updateName}
          />
        </View>

        {template.sections.map(section => (
          <View key={section.id} style={styles.sectionBlock}>
            <View style={[styles.sectionHeader, { backgroundColor: section.bgColor }]}>
              <Text style={[styles.sectionTitle, { color: section.color }]}>{section.title}</Text>
              <Text style={[styles.sectionCount, { color: section.color, opacity: 0.8 }]}>
                {section.items.length} voci
              </Text>
            </View>
            <View style={[styles.itemsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.chips}>
                {section.items.map(item => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.editChip, { backgroundColor: colors.muted, borderColor: colors.border }]}
                    onLongPress={() => Alert.alert('Elimina voce', `Eliminare "${item}"?`, [
                      { text: 'Annulla', style: 'cancel' },
                      { text: 'Elimina', style: 'destructive', onPress: () => removeItem(section.id, item) },
                    ])}
                    onPress={() => {}}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, { color: colors.foreground }]}>{item}</Text>
                  </TouchableOpacity>
                ))}
                {addingItemSection === section.id ? (
                  <View style={[styles.addChip, { borderColor: section.bgColor }]}>
                    <TextInput
                      style={[styles.addInput, { color: colors.foreground }]}
                      placeholder="Nuova voce..."
                      placeholderTextColor={colors.mutedForeground}
                      value={newItemText}
                      onChangeText={setNewItemText}
                      autoFocus
                      onSubmitEditing={() => addItem(section.id)}
                      returnKeyType="done"
                      blurOnSubmit={false}
                    />
                    <TouchableOpacity onPress={() => addItem(section.id)}>
                      <Feather name="check" size={16} color={section.bgColor} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setAddingItemSection(null); setNewItemText(''); }}>
                      <Feather name="x" size={16} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.addBtn, { borderColor: section.bgColor }]}
                    onPress={() => { setAddingItemSection(section.id); setNewItemText(''); }}
                  >
                    <Feather name="plus" size={14} color={section.bgColor} />
                    <Text style={[styles.addBtnText, { color: section.bgColor }]}>Aggiungi</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ))}

        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          Tieni premuto su una voce per eliminarla
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  saveBtn: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  content: { padding: 16, gap: 16 },
  nameSection: { gap: 6 },
  label: { fontSize: 12, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.8 },
  nameInput: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  sectionBlock: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  sectionTitle: { fontSize: 13, fontFamily: 'Inter_700Bold', flex: 1 },
  sectionCount: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  itemsContainer: { padding: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  editChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, margin: 2 },
  chipText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  addChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, margin: 2,
  },
  addInput: { fontSize: 13, fontFamily: 'Inter_400Regular', minWidth: 80, maxWidth: 160 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5,
    borderStyle: 'dashed', margin: 2,
  },
  addBtnText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  hint: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});

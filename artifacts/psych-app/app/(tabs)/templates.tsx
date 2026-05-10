import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useAppContext } from '@/context/AppContext';
import { TemplateCard } from '@/components/TemplateCard';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';

export default function TemplatesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { templates, addTemplate, deleteTemplate, duplicateTemplate } = useAppContext();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  function handleAdd() {
    const t = addTemplate('Nuovo template');
    router.push(`/template/${t.id}`);
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Template</Text>
        <TouchableOpacity onPress={handleAdd} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {templates.length === 0 ? (
          <EmptyState icon="layout" title="Nessun template" subtitle="Crea un template per le tue sedute" />
        ) : (
          templates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onPress={() => router.push(`/template/${template.id}`)}
              onDuplicate={() => duplicateTemplate(template.id)}
              onDelete={() => setDeleteTarget({ id: template.id, name: template.name })}
              canDelete={templates.length > 1}
            />
          ))
        )}
      </ScrollView>

      <ConfirmDeleteModal
        visible={deleteTarget !== null}
        title="Elimina template"
        message={`Eliminare il template "${deleteTarget?.name ?? ''}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteTemplate(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
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
  addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16 },
});

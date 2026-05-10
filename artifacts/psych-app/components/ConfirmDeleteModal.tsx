import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({ visible, title, message, onConfirm, onCancel }: Props) {
  const colors = useColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.box, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.mutedForeground }]}>{message}</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.btn} onPress={onCancel}>
              <Text style={[styles.cancelText, { color: colors.foreground }]}>Annulla</Text>
            </TouchableOpacity>
            <View style={[styles.vDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.btn} onPress={onConfirm}>
              <Text style={[styles.deleteText, { color: colors.destructive }]}>Elimina</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  box: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 320,
    overflow: 'hidden',
  },
  title: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    paddingTop: 6,
    paddingBottom: 20,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  divider: { height: 1 },
  buttons: { flexDirection: 'row' },
  btn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vDivider: { width: 1 },
  cancelText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  deleteText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
});

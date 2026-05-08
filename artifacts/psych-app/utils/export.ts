import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Patient, Template, Session } from '@/types';

interface ExportData {
  exportedAt: string;
  version: string;
  patients?: Patient[];
  templates?: Template[];
  sessions?: Session[];
}

async function shareJSON(data: ExportData, filename: string): Promise<void> {
  const json = JSON.stringify(data, null, 2);

  if (Platform.OS === 'web') {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  const dir = FileSystem.cacheDirectory;
  if (!dir) throw new Error('Directory cache non disponibile sul dispositivo');

  const uri = `${dir}${filename}`;
  await FileSystem.writeAsStringAsync(uri, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) throw new Error('Condivisione non disponibile su questo dispositivo');

  await Sharing.shareAsync(uri, {
    mimeType: 'application/json',
    dialogTitle: 'Esporta dati',
    UTI: 'public.json',
  });
}

export async function exportAllData(
  patients: Patient[],
  templates: Template[],
  sessions: Session[]
): Promise<void> {
  await shareJSON(
    { exportedAt: new Date().toISOString(), version: '1.0', patients, templates, sessions },
    `psychsession_backup_${Date.now()}.json`
  );
}

export async function exportPatient(
  patient: Patient,
  sessions: Session[],
  templates: Template[]
): Promise<void> {
  const patientSessions = sessions.filter(s => s.patientId === patient.id);
  await shareJSON(
    {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      patients: [patient],
      sessions: patientSessions,
      templates,
    },
    `paziente_${patient.name.replace(/\s+/g, '_')}_${Date.now()}.json`
  );
}

export async function exportTemplates(templates: Template[]): Promise<void> {
  await shareJSON(
    { exportedAt: new Date().toISOString(), version: '1.0', templates },
    `template_${Date.now()}.json`
  );
}

export async function importFromFile(): Promise<ExportData | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.length) return null;

  const uri = result.assets[0].uri;
  const content = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  const parsed = JSON.parse(content) as ExportData;
  if (!parsed.version) throw new Error('File non valido: manca il campo version');
  return parsed;
}

export function formatSummary(session: Session): string {
  const s1 = session.selections.find(s => s.sectionId === session.templateSnapshot.sections[0]?.id);
  const s2 = session.selections.find(s => s.sectionId === session.templateSnapshot.sections[1]?.id);
  const s3 = session.selections.find(s => s.sectionId === session.templateSnapshot.sections[2]?.id);

  const freezing = s1?.items.join(' / ') || '...';
  const eventi = s2?.items.join(' / ') || '...';
  const caratteristiche = s3?.items.join(' / ') || '...';
  const per = session.freezingText || '...';

  return `Lo ${freezing} per ${per} mi vuole proteggere da ${eventi} e da una situazione/realtà/esperienza ${caratteristiche}`;
}

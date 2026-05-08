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
  const uri = FileSystem.documentDirectory + filename;
  await FileSystem.writeAsStringAsync(uri, json, { encoding: FileSystem.EncodingType.UTF8 });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Esporta dati' });
  }
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
    { exportedAt: new Date().toISOString(), version: '1.0', patients: [patient], sessions: patientSessions, templates },
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
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.length) return null;

  const uri = result.assets[0].uri;
  const content = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 });
  const parsed = JSON.parse(content) as ExportData;

  if (!parsed.version) throw new Error('File non valido');
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

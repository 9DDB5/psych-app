import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Patient, Template, Session, SessionSelection } from '@/types';
import { generateId } from '@/utils/generateId';
import { createDefaultTemplate } from '@/utils/defaultTemplate';

interface AppState {
  patients: Patient[];
  templates: Template[];
  sessions: Session[];
}

interface AppContextValue extends AppState {
  isLoaded: boolean;
  addPatient: (name: string, notes?: string) => Patient;
  updatePatient: (id: string, updates: Partial<Omit<Patient, 'id' | 'createdAt'>>) => void;
  deletePatient: (id: string) => void;
  addTemplate: (name: string) => Template;
  updateTemplate: (id: string, template: Template) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => Template | null;
  addSession: (data: Omit<Session, 'id' | 'completedAt'>) => Session;
  updateSession: (id: string, data: Partial<Omit<Session, 'id'>>) => void;
  deleteSession: (id: string) => void;
  duplicateSession: (id: string) => Session | null;
  getPatientSessions: (patientId: string) => Session[];
  importData: (data: Partial<AppState>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);
const STORAGE_KEY = 'psych_app_v1';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({ patients: [], templates: [], sessions: [] });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setState(JSON.parse(raw) as AppState);
        } else {
          setState({ patients: [], templates: [createDefaultTemplate()], sessions: [] });
        }
      } catch {
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const persist = useCallback((next: AppState) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  function update(fn: (prev: AppState) => AppState) {
    setState(prev => {
      const next = fn(prev);
      persist(next);
      return next;
    });
  }

  function addPatient(name: string, notes = ''): Patient {
    const patient: Patient = { id: generateId(), name, notes, createdAt: new Date().toISOString() };
    update(s => ({ ...s, patients: [...s.patients, patient] }));
    return patient;
  }

  function updatePatient(id: string, updates: Partial<Omit<Patient, 'id' | 'createdAt'>>) {
    update(s => ({ ...s, patients: s.patients.map(p => p.id === id ? { ...p, ...updates } : p) }));
  }

  function deletePatient(id: string) {
    update(s => ({
      ...s,
      patients: s.patients.filter(p => p.id !== id),
      sessions: s.sessions.filter(se => se.patientId !== id),
    }));
  }

  function addTemplate(name: string): Template {
    const base = createDefaultTemplate();
    const template: Template = { ...base, id: generateId(), name, createdAt: new Date().toISOString() };
    update(s => ({ ...s, templates: [...s.templates, template] }));
    return template;
  }

  function updateTemplate(id: string, template: Template) {
    update(s => ({ ...s, templates: s.templates.map(t => t.id === id ? template : t) }));
  }

  function deleteTemplate(id: string) {
    update(s => ({ ...s, templates: s.templates.filter(t => t.id !== id) }));
  }

  function duplicateTemplate(id: string): Template | null {
    const original = state.templates.find(t => t.id === id);
    if (!original) return null;
    const copy: Template = {
      ...original,
      id: generateId(),
      name: original.name + ' (copia)',
      createdAt: new Date().toISOString(),
      sections: original.sections.map(sec => ({ ...sec, id: generateId(), items: [...sec.items] })),
    };
    update(s => ({ ...s, templates: [...s.templates, copy] }));
    return copy;
  }

  function addSession(data: Omit<Session, 'id' | 'completedAt'>): Session {
    const session: Session = { ...data, id: generateId(), completedAt: new Date().toISOString() };
    update(s => ({ ...s, sessions: [...s.sessions, session] }));
    return session;
  }

  function updateSession(id: string, data: Partial<Omit<Session, 'id'>>) {
    update(s => ({ ...s, sessions: s.sessions.map(se => se.id === id ? { ...se, ...data } : se) }));
  }

  function deleteSession(id: string) {
    update(s => ({ ...s, sessions: s.sessions.filter(se => se.id !== id) }));
  }

  function duplicateSession(id: string): Session | null {
    const original = state.sessions.find(s => s.id === id);
    if (!original) return null;
    const copy: Session = {
      ...original,
      id: generateId(),
      completedAt: new Date().toISOString(),
      selections: original.selections.map(sel => ({ ...sel, items: [...sel.items] })),
    };
    update(s => ({ ...s, sessions: [...s.sessions, copy] }));
    return copy;
  }

  function getPatientSessions(patientId: string): Session[] {
    return state.sessions
      .filter(s => s.patientId === patientId)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }

  function importData(data: Partial<AppState>) {
    update(s => ({
      patients: data.patients ? [...s.patients, ...data.patients.filter(p => !s.patients.find(x => x.id === p.id))] : s.patients,
      templates: data.templates ? [...s.templates, ...data.templates.filter(t => !s.templates.find(x => x.id === t.id))] : s.templates,
      sessions: data.sessions ? [...s.sessions, ...data.sessions.filter(se => !s.sessions.find(x => x.id === se.id))] : s.sessions,
    }));
  }

  const value: AppContextValue = {
    ...state, isLoaded,
    addPatient, updatePatient, deletePatient,
    addTemplate, updateTemplate, deleteTemplate, duplicateTemplate,
    addSession, updateSession, deleteSession, duplicateSession,
    getPatientSessions, importData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

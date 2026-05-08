export interface TemplateSection {
  id: string;
  title: string;
  items: string[];
  maxSelect?: number;
  color: string;
  bgColor: string;
}

export interface Template {
  id: string;
  name: string;
  createdAt: string;
  sections: TemplateSection[];
}

export interface Patient {
  id: string;
  name: string;
  notes: string;
  createdAt: string;
}

export interface SessionSelection {
  sectionId: string;
  items: string[];
}

export interface Session {
  id: string;
  patientId: string;
  templateId: string;
  templateSnapshot: Template;
  freezingText: string;
  selections: SessionSelection[];
  completedAt: string;
  notes: string;
}

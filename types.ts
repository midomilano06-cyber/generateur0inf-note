export interface Option {
  value: string;
  label: string;
}

export type SectionType = 'radio' | 'checkbox';

export interface Patient {
  id: string;
  name: string;
  room?: string;
  gender: 'Masculin' | 'Féminin';
  allergies?: string;
  diagnosis?: string;
  medicalHistory?: string;
  codeStatus?: 'Réanimation complète' | 'Ne pas réanimer (NPR)';
}

export interface PainState {
  p: string[];
  q: string[];
  r: string[];
  site: string;
  s: string;
  t: string[];
  u: string[];
  medicament: string;
  interventionsNonPharma: string[];
}

export interface PainField {
  id: keyof Omit<PainState, 'medicament' | 'interventionsNonPharma' | 'site'>;
  label: string;
  type: 'radio' | 'checkbox';
  options: Option[];
}

export interface FormState {
  quart: string;
  gender: string;
  heure: string;
  // Admission fields
  admissionCheckboxes: string[];
  orientation: string[];
  autonomie: string;
  effetsPersonnels: string;
  accesVeineux: boolean;
  accesVeineux_gauge: string;
  accesVeineux_site: string;
  piccLine: boolean;
  piccLine_site: string;
  drains: string[];
  sondes: string[];
  // Other sections
  position: string[];
  etatEveil: string;
  signesVitaux: string;
  signesNeuro: string;
  respiratoire: string[];
  respiratoire_medicament: string;
  respiratoire_interventions: string[];
  respiratoire_o2_litres: string;
  digestif: string[];
  digestif_medicament: string;
  digestif_interventions: string[];
  urinaire: string[];
  urinaire_medicament: string;
  urinaire_interventions: string[];
  tegumentaire: string[];
  tegumentaire_medicament: string;
  tegumentaire_interventions: string[];
  geriatrie: string[];
  finDeVie: string[]; // Added for end-of-life symptoms
  finDeVie_other: string; // Added for custom end-of-life symptoms
  observations: string[];
  visites: string;
  particularites: string;
  douleur: PainState;
  addExtraSpace: boolean; // Added for extra space in offline note
}

// Define explicitly all keys that should NOT be part of SectionData['id']
type OmittedSectionDataKeys =
  | 'quart'
  | 'gender'
  | 'heure'
  // Admission related
  | 'admissionCheckboxes'
  | 'orientation'
  | 'autonomie'
  | 'effetsPersonnels'
  | 'accesVeineux'
  | 'accesVeineux_gauge'
  | 'accesVeineux_site'
  | 'piccLine'
  | 'piccLine_site'
  | 'drains'
  | 'sondes'
  // Specific medication/intervention/value fields
  | 'respiratoire_medicament'
  | 'respiratoire_interventions'
  | 'respiratoire_o2_litres'
  | 'digestif_medicament'
  | 'digestif_interventions'
  | 'urinaire_medicament'
  | 'urinaire_interventions'
  | 'tegumentaire_medicament'
  | 'tegumentaire_interventions'
  | 'finDeVie_other'
  // Special root sections handled separately
  | 'douleur'
  | 'particularites'
  | 'addExtraSpace'; // Exclude from SectionData keys

export interface SectionData {
  id: keyof Omit<FormState, OmittedSectionDataKeys>;
  title: string;
  type: SectionType;
  options: Option[];
  hasIntervention?: boolean;
  interventions?: Option[];
  hasOtherField?: boolean; // Added for 'other' text input
}

export interface LayoutSettings {
    lineHeight: number;
    fontSize: number;
    textTopPosition: number;
    textLeftPosition: number;
    textBlockWidth: number;
    letterSpacing: number;
    fontWeight: number;
    fontFamily: string;
    isOfflineQueueEnabled?: boolean; // Added for offline queuing control
    addExtraSpaceAssistant: boolean; // NEW: Added for extra space in assistant note
}

export interface SavedState {
  formState: FormState;
  aiNote: string;
  layoutSettings?: LayoutSettings;
  timestamp?: number;
}

export interface Scenario {
  label: string;
  state: Partial<FormState>;
}

export interface ScenarioCategory {
  title: string;
  scenarios: Scenario[];
}

export interface GeneratedNoteRecord {
  patientId: string | null;
  patientName: string;
  noteContent: string;
  timestamp: number;
  formState: FormState; // Store the state that generated the note
  isOffline?: boolean;
}

// NEW: Clinical Assistant Request for offline processing
export interface ClinicalAssistantRequest {
  id: string; // Unique ID for the request
  question: string;
  complexity: string;
  timestamp: number;
  response: string | null;
  error: string | null;
  status: 'pending' | 'completed'; // 'pending' for offline, 'completed' for processed
  addExtraSpace: boolean; // To respect user setting when processing offline
  includeArticleKnowledgeBase?: boolean; // NEW: Added for include article knowledge base preference
}

// NEW: Knowledge Base Article for offline storage
export interface KnowledgeBaseArticle {
  id: string; // Unique ID for the article
  title: string; // User-provided or auto-generated title
  content: string; // Full article content
  timestamp: number;
  status: 'stored' | 'error'; // 'stored' once in local, 'error' on storage/processing failure
}
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { sectionsData, initialPainState, scenariosData, defaultLayoutSettings, complexityOptions, initialFormState as defaultInitialFormState, painFieldsData } from './constants';
import type { FormState, PainState, Option, SavedState, LayoutSettings, Patient, SectionData, GeneratedNoteRecord, ClinicalAssistantRequest, KnowledgeBaseArticle } from './types';
import CollapsibleSection from './components/CollapsibleSection';
import RadioGroup from './components/RadioGroup';
import CheckboxGroup from './components/CheckboxGroup';
import PainSection from './components/PainSection';
import GeneratedNote from './components/GeneratedNote';
import Header from './components/Header';
import Footer from './components/Footer';
import ParticularitesSection from './components/ParticularitesSection';
import QuickScenarios from './components/QuickScenarios';
import AdmissionSection from './components/AdmissionSection';
import { ClinicalAssistant } from './components/ClinicalAssistant';
import SaveLoad from './components/SaveLoad';
import PatientManager from './components/PatientManager';
import PatientModal from './components/PatientModal';
import ShiftReportGenerator from './components/ShiftReportGenerator';
import AccessCodeScreen from './components/AccessCodeScreen'; // New import
import ArticleAssistant from './components/ArticleAssistant'; // NEW: Import ArticleAssistant

const App: React.FC = () => {
  // Auth State
  const [accessGranted, setAccessGranted] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSetupMode, setIsSetupMode] = useState(false);
  
  useEffect(() => {
      const storedCode = localStorage.getItem('appAccessCode');
      if (!storedCode) {
          setIsSetupMode(true);
      }
      if (sessionStorage.getItem('isLoggedIn') === 'true' && storedCode) {
          setAccessGranted(true);
      }
  }, []);

  const handleAccessGranted = (code: string) => {
      const storedCode = localStorage.getItem('appAccessCode');
      if (storedCode) { // Login mode
          if (code === storedCode) {
              setAccessGranted(true);
              sessionStorage.setItem('isLoggedIn', 'true');
              setAuthError(null);
          } else {
              setAuthError("Code d'accès incorrect.");
          }
      } else { // First time setup
          if (code.trim() === '') {
              setAuthError("Le code ne peut pas être vide.");
              return;
          }
          localStorage.setItem('appAccessCode', code);
          setAccessGranted(true);
          sessionStorage.setItem('isLoggedIn', 'true');
          setAuthError(null);
      }
  };


  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);
  const [forceOffline, setForceOffline] = useState(false);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const [noteToRegenerate, setNoteToRegenerate] = useState<GeneratedNoteRecord | null>(null);

  const effectiveIsOnline = isOnline && !forceOffline;

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
        return localStorage.getItem('theme') as 'light' | 'dark';
    }
    return 'light'; // Default theme
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  const handleToggleForceOffline = () => {
    setForceOffline(prev => !prev);
  };

  const initialFormState: FormState = useMemo(() => defaultInitialFormState, []);

  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [aiNote, setAiNote] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);
  const [openRightSectionId, setOpenRightSectionId] = useState<string | null>('articleAssistant'); // MODIFIED: 'articleAssistant' is open by default
  
  // Patient Management State
  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
        const saved = localStorage.getItem('appPatients');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error("Failed to parse patients from localStorage", e);
        return [];
    }
  });
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('appPatients', JSON.stringify(patients));
  }, [patients]);
  
  useEffect(() => {
    if (selectedPatientId) {
        const selectedPatient = patients.find(p => p.id === selectedPatientId);
        if (selectedPatient) {
            setFormState(prevState => ({...prevState, gender: selectedPatient.gender}));
        }
    } else {
        if (!noteToRegenerate) { // Don't clear gender if we are in regeneration mode
          setFormState(prevState => ({...prevState, gender: ''}));
        }
    }
  }, [selectedPatientId, patients, noteToRegenerate]);


  const handleSavePatient = (patientToSave: Omit<Patient, 'id'> & { id?: string }) => {
    if (patientToSave.id) { // Update existing patient
        setPatients(prev => prev.map(p => p.id === patientToSave.id ? { ...p, ...patientToSave } as Patient : p));
    } else { // Add new patient
        const newPatient: Patient = { ...patientToSave, id: Date.now().toString() };
        setPatients(prev => [...prev, newPatient]);
    }
  };

  const handleDeletePatient = (patientId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce patient ?")) {
        setPatients(prev => prev.filter(p => p.id !== patientId));
        if (selectedPatientId === patientId) {
            setSelectedPatientId(null);
        }
    }
  };
  
  const [settings, setSettings] = useState<LayoutSettings>(() => {
    try {
        const savedSettings = localStorage.getItem('noteLayoutSettings');
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            // One-time migration for old fontSize format (multiplier) to new format (points)
            if (parsed.fontSize && parsed.fontSize < 7) {
                parsed.fontSize = parsed.fontSize * 5;
            }
            return { ...defaultLayoutSettings, ...parsed };
        }
        return defaultLayoutSettings;
    } catch (e) {
        console.error("Failed to parse layout settings from localStorage", e);
        return defaultLayoutSettings;
    }
  });
  
  // Clinical Assistant State
  const [clinicalQuestion, setClinicalQuestion] = useState('');
  const [complexityLevel, setComplexityLevel] = useState('Simple');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [isGeneratingAssistant, setIsGeneratingAssistant] = useState(false);
  const [assistantError, setAssistantError] = useState<string | null>(null);
  // NEW: Clinical Assistant Offline Queue State
  const [clinicalAssistantQueue, setClinicalAssistantQueue] = useState<ClinicalAssistantRequest[]>(() => {
    try {
        const savedQueue = localStorage.getItem('clinicalAssistantQueue');
        return savedQueue ? JSON.parse(savedQueue) : [];
    } catch (e) {
        console.error("Failed to parse clinical assistant queue from localStorage", e);
        return [];
    }
  });
  const [isProcessingAssistantQueue, setIsProcessingAssistantQueue] = useState(false);
  const [assistantQueueMessage, setAssistantQueueMessage] = useState<string | null>(null);
  const [includeArticleKnowledgeBase, setIncludeArticleKnowledgeBase] = useState(false); // NEW: Toggle for including article knowledge base

  useEffect(() => {
    localStorage.setItem('clinicalAssistantQueue', JSON.stringify(clinicalAssistantQueue));
  }, [clinicalAssistantQueue]);

  // NEW: Article Knowledge Base State
  const [articleContent, setArticleContent] = useState('');
  const [isIngestingArticle, setIsIngestingArticle] = useState(false); // For PDF loading, etc.
  const [articleIngestionMessage, setArticleIngestionMessage] = useState<string | null>(null);
  const [knowledgeBaseArticles, setKnowledgeBaseArticles] = useState<KnowledgeBaseArticle[]>(() => {
    try {
        const savedArticles = localStorage.getItem('knowledgeBaseArticles');
        return savedArticles ? JSON.parse(savedArticles) : [];
    } catch (e) {
        console.error("Failed to parse knowledge base articles from localStorage", e);
        return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('knowledgeBaseArticles', JSON.stringify(knowledgeBaseArticles));
  }, [knowledgeBaseArticles]);


  // Shift Report State
  const [generatedNotesHistory, setGeneratedNotesHistory] = useState<GeneratedNoteRecord[]>([]);
  const [shiftReportOutput, setShiftReportOutput] = useState('');
  const [isGeneratingShiftReport, setIsGeneratingShiftReport] = useState(false);
  const [shiftReportError, setShiftReportError] = useState<string | null>(null);


  const handleUpdateNoteInHistory = useCallback((patientId: string | null, timestamp: number, newContent: string) => {
    setGeneratedNotesHistory(prevHistory => 
      prevHistory.map(record => 
        (record.patientId === patientId && record.timestamp === timestamp)
          ? { ...record, noteContent: newContent }
          : record
      )
    );
  }, []);

  const handleDeleteNoteFromHistory = useCallback((timestamp: number) => {
    setGeneratedNotesHistory(prevHistory => prevHistory.filter(note => note.timestamp !== timestamp));
  }, []);

  const handleRecallNote = useCallback((record: GeneratedNoteRecord) => {
    setFormState(record.formState);
    setSelectedPatientId(record.patientId);
    setNoteToRegenerate(record);
    // Optionally scroll to top or provide some visual feedback
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setAiNote(`Mode de regénération pour la note de ${new Date(record.timestamp).toLocaleTimeString()}. Modifiez le formulaire et cliquez sur "Générer" pour mettre à jour.`);
  }, []);

  // Save/Load State
  const [savedStates, setSavedStates] = useState<Record<string, SavedState>>(() => {
    try {
        const saved = localStorage.getItem('savedNotes');
        return saved ? JSON.parse(saved) : {};
    } catch (e) {
        console.error("Failed to parse saved notes from localStorage", e);
        return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('savedNotes', JSON.stringify(savedStates));
  }, [savedStates]);

  useEffect(() => {
    localStorage.setItem('noteLayoutSettings', JSON.stringify(settings));
  }, [settings]);

  // Handle section toggling
  const handleSectionToggle = useCallback((sectionId: string) => {
    setOpenSectionId(prevId => (prevId === sectionId ? null : sectionId));
  }, []);
  
  // Handle right column section toggling
  const handleRightSectionToggle = useCallback((sectionId: string) => {
    setOpenRightSectionId(prevId => (prevId === sectionId ? null : sectionId));
  }, []);

  const isContextSectionFilled = useMemo((): boolean => {
    return formState.gender !== '' || formState.quart !== '' || formState.heure !== '';
  }, [formState]);

  const isAdmissionSectionFilled = (state: FormState): boolean => {
    const { admissionCheckboxes, orientation, autonomie, effetsPersonnels, accesVeineux, piccLine, drains, sondes, accesVeineux_site, piccLine_site } = state;
    return admissionCheckboxes.length > 0 || orientation.length > 0 || autonomie !== '' || effetsPersonnels.trim() !== '' || accesVeineux || piccLine || drains.length > 0 || sondes.length > 0 || accesVeineux_site.trim() !== '' || piccLine_site.trim() !== '';
  };

  // Fix: Refine sectionId type for more accurate type checking within the function.
  const isSectionFilled = useCallback((sectionId: SectionData['id'] | 'douleur' | 'particularites' | 'contexte' | 'admission', state: FormState): boolean => {
    if (sectionId === 'contexte') {
        return state.gender !== '' || state.quart !== '' || state.heure !== '';
    }
    if (sectionId === 'admission') {
        return isAdmissionSectionFilled(state);
    }
    if (sectionId === 'douleur') {
      const { p, q, r, s, t, u, site, medicament, interventionsNonPharma } = state.douleur;
      return p.length > 0 || q.length > 0 || r.length > 0 || s !== '' || t.length > 0 || u.length > 0 || site.trim() !== '' || medicament.trim() !== '' || interventionsNonPharma.length > 0;
    }
    if (sectionId === 'particularites') {
      return state.particularites.trim() !== '';
    }
    // 'finDeVie' is a valid SectionData ID, so it will fall through to the general logic.
    // However, it has a specific `_other` field that needs to be checked.
    if (sectionId === 'finDeVie') {
      return state.finDeVie.length > 0 || state.finDeVie_other.trim() !== '';
    }
    const value = state[sectionId as keyof FormState];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim() !== '';
    return false;
  }, [isAdmissionSectionFilled]);

  const handleRadioChange = useCallback((sectionId: keyof FormState, value: string) => {
    setFormState(prevState => ({ ...prevState, [sectionId]: value }));
  }, []);

  const handleHeureChange = useCallback((value: string) => {
    setFormState(prevState => ({ ...prevState, heure: value }));
  }, []);

  const handleCheckboxChange = useCallback((sectionId: keyof FormState, value: string) => {
    setFormState(prevState => {
      const currentValues = prevState[sectionId] as string[];
      const newValues = currentValues.includes(value) ? currentValues.filter(item => item !== value) : [...currentValues, value];
      return { ...prevState, [sectionId]: newValues };
    });
  }, []);

  const handlePainCheckboxChange = useCallback((field: keyof PainState, value: string) => {
    setFormState(prevState => {
      const currentValues = prevState.douleur[field] as string[];
      const newValues = currentValues.includes(value) ? currentValues.filter(item => item !== value) : [...currentValues, value];
      return { ...prevState, douleur: { ...prevState.douleur, [field]: newValues } };
    });
  }, []);

  const handlePainRadioChange = useCallback((field: keyof PainState, value: string) => {
      setFormState(prevState => ({ ...prevState, douleur: { ...prevState.douleur, [field]: value } }));
  }, []);

  const handlePainSiteChange = useCallback((value: string) => {
    setFormState(prevState => ({ ...prevState, douleur: { ...prevState.douleur, site: value } }));
  }, []);

  const handleParticularitesChange = useCallback((value: string) => {
    setFormState(prevState => ({ ...prevState, particularites: value }));
  }, []);

  const handleMedicamentChange = useCallback((sectionId: string, value: string) => {
    const key = `${sectionId}_medicament` as keyof FormState;
    setFormState(prevState => ({ ...prevState, [key]: value }));
  }, []);

  const handleInterventionChange = useCallback((sectionId: string, value: string) => {
    setFormState(prevState => {
      const key = `${sectionId}_interventions` as keyof FormState;
      const currentValues = prevState[key] as string[];
      const newValues = currentValues.includes(value) ? currentValues.filter(item => item !== value) : [...currentValues, value];
      return { ...prevState, [key]: newValues };
    });
  }, []);

  const handlePainMedicamentChange = useCallback((value: string) => {
    setFormState(prevState => ({ ...prevState, douleur: { ...prevState.douleur, medicament: value } }));
  }, []);

  const handlePainNonPharmaChange = useCallback((value: string) => {
    setFormState(prevState => {
      const currentValues = prevState.douleur.interventionsNonPharma;
      const newValues = currentValues.includes(value) ? currentValues.filter(item => item !== value) : [...currentValues, value];
      return { ...prevState, douleur: { ...prevState.douleur, interventionsNonPharma: newValues } };
    });
  }, []);

  const handleRespiratoireO2LitresChange = useCallback((value: string) => {
    setFormState(prevState => ({ ...prevState, respiratoire_o2_litres: value }));
  }, []);

  const handleAdmissionChange = useCallback((field: keyof FormState, value: string | boolean | string[]) => {
      setFormState(prevState => ({...prevState, [field]: value}));
  }, []);

  const handleFinDeVieOtherChange = useCallback((value: string) => {
    setFormState(prevState => ({...prevState, finDeVie_other: value}));
  }, []);

  const handleToggleExtraSpace = useCallback(() => {
    setFormState(prevState => ({...prevState, addExtraSpace: !prevState.addExtraSpace}));
  }, []);

  // NEW: Handle toggle for assistant extra space
  const handleToggleExtraSpaceAssistant = useCallback(() => {
    setSettings(prevSettings => ({
      ...prevSettings,
      addExtraSpaceAssistant: !prevSettings.addExtraSpaceAssistant,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormState(initialFormState);
    setAiNote('');
    setGenerationError(null);
    setIsGenerating(false);
    setSelectedPatientId(null);
    setNoteToRegenerate(null);
  }, [initialFormState]);

  const handleScenarioSelect = useCallback((scenarioState: Partial<FormState>) => {
    setFormState(prevState => ({ ...initialFormState, quart: prevState.quart, gender: prevState.gender, ...scenarioState }));
    setOpenSectionId(null);
    setNoteToRegenerate(null);
    setAiNote('');
  }, [initialFormState]);

  const isFormEmpty = useMemo(() => {
    const { quart, gender, ...restOfForm } = formState;
    const { quart: initialQuart, gender: initialGender, ...restOfInitialForm } = initialFormState;
    return JSON.stringify(restOfForm) === JSON.stringify(restOfInitialForm);
  }, [formState, initialFormState]);

  const handleSaveState = useCallback((name: string) => {
    if (name.trim() === '') return;
    const newState: SavedState = {
        formState,
        aiNote,
        layoutSettings: settings,
        timestamp: Date.now(),
    };
    setSavedStates(prev => ({ ...prev, [name]: newState }));
  }, [formState, aiNote, settings]);

  const handleLoadState = useCallback((name: string) => {
    const stateToLoad = savedStates[name];
    if (stateToLoad) {
        setFormState(stateToLoad.formState);
        setAiNote(stateToLoad.aiNote);
        if (stateToLoad.layoutSettings) {
            setSettings(stateToLoad.layoutSettings);
        }
    }
  }, [savedStates]);

  const handleDeleteState = useCallback((name: string) => {
    setSavedStates(prev => {
        const newStates = { ...prev };
        delete newStates[name];
        return newStates;
    });
  }, []);
  
  const buildClinicalData = useCallback((state: FormState, patientId: string | null): string => {
    const parts: string[] = [];
    const { douleur, particularites, quart, gender, heure, finDeVie, finDeVie_other } = state;
    
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
        const patientContext = [];
        if (patient.diagnosis) patientContext.push(`Diagnostic principal: ${patient.diagnosis}.`);
        if (patient.medicalHistory) patientContext.push(`Antécédents pertinents: ${patient.medicalHistory}.`);
        if (patient.allergies) patientContext.push(`ALLERGIES CONNUES: ${patient.allergies}.`);
        if (patient.codeStatus) patientContext.push(`Statut de réanimation: ${patient.codeStatus}.`);
        if (patientContext.length > 0) {
            parts.push(`CONTEXTE PATIENT : ${patientContext.join(' ')}`);
        }
    }

    const contextParts = [];
    if (quart) contextParts.push(`note rédigée durant le quart de ${quart}`);
    if (heure) contextParts.push(`observation faite vers ${heure}`);

    if (contextParts.length > 0) {
        parts.push(`Contexte: ${contextParts.join(', ')}.`);
    }

    if (gender) parts.push(`Genre du patient: ${gender}.`);

    // Section Admission
    const admissionDetails = [];
    if (state.admissionCheckboxes.length > 0) admissionDetails.push(...state.admissionCheckboxes);
    if (state.orientation.length > 0) admissionDetails.push(`Orientation: ${state.orientation.join(', ')}.`);
    else admissionDetails.push("Orientation: Non évaluée ou non orienté(e).");
    if (state.autonomie) admissionDetails.push(`Autonomie fonctionnelle: ${state.autonomie}.`);
    if (state.effetsPersonnels.trim()) admissionDetails.push(`Effets personnels: ${state.effetsPersonnels.trim()}.`);
    
    if (state.accesVeineux) {
        let accesVeineuxText = `Accès veineux (CVP) fonctionnel`;
        if (state.accesVeineux_gauge) accesVeineuxText += `, calibre ${state.accesVeineux_gauge}`;
        if (state.accesVeineux_site) accesVeineuxText += ` au ${state.accesVeineux_site}`;
        admissionDetails.push(accesVeineuxText + '.');
    }
    if (state.piccLine) {
        let piccLineText = 'PICC Line en place et fonctionnel';
        if (state.piccLine_site) piccLineText += ` au ${state.piccLine_site}`;
        admissionDetails.push(piccLineText + '.');
    }
    
    if (state.drains.length > 0) admissionDetails.push(`Drains en place: ${state.drains.join(', ')}.`);
    if (state.sondes.length > 0) admissionDetails.push(`Sondes en place: ${state.sondes.join(', ')}.`);
    
    if (admissionDetails.length > 0) {
        parts.push(`- Admission : ${admissionDetails.join(' ')}`);
    }

    sectionsData.forEach(section => {
        const content = [];
        const selection = state[section.id as keyof FormState];
        
        if (Array.isArray(selection) && selection.length > 0) {
            let processedSelection = selection;
            if (section.id === 'respiratoire' && selection.includes('Utilisation d’O₂') && state.respiratoire_o2_litres) {
                processedSelection = selection.map(item => item === 'Utilisation d’O₂' ? `Utilisation d’O₂ (${state.respiratoire_o2_litres} L/min)` : item);
            }
            content.push(processedSelection.join(', '));
        } else if (typeof selection === 'string' && selection) {
            content.push(section.title.startsWith('Signes vitaux') || section.title.startsWith('Signes neurologiques') ? `${selection}, voir feuille spéciale` : selection);
        }
        
        // Handle 'Fin de vie' section with 'Autre' field
        if (section.id === 'finDeVie') {
            const finDeVieContent = [];
            if (finDeVie.length > 0) {
                finDeVieContent.push(finDeVie.join(', '));
            }
            if (finDeVie.includes('Autre (à préciser)') && finDeVie_other.trim()) {
                finDeVieContent.push(`Autre: ${finDeVie_other.trim()}`);
            }
            if (finDeVieContent.length > 0) {
                parts.push(`- ${section.title} : ${finDeVieContent.join('; ')}.`);
            }
        } else if (content.length > 0) {
            parts.push(`- ${section.title} : ${content.join('; ')}.`);
        }
    });

    const { p, q, r, s, t, u, site, medicament: painMedicament, interventionsNonPharma } = douleur;
    const painDetails = Object.entries({p, q, r, s, t, u})
        .map(([key, value]) => {
            const fieldLabel = painFieldsData.find(f => f.id === key)?.label || key.toUpperCase();
            if (key === 'r') {
                const rValues = Array.isArray(value) ? value : [];
                if (rValues.length === 0 && !site) return null;
                let rText = rValues.join(', ');
                if (site) rText += `${rText ? '; ' : ''}Site: ${site}`;
                return `  - ${fieldLabel} : ${rText}`;
            }
            if ((Array.isArray(value) && value.length > 0) || (typeof value === 'string' && value)) {
                return `  - ${fieldLabel} : ${Array.isArray(value) ? value.join(', ') : value}`;
            }
            return null;
        }).filter(Boolean);

    if (painDetails.length > 0 || painMedicament || (interventionsNonPharma?.length > 0)) {
        let painString = "- Douleur (PQRSTU) :";
        if (painDetails.length > 0) painString += `\n${painDetails.join('\n')}`;
        if (painMedicament) painString += `\n  - Intervention pharmacologique (Médicament) : ${painMedicament}`;
        if (interventionsNonPharma?.length > 0) painString += `\n  - Interventions non pharmacologiques : ${interventionsNonPharma.join(', ')}`;
        parts.push(painString);
    }
      
    if (particularites.trim()) parts.push(`- Particularités / Événements notables : ${particularites.trim()}`);
      
    return parts.filter(Boolean).join('\n');
  }, [patients]);

  const generateNarrativeOfflineNote = useCallback((state: FormState, patientId: string | null): string => {
    const patient = patientId ? patients.find(p => p.id === patientId) : undefined;

    const getPatientPronouns = (g: string) => {
        if (g === 'Masculin') return { subject: 'le patient', subjectCap: 'Le patient', he: 'il', heCap: 'Il', him: 'lui', his: 'son/sa/ses', e: '' };
        if (g === 'Féminin') return { subject: 'la patiente', subjectCap: 'La patiente', he: 'elle', heCap: 'Elle', him: 'lui', his: 'son/sa/ses', e: 'e' };
        return { subject: 'le/la patient(e)', subjectCap: 'Le/la patient(e)', he: 'il/elle', heCap: 'Il/Elle', him: 'lui', his: 'son/sa/ses', e: '(e)' };
    };

    const pronouns = getPatientPronouns(state.gender);

    const formatList = (items: string[], lastSeparator = 'et'): string => {
        if (!items || items.length === 0) return '';
        const filteredItems = items.filter(Boolean);
        if (filteredItems.length === 0) return '';
        if (filteredItems.length === 1) return filteredItems[0];
        if (filteredItems.length === 2) return `${filteredItems[0]} ${lastSeparator} ${filteredItems[1]}`;
        // Fix: Use filteredItems for slice to avoid reference to undefined 'lastItems'
        const last = filteredItems[filteredItems.length - 1];
        return `${filteredItems.slice(0, -1).join(', ')}, ${lastSeparator} ${last}`.replace(/, et ([^,]+)$/, ' et $1');
    };
    
    // Helper to format last item with "et" or "ou"
    const lastItems = (items: string[], separator = 'et'): string => {
        if (items.length === 0) return '';
        if (items.length === 1) return items[0];
        if (items.length === 2) return `${items[0]} ${separator} ${items[1]}`;
        return `${items.slice(0, -1).join(', ')}, ${items[items.length - 1]}`;
    };


    const paragraphs: string[] = [];

    // --- PARAGRAPH 1: General Context & State ---
    let introPara = '';
    if (state.heure) introPara += `Vers ${state.heure}, `;
    
    introPara += `${pronouns.subjectCap}`;
    
    if(patient?.diagnosis) introPara += `, connu${pronouns.e} pour ${patient.diagnosis},`;

    if (state.etatEveil) {
        introPara += ` est trouvé${pronouns.e} ${state.etatEveil.toLowerCase()}. `;
    } else {
        introPara += ` est évalué${pronouns.e}. `;
    }

    const secondaryIntroParts: string[] = [];
    if (state.orientation.length > 0) {
        if (state.orientation.length === 3) {
            secondaryIntroParts.push(`${pronouns.heCap} est orienté${pronouns.e} dans les trois sphères`);
        } else {
            secondaryIntroParts.push(`${pronouns.heCap} est orienté${pronouns.e} au niveau ${formatList(state.orientation.map(o => o.toLowerCase()))}`);
        }
    }
     if (state.signesNeuro === 'Pupilles isocores et réactives') {
        secondaryIntroParts.push(`ses pupilles sont isocores et réactives`);
    } else if (state.signesNeuro && state.signesNeuro !== 'Voir feuille spéciale') {
        secondaryIntroParts.push(`au niveau neurologique, on note ${state.signesNeuro.toLowerCase()}`);
    }

    if (state.position.length > 0) {
        secondaryIntroParts.push(`${pronouns.he} est positionné${pronouns.e} en ${formatList(state.position.map(p => p.toLowerCase()))}`);
    }
    
    if (secondaryIntroParts.length > 0) {
        let firstPart = secondaryIntroParts.shift()!;
        if (firstPart) {
            firstPart = firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
            introPara += [firstPart, ...secondaryIntroParts].join(', ') + '.';
        }
    }
    
    paragraphs.push(introPara.trim());

    // --- PARAGRAPH 2: Systems Assessment ---
    const systemsParaParts: string[] = [];
    if (state.signesVitaux && state.signesVitaux !== 'Voir feuille spéciale') {
        systemsParaParts.push(`Les signes vitaux sont ${state.signesVitaux.toLowerCase()}.`);
    }
    
    const systemDescriptions: string[] = [];
    // Respiratoire
    if (state.respiratoire.length > 0 || state.respiratoire_medicament || state.respiratoire_interventions.length > 0) {
        let details: string[] = [];
        if (state.respiratoire.length > 0) {
            let respItems = state.respiratoire.map(item => {
                if (item === 'Utilisation d’O₂' && state.respiratoire_o2_litres) {
                    return `une oxygénothérapie à ${state.respiratoire_o2_litres} L/min via lunette nasale`;
                }
                return item.toLowerCase();
            });
            details.push(formatList(respItems));
        }
        if (state.respiratoire_medicament) details.push(`administration de ${state.respiratoire_medicament}`);
        if (state.respiratoire_interventions.length > 0) details.push(`interventions appliquées: ${formatList(state.respiratoire_interventions.map(i => i.toLowerCase()))}`);
        systemDescriptions.push(`Sur le plan respiratoire, ${pronouns.subject} présente ${details.join('; ')}`);
    }

    // Digestif
    if (state.digestif.length > 0 || state.digestif_medicament || state.digestif_interventions.length > 0) {
        let details: string[] = [];
        if (state.digestif.length > 0) details.push(formatList(state.digestif.map(d => d.toLowerCase())));
        if (state.digestif_medicament) details.push(`administration de ${state.digestif_medicament}`);
        if (state.digestif_interventions.length > 0) details.push(`interventions: ${formatList(state.digestif_interventions.map(i => i.toLowerCase()))}`);
        systemDescriptions.push(`Le système digestif est marqué par ${details.join('; ')}`);
    }

    // Urinaire
     if (state.urinaire.length > 0 || state.urinaire_medicament || state.urinaire_interventions.length > 0) {
        let details: string[] = [];
        if (state.urinaire.length > 0) details.push(formatList(state.urinaire.map(u => u.toLowerCase())));
        if (state.urinaire_medicament) details.push(`administration de ${state.urinaire_medicament}`);
        if (state.urinaire_interventions.length > 0) details.push(`interventions: ${formatList(state.urinaire_interventions.map(i => i.toLowerCase()))}`);
        systemDescriptions.push(`Au niveau urinaire, on note: ${details.join('; ')}`);
    }
    
    // Tégumentaire
    if (state.tegumentaire.length > 0 || state.tegumentaire_medicament || state.tegumentaire_interventions.length > 0) {
        let details: string[] = [];
        if (state.tegumentaire.length > 0) details.push(formatList(state.tegumentaire.map(t => t.toLowerCase())));
        if (state.tegumentaire_medicament) details.push(`administration de ${state.tegumentaire_medicament}`);
        if (state.tegumentaire_interventions.length > 0) details.push(`interventions: ${formatList(state.tegumentaire_interventions.map(i => i.toLowerCase()))}`);
        systemDescriptions.push(`L'état tégumentaire révèle ${details.join('; ')}`);
    }

    if (systemDescriptions.length > 0) {
        systemsParaParts.push(systemDescriptions.join('. ') + '.');
    }
    if (systemsParaParts.length > 0) {
        paragraphs.push(systemsParaParts.join(' '));
    }


    // --- PARAGRAPH 3: Pain (PQRSTU) ---
    const { p, q, r, s, t, u, site, medicament: painMedicament, interventionsNonPharma } = state.douleur;
    const isPainAssessed = s || p.length > 0 || q.length > 0 || r.length > 0 || site.trim() !== '';
    if (isPainAssessed) {
        let painPara = '';
        if (s === '0 - Aucune douleur') {
            painPara = `${pronouns.subjectCap} nie toute douleur.`;
        } else {
            const severity = s ? s.replace(/^\d+-\d+\s*-\s*/, '').toLowerCase() : 'non évaluée';
            painPara = `${pronouns.subjectCap} rapporte une douleur d'intensité ${severity}`;

            const locationParts: string[] = [];
            if(r.length > 0) locationParts.push(...r.map(i => i.toLowerCase()));
            if(site) locationParts.push(`localisée au ${site}`);
            if(locationParts.length > 0) painPara += `, ${formatList(locationParts, 'et')}`;
            
            if(q.length > 0) painPara += `, de type ${formatList(q.map(i => i.toLowerCase()))}`;

            painPara += '.';

            const detailsParts: string[] = [];
            if (t.length > 0) detailsParts.push(`la douleur est ${formatList(t.map(i => i.toLowerCase()))}`);
            if (p.length > 0) detailsParts.push(`elle est provoquée/aggravée par ${formatList(p.map(i => i.toLowerCase()))}`);
            if (detailsParts.length > 0) painPara += ` ${pronouns.heCap} précise que ${formatList(detailsParts)}.`;

            if (u.length > 0) {
                painPara += ` La douleur a un impact sur ${formatList(u.map(i => i.replace('Impact sur l\'', 'l\'').toLowerCase()))}.`;
            }
        }
        
        const painInterventions: string[] = [];
        if (painMedicament) painInterventions.push(`administration de ${painMedicament}`);
        if (interventionsNonPharma.length > 0) painInterventions.push(...interventionsNonPharma.map(i => i.toLowerCase()));
        
        if (painInterventions.length > 0) {
            painPara += ` Pour la soulager, les interventions suivantes ont été appliquées: ${formatList(painInterventions)}.`;
        }
        paragraphs.push(painPara);
    }


    // --- PARAGRAPH 4: Admission, Devices & Particularities ---
    const lastParaParts: string[] = [];
    if (isAdmissionSectionFilled(state)) {
        const admissionDetails = [];
        if (state.autonomie) admissionDetails.push(`son autonomie est de '${state.autonomie.toLowerCase()}'`);
        
        if (state.accesVeineux) {
            let accesVeineuxText = `un accès veineux`;
            if (state.accesVeineux_gauge) accesVeineuxText += ` (calibre ${state.accesVeineux_gauge})`;
            if (state.accesVeineux_site) accesVeineuxText += ` au ${state.accesVeineux_site}`;
            admissionDetails.push(accesVeineuxText);
        }
        if (state.piccLine) {
            let piccLineText = `un PICC line`;
            if (state.piccLine_site) piccLineText += ` au ${state.piccLine_site}`;
            admissionDetails.push(piccLineText);
        }
        if (state.drains.length > 0) admissionDetails.push(`des drains (${formatList(state.drains)})`);
        if (state.sondes.length > 0) admissionDetails.push(`des sondes (${formatList(state.sondes)})`);

        if (admissionDetails.length > 0) {
            lastParaParts.push(`${pronouns.subjectCap} est porteur de ${formatList(admissionDetails)}.`);
        }
    }
    
    const otherObservations: string[] = [];
    if (state.geriatrie.length > 0) {
        otherObservations.push(`observations gériatriques notables: ${formatList(state.geriatrie.map(g => g.toLowerCase()))}`);
    }
    if (state.finDeVie.length > 0) {
        let finDeVieDetails = state.finDeVie.filter(s => s !== 'Autre (à préciser)');
        if (state.finDeVie.includes('Autre (à préciser)') && state.finDeVie_other.trim()) {
            finDeVieDetails.push(state.finDeVie_other.trim());
        }
        otherObservations.push(`des signes de fin de vie ont été observés, notamment: ${formatList(finDeVieDetails.map(d => d.toLowerCase()))}`);
    }
    if (state.observations.length > 0) {
        otherObservations.push(...state.observations);
    }
    if (state.visites) {
        otherObservations.push(`${pronouns.he} a reçu la visite de ${state.visites.replace('Visite de ', '').toLowerCase()}`);
    }
    if (otherObservations.length > 0) {
       lastParaParts.push(otherObservations.join('. ') + '.');
    }

    if (state.particularites.trim()) {
        lastParaParts.push(`Événements notables: ${state.particularites.trim()}`);
    }

    if (lastParaParts.length > 0) {
        paragraphs.push(lastParaParts.join(' '));
    }
    
    let finalNote = paragraphs
        .map(p => p.trim().replace(/\s\s+/g, ' ').replace(/\s+\./g, '.').replace(/\s+,/g, ','))
        .filter(Boolean)
        .join('\n\n');

    if (state.addExtraSpace) {
        finalNote += '\n\n'; // Add an extra blank line if requested
    }

    return finalNote;
  }, [patients]);


  const processOfflineQueue = useCallback(async () => {
    const savedQueueJSON = localStorage.getItem('offlineQueue');
    if (!savedQueueJSON) return;

    let queue;
    try {
        queue = JSON.parse(savedQueueJSON);
        if (!Array.isArray(queue) || queue.length === 0) {
            localStorage.removeItem('offlineQueue');
            return;
        }
    } catch (e) {
        console.error("Failed to parse offline queue, clearing it.", e);
        localStorage.removeItem('offlineQueue');
        return;
    }

    setIsProcessingQueue(true);
    setProcessingMessage(`Mise à jour de ${queue.length} note(s) hors ligne avec l'IA...`);

    const successfullyProcessedIndices: number[] = [];

    for (const [index, request] of queue.entries()) {
        try {
            const { formState: requestFormState, selectedPatientId: requestPatientId, patientName, timestamp } = request;
            const clinicalData = buildClinicalData(requestFormState, requestPatientId);
            
            if (!clinicalData.trim()) {
                successfullyProcessedIndices.push(index); // Mark empty notes as "processed" to remove them
                continue;
            }

            const prompt = `RÔLE : Tu es un infirmier ou une infirmière rédigeant une note d'évolution pour le dossier d'un patient, conformément aux standards du système de santé québécois.
TÂCHE : Rédige une note narrative professionnelle, fluide et concise en français. La note doit intégrer toutes les données cliniques fournies dans un ou deux paragraphes cohérents.
IMPORTANT :
- Ne commence PAS la note par "Note d'évolution :".
- N'inclus PAS la date dans le corps de la note. L'heure peut être incluse si spécifiée dans les données.
- Accorde IMPÉRATIVEMENT le genre de la note (pronoms, adjectifs) en fonction du "Genre du patient" spécifié. 'Masculin' -> "le patient", "il". 'Féminin' -> "la patiente", "elle".

DONNÉES CLINIQUES :
${clinicalData}

Réponds IMPÉRATIVEMENT au format JSON en respectant le schéma fourni.`;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: { note: { type: Type.STRING, description: "La note d'évolution infirmière narrative et complète, correctement accordée en genre." } },
                        required: ['note']
                    }
                }
            });

            const jsonString = response.text.trim();
            const parsedResponse = JSON.parse(jsonString);
            const generatedNoteContent = parsedResponse.note || "La note n'a pas pu être générée.";
            
            setGeneratedNotesHistory(prev =>
              prev.map(record =>
                record.timestamp === timestamp // timestamp comes from the queue item
                  ? {
                      ...record,
                      noteContent: generatedNoteContent,
                      isOffline: false, // Flip the flag
                    }
                  : record
              ).sort((a, b) => a.timestamp - b.timestamp) // re-sort just in case
            );

            successfullyProcessedIndices.push(index);
            
        } catch (error) {
            console.error(`Erreur lors du traitement de la note hors ligne #${index + 1}:`, error);
        }
    }

    const remainingQueue = queue.filter((_: any, index: number) => !successfullyProcessedIndices.includes(index));

    if (remainingQueue.length === 0) {
        localStorage.removeItem('offlineQueue');
        setProcessingMessage('Toutes les notes hors ligne ont été mises à jour avec succès !');
    } else {
        localStorage.setItem('offlineQueue', JSON.stringify(remainingQueue));
        const failedCount = remainingQueue.length;
        const successCount = successfullyProcessedIndices.length;
        setProcessingMessage(`${successCount} note(s) mise(s) à jour. ${failedCount} note(s) n'ont pas pu être traitée(s) et seront réessayées plus tard.`);
    }

    setTimeout(() => {
        setIsProcessingQueue(false);
        setProcessingMessage(null);
    } , 5000);

  }, [buildClinicalData, patients]);


  // NEW: Process Clinical Assistant Offline Queue
  const processClinicalAssistantQueue = useCallback(async () => {
    const pendingRequests = clinicalAssistantQueue.filter(req => req.status === 'pending');
    if (pendingRequests.length === 0) return;

    setIsProcessingAssistantQueue(true);
    setAssistantQueueMessage(`Mise à jour de ${pendingRequests.length} question(s) d'assistant hors ligne avec l'IA...`);

    const updatedQueue = [...clinicalAssistantQueue];
    let successfulCount = 0;

    for (const req of pendingRequests) {
        try {
            // Re-construct the prompt, potentially including knowledge base articles
            let prompt = `RÔLE: Tu es un assistant clinique IA expert, conçu pour le personnel infirmier travaillant dans le système de santé du Québec.
TÂCHE: Réponds à la question clinique suivante de manière scientifique, concise et adaptée au contexte québécois.
NIVEAU DE COMPLEXITÉ: "${req.complexity}".
- Si 'Simple': Explique en termes clairs et accessibles, comme si tu t'adressais à un patient ou un étudiant débutant. Évite le jargon complexe.
- Si 'Détaillé': Fournis une réponse technique et précise pour un professionnel de la santé, en utilisant des termes cliniques appropriés et en mentionnant potentiellement des considérations spécifiques au Québec si pertinent.
`;
            if (req.includeArticleKnowledgeBase && knowledgeBaseArticles.length > 0) {
                const articleContext = knowledgeBaseArticles
                    .slice(-5) // Take up to the 5 most recent articles
                    .map(article => `### Article: ${article.title}\n${article.content}`)
                    .join('\n\n');
                prompt += `\nBASE DE CONNAISSANCES D'ARTICLES (utiliser comme référence si pertinent):\n${articleContext}\n`;
            }

            prompt += `\nQUESTION: "${req.question}"\n\nRÉPONSE:`;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            let generatedResponseContent = response.text;
            if (req.addExtraSpace) {
                generatedResponseContent += '\n\n';
            }

            const index = updatedQueue.findIndex(item => item.id === req.id);
            if (index !== -1) {
                updatedQueue[index] = {
                    ...updatedQueue[index],
                    response: generatedResponseContent,
                    status: 'completed',
                    error: null,
                };
            }
            successfulCount++;
        } catch (error) {
            console.error(`Erreur lors du traitement de la question d'assistant hors ligne #${req.id}:`, error);
            const index = updatedQueue.findIndex(item => item.id === req.id);
            if (index !== -1) {
                updatedQueue[index] = {
                    ...updatedQueue[index],
                    response: null,
                    status: 'completed', // Mark as completed even with error to avoid reprocessing indefinitely
                    error: "Une erreur est survenue lors du traitement hors ligne. Veuillez réessayer manuellement.",
                };
            }
        }
    }
    setClinicalAssistantQueue(updatedQueue);
    
    if (successfulCount === pendingRequests.length) {
        setAssistantQueueMessage('Toutes les questions d\'assistant hors ligne ont été mises à jour avec succès !');
    } else {
        const failedCount = pendingRequests.length - successfulCount;
        setAssistantQueueMessage(`${successfulCount} question(s) d'assistant mise(s) à jour. ${failedCount} question(s) n'ont pas pu être traitée(s).`);
    }

    setTimeout(() => {
        setIsProcessingAssistantQueue(false);
        setAssistantQueueMessage(null);
    }, 5000);

  }, [clinicalAssistantQueue, knowledgeBaseArticles]);


  // NEW: Ingest Article for Knowledge Base (no immediate AI processing)
  const handleIngestArticle = useCallback(async (content: string, fileName: string | null = null) => {
    if (!content.trim()) {
        setArticleIngestionMessage("Le contenu de l'article est vide. Rien à stocker.");
        setTimeout(() => setArticleIngestionMessage(null), 3000);
        return;
    }

    setIsIngestingArticle(true); // For visual feedback, e.g. PDF processing
    setArticleIngestionMessage(null);

    try {
        const articleId = `kb-article-${Date.now()}`;
        const generatedTitle = fileName || content.trim().split('\n')[0].substring(0, 100) + '...'; // First line as title

        const newArticle: KnowledgeBaseArticle = {
            id: articleId,
            title: generatedTitle,
            content: content.trim(),
            timestamp: Date.now(),
            status: 'stored',
        };

        setKnowledgeBaseArticles(prev => [...prev, newArticle]);
        setArticleIngestionMessage("Article ajouté à la base de connaissances !");
        setArticleContent(''); // Clear input after ingestion
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'article à la base de connaissances :", error);
        setArticleIngestionMessage("Une erreur est survenue lors de l'ajout de l'article.");
    } finally {
        setIsIngestingArticle(false);
        setTimeout(() => setArticleIngestionMessage(null), 3000);
    }
  }, []);

  // NEW: Handlers for Article Knowledge Base management
  const handleDeleteArticle = useCallback((id: string) => {
    setKnowledgeBaseArticles(prev => prev.filter(article => article.id !== id));
  }, []);

  const handleRecallArticle = useCallback((article: KnowledgeBaseArticle) => {
    setArticleContent(article.content);
    setArticleIngestionMessage(`Article "${article.title}" chargé pour édition.`);
    // No specific AI response to recall for this component's new role
  }, []);


  useEffect(() => {
    if (effectiveIsOnline) {
      processOfflineQueue();
      processClinicalAssistantQueue(); // NEW: Trigger processing for assistant queue
    }
  }, [effectiveIsOnline, processOfflineQueue, processClinicalAssistantQueue]);


  const handleGenerateNote = useCallback(async () => {
    if (isFormEmpty) return;
    setIsGenerating(true);
    setGenerationError(null);
    setAiNote('');

    const timestampToUpdate = noteToRegenerate ? noteToRegenerate.timestamp : null;

    if (effectiveIsOnline || !settings.isOfflineQueueEnabled) { // Generate if online OR offline queueing is disabled
        const clinicalData = buildClinicalData(formState, selectedPatientId);
        if (!clinicalData.trim()) {
          setGenerationError("Le formulaire est vide.");
          setIsGenerating(false);
          return;
        }

        const prompt = `RÔLE : Tu es un infirmier ou une infirmière rédigeant une note d'évolution pour le dossier d'un patient, conformément aux standards du système de santé québécois.
TÂCHE : Rédige une note narrative professionnelle, fluide et concise en français. La note doit intégrer toutes les données cliniques fournies dans un ou deux paragraphes cohérents.
IMPORTANT :
- Ne commence PAS la note par "Note d'évolution :".
- N'inclus PAS la date dans le corps de la note. L'heure peut être incluse si spécifiée dans les données.
- Accorde IMPÉRATIVEMENT le genre de la note (pronoms, adjectifs) en fonction du "Genre du patient" spécifié. 'Masculin' -> "le patient", "il". 'Féminin' -> "la patiente", "elle".

DONNÉES CLINIQUES :
${clinicalData}

Réponds IMPÉRATIVEMENT au format JSON en respectant le schéma fourni.`;

        try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { note: { type: Type.STRING, description: "La note d'évolution infirmière narrative et complète, correctement accordée en genre." } },
                    required: ['note']
                }
            }
          });
          
          const jsonString = response.text.trim();
          const parsedResponse = JSON.parse(jsonString);
          const generatedNoteContent = parsedResponse.note || "La note n'a pas pu être générée.";
          setAiNote(generatedNoteContent);
          
          const currentPatient = selectedPatientId ? patients.find(p => p.id === selectedPatientId) : null;
          
          if (timestampToUpdate) {
            // Update existing note
            setGeneratedNotesHistory(prev =>
              prev.map(note =>
                note.timestamp === timestampToUpdate
                  ? {
                      ...note,
                      noteContent: generatedNoteContent,
                      formState: formState, // Update formState as well
                      patientId: selectedPatientId, // Update patient if changed
                      patientName: currentPatient?.name || 'Patient Inconnu',
                    }
                  : note
              )
            );
            setNoteToRegenerate(null); // Exit regeneration mode
          } else {
             // Save to history for shift report
             setGeneratedNotesHistory(prev => [
                ...prev,
                {
                  patientId: selectedPatientId,
                  patientName: currentPatient?.name || 'Patient Inconnu',
                  noteContent: generatedNoteContent,
                  timestamp: Date.now(),
                  formState: formState, // Save form state with note
                }
             ]);
          }

        } catch (error) {
          console.error("Erreur lors de la génération de la note :", error);
          setGenerationError("Une erreur est survenue. L'IA a peut-être renvoyé une réponse inattendue. Veuillez réessayer.");
        } finally {
          setIsGenerating(false);
        }
    } else {
        // --- OFFLINE LOGIC ---
        try {
            const narrativeNoteContent = generateNarrativeOfflineNote(formState, selectedPatientId);
            setAiNote(narrativeNoteContent);

            const currentPatient = selectedPatientId ? patients.find(p => p.id === selectedPatientId) : null;
            const timestamp = Date.now();

            // Add to history immediately with an 'isOffline' flag
            setGeneratedNotesHistory(prev => [
                ...prev,
                {
                  patientId: selectedPatientId,
                  patientName: currentPatient?.name || 'Patient Inconnu',
                  noteContent: narrativeNoteContent,
                  timestamp: timestamp,
                  formState: formState,
                  isOffline: true, // New flag
                }
            ]);

            const savedQueueJSON = localStorage.getItem('offlineQueue');
            const queue = savedQueueJSON ? JSON.parse(savedQueueJSON) : [];
            
            const offlineRequest = {
                formState,
                selectedPatientId,
                patientName: currentPatient?.name || 'Patient Inconnu',
                timestamp: timestamp
            };

            queue.push(offlineRequest);
            localStorage.setItem('offlineQueue', JSON.stringify(queue));

            // Reset form for next entry but keep patient and context.
            const { quart, gender } = formState;
            setFormState({
                ...initialFormState,
                quart,
                gender,
            });

        } catch (error) {
            console.error("Erreur lors de la sauvegarde hors ligne :", error);
            setGenerationError("Une erreur est survenue lors de la sauvegarde de la note pour une utilisation hors ligne.");
        } finally {
            setIsGenerating(false);
        }
    }
  }, [formState, isFormEmpty, selectedPatientId, patients, effectiveIsOnline, initialFormState, buildClinicalData, noteToRegenerate, settings.isOfflineQueueEnabled, generateNarrativeOfflineNote]);
  
  const handleGenerateAssistantResponse = useCallback(async () => {
    if (!clinicalQuestion.trim()) return;
    setIsGeneratingAssistant(true);
    setAssistantError(null);
    setAssistantResponse('');

    const currentQuestion = clinicalQuestion.trim();
    const currentComplexity = complexityLevel;
    const requestTimestamp = Date.now();
    const assistantId = `assistant-req-${requestTimestamp}`;
    
    // Construct base prompt
    let prompt = `RÔLE: Tu es un assistant clinique IA expert, conçu pour le personnel infirmier travaillant dans le système de santé du Québec.
TÂCHE: Réponds à la question clinique suivante de manière scientifique, concise et adaptée au contexte québécois.
NIVEAU DE COMPLEXITÉ: "${currentComplexity}".
- Si 'Simple': Explique en termes clairs et accessibles, comme si tu t'adressais à un patient ou un étudiant débutant. Évite le jargon complexe.
- Si 'Détaillé': Fournis une réponse technique et précise pour un professionnel de la santé, en utilisant des termes cliniques appropriés et en mentionnant potentiellement des considérations spécifiques au Québec si pertinent.
`;
    // NEW: Conditionally include article knowledge base
    if (includeArticleKnowledgeBase && knowledgeBaseArticles.length > 0) {
        // Take up to the 5 most recent articles
        const articleContext = knowledgeBaseArticles
            .slice(-5)
            .map(article => `### Article: ${article.title}\n${article.content}`)
            .join('\n\n');
        prompt += `\nBASE DE CONNAISSANCES D'ARTICLES (utiliser comme référence si pertinent):\n${articleContext}\n`;
    }

    prompt += `\nQUESTION: "${currentQuestion}"\n\nRÉPONSE:`;

    // NEW: If offline, queue the request
    if (!effectiveIsOnline) {
      const newRequest: ClinicalAssistantRequest = {
        id: assistantId,
        question: currentQuestion,
        complexity: currentComplexity,
        timestamp: requestTimestamp,
        response: null,
        error: null,
        status: 'pending',
        addExtraSpace: settings.addExtraSpaceAssistant, // Use global setting for queued request
        includeArticleKnowledgeBase: includeArticleKnowledgeBase, // NEW: Store KB preference for offline processing
      };
      setClinicalAssistantQueue(prev => [...prev, newRequest]);
      setAssistantResponse("Question mise en file d'attente pour traitement hors ligne...");
      setClinicalQuestion(''); // Clear question after queuing
      setIsGeneratingAssistant(false);
      setAssistantError(null); // Clear any previous error
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      let generatedResponseContent = response.text;
      if (settings.addExtraSpaceAssistant) { // Apply extra space if enabled
        generatedResponseContent += '\n\n';
      }
      setAssistantResponse(generatedResponseContent);

      // Add to history
      const completedRequest: ClinicalAssistantRequest = {
        id: assistantId,
        question: currentQuestion,
        complexity: currentComplexity,
        timestamp: requestTimestamp,
        response: generatedResponseContent,
        error: null,
        status: 'completed',
        addExtraSpace: settings.addExtraSpaceAssistant,
        includeArticleKnowledgeBase: includeArticleKnowledgeBase, // NEW: Store KB preference for history
      };
      setClinicalAssistantQueue(prev => [...prev, completedRequest]);

    } catch (error) {
      console.error("Erreur lors de la génération de la réponse de l'assistant :", error);
      setAssistantError("Une erreur est survenue. L'IA n'a pas pu générer de réponse. Veuillez réessayer.");
      // Add errored request to history
      const erroredRequest: ClinicalAssistantRequest = {
        id: assistantId,
        question: currentQuestion,
        complexity: currentComplexity,
        timestamp: requestTimestamp,
        response: null,
        error: "Échec de la génération de la réponse.",
        status: 'completed', // Mark as completed (with error)
        addExtraSpace: settings.addExtraSpaceAssistant,
        includeArticleKnowledgeBase: includeArticleKnowledgeBase, // NEW: Store KB preference for history
      };
      setClinicalAssistantQueue(prev => [...prev, erroredRequest]);
    } finally {
      setIsGeneratingAssistant(false);
      setClinicalQuestion(''); // Clear question input
    }
  }, [clinicalQuestion, complexityLevel, effectiveIsOnline, settings.addExtraSpaceAssistant, clinicalAssistantQueue, includeArticleKnowledgeBase, knowledgeBaseArticles]);

  // NEW: Handlers for Clinical Assistant queue management
  const handleDeleteAssistantRequest = useCallback((id: string) => {
    setClinicalAssistantQueue(prev => prev.filter(req => req.id !== id));
  }, []);

  const handleRecallAssistantRequest = useCallback((request: ClinicalAssistantRequest) => {
    setClinicalQuestion(request.question);
    setComplexityLevel(request.complexity);
    setAssistantResponse(request.response || '');
    setAssistantError(request.error);
    setSettings(prev => ({...prev, addExtraSpaceAssistant: request.addExtraSpace}));
    setIncludeArticleKnowledgeBase(request.includeArticleKnowledgeBase || false); // NEW: Recall KB preference
    // Optionally remove from queue history if it was pending or a user wants to restart it.
    // For simplicity, we just set the form, not remove from history here.
  }, []);

  // NEW: Toggle handler for including article knowledge base in Clinical Assistant
  const handleToggleIncludeArticleKnowledgeBase = useCallback(() => {
      setIncludeArticleKnowledgeBase(prev => !prev);
  }, []);


  const handleGenerateShiftReport = useCallback(async () => {
    if (generatedNotesHistory.length === 0) {
      setShiftReportError("Aucune note n'a été générée pour créer un rapport de garde.");
      return;
    }

    setIsGeneratingShiftReport(true);
    setShiftReportError(null);
    setShiftReportOutput('');

    // Group notes by patient
    const notesByPatient: { [patientId: string]: GeneratedNoteRecord[] } = {};
    generatedNotesHistory.forEach(note => {
      if (!notesByPatient[note.patientId || 'unknown']) {
        notesByPatient[note.patientId || 'unknown'] = [];
      }
      notesByPatient[note.patientId || 'unknown'].push(note);
    });

    let clinicalDataForShiftReport = '';
    for (const patientId in notesByPatient) {
      const patientNotes = notesByPatient[patientId];
      const patient = patients.find(p => p.id === patientId);
      const patientName = patient?.name || patientNotes[0].patientName || 'Patient Inconnu';
      const room = patient?.room ? ` (Ch. ${patient.room})` : '';

      clinicalDataForShiftReport += `--- Patient: ${patientName}${room} ---\n`;
      patientNotes.forEach((note) => { // Corrected forEach arguments. The first argument is the item, the second is the index.
        const time = new Date(note.timestamp).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
        clinicalDataForShiftReport += `Note (${time}): ${note.noteContent}\n`;
      });
      clinicalDataForShiftReport += `\n`; // Separator between patient notes
    }

    const prompt = `RÔLE : Tu es un infirmier ou une infirmière expérimenté(e) rédigeant un rapport de garde concis et structuré pour l'équipe soignante suivante, basé sur les notes d'évolution fournies.
TÂCHE : Pour chaque patient, synthétise les informations des notes d'évolution en un paragraphe clair et professionnel. Mets en évidence les événements marquants, les changements d'état, les interventions effectuées et les éléments importants à surveiller pour le prochain quart. Utilise le format Markdown pour la mise en forme.
IMPORTANT :
- Chaque résumé de patient doit être précédé d'un titre de niveau 2 (## Nom du patient).
- N'inclus PAS la date, seulement l'heure si nécessaire.
- Garde les résumés concis, comme une transmission orale de fin de quart.

NOTES D'ÉVOLUTION DU QUART :
${clinicalDataForShiftReport}

RÉPONSE (en format Markdown) :`;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Using pro for more complex summarization
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 2000 } // Give it a bit more thinking power for complex summaries
            }
        });
        setShiftReportOutput(response.text);
    } catch (error) {
        console.error("Erreur lors de la génération du rapport de garde :", error);
        setShiftReportError("Une erreur est survenue lors de la génération du rapport de garde. Veuillez réessayer.");
    } finally {
        setIsGeneratingShiftReport(false);
    }
  }, [generatedNotesHistory, patients]);

  const handleClearShiftReport = useCallback(() => {
    setGeneratedNotesHistory([]);
    setShiftReportOutput('');
    setShiftReportError(null);
  }, []);

  
  const quartOptions: Option[] = [
    { value: 'Jour', label: 'Jour' },
    { value: 'Soir', label: 'Soir' },
    { value: 'Nuit', label: 'Nuit' },
  ];

  const genderOptions: Option[] = [
    { value: 'Masculin', label: 'Masculin' },
    { value: 'Féminin', label: 'Féminin' },
  ];

  // Explicitly define painSectionMeta as it's a special section not found in sectionsData by design
  const painSectionMeta = { id: 'douleur' as const, title: 'Douleur – Méthode PQRSTU' };
  
  // Filter sectionsData based on IDs that are actually present in sectionsData,
  // and handle custom sections like 'douleur' and 'particularites' separately.
  const sectionsBeforeDouleur = sectionsData.filter(sec => 
    !['finDeVie', 'observations', 'visites'].includes(sec.id)
  );

  const sectionsAfterDouleur = sectionsData.filter(sec => 
    ['finDeVie', 'observations', 'visites'].includes(sec.id)
  );
  
  const selectedPatient = useMemo(() => patients.find(p => p.id === selectedPatientId) || null, [patients, selectedPatientId]);

  if (!accessGranted) {
    return <AccessCodeScreen onAccessGranted={handleAccessGranted} error={authError} isSetupMode={isSetupMode} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col">
      <Header 
        theme={theme}
        onToggleTheme={toggleTheme}
        isOnline={effectiveIsOnline}
        forceOffline={forceOffline}
        onToggleForceOffline={handleToggleForceOffline}
      />
      <main className="flex-grow container mx-auto p-4 lg:p-8">
        {/* Top Section: Patient Manager and Shift Report */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <PatientManager 
                patients={patients}
                selectedPatientId={selectedPatientId}
                onSelectPatient={setSelectedPatientId}
                onManagePatients={() => setIsPatientModalOpen(true)}
                selectedPatient={selectedPatient}
            />
            <ShiftReportGenerator 
                generatedNotesHistory={generatedNotesHistory}
                onGenerate={handleGenerateShiftReport}
                output={shiftReportOutput}
                isLoading={isGeneratingShiftReport}
                error={shiftReportError}
                onClear={handleClearShiftReport}
                hasNotesToReport={generatedNotesHistory.length > 0}
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form Inputs */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <QuickScenarios onScenarioSelect={handleScenarioSelect} />

            <CollapsibleSection
                title="Contexte de la Note"
                isOpen={openSectionId === 'contexte'}
                onToggle={() => handleSectionToggle('contexte')}
                isFilled={isSectionFilled('contexte', formState)}
            >
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Genre du patient</label>
                        <RadioGroup name="gender" options={genderOptions} selectedValue={formState.gender} onChange={(value) => handleRadioChange('gender', value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Quart de travail</label>
                        <RadioGroup name="quart" options={quartOptions} selectedValue={formState.quart} onChange={(value) => handleRadioChange('quart', value)} />
                    </div>
                    <div>
                        <label htmlFor="heure-note" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Heure de l'observation (facultatif)</label>
                        <input
                            type="time"
                            id="heure-note"
                            value={formState.heure}
                            onChange={(e) => handleHeureChange(e.target.value)}
                            className="w-full max-w-xs p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                        />
                    </div>
                </div>
            </CollapsibleSection>

            <AdmissionSection
                isOpen={openSectionId === 'admission'}
                onToggle={() => handleSectionToggle('admission')}
                isFilled={isSectionFilled('admission', formState)}
                state={formState}
                onChange={handleAdmissionChange}
            />


            {sectionsBeforeDouleur.map(section => (
              <CollapsibleSection 
                key={section.id} 
                title={section.title}
                isOpen={openSectionId === section.id}
                onToggle={() => handleSectionToggle(section.id)}
                isFilled={isSectionFilled(section.id, formState)}
              >
                {section.type === 'radio' && <RadioGroup name={section.id} options={section.options} selectedValue={formState[section.id as keyof FormState] as string} onChange={(value) => handleRadioChange(section.id as keyof FormState, value)} />}
                {section.type === 'checkbox' && <CheckboxGroup sectionId={section.id} options={section.options} selectedValues={formState[section.id as keyof FormState] as string[]} onChange={(value) => handleCheckboxChange(section.id as keyof FormState, value)} />}
                {section.id === 'respiratoire' && formState.respiratoire.includes('Utilisation d’O₂') && (
                    <div className="mt-4">
                        <label htmlFor="respiratoire_o2_litres" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Débit d'oxygène (L/min)</label>
                        <input type="number" id="respiratoire_o2_litres" value={formState.respiratoire_o2_litres} onChange={(e) => handleRespiratoireO2LitresChange(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors" placeholder="Ex: 2" min="0" step="0.5" />
                    </div>
                )}
                {section.hasIntervention && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                        <div>
                            <label htmlFor={`${section.id}-medicament`} className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Médicament administré</label>
                            <input type="text" id={`${section.id}-medicament`} value={formState[`${section.id}_medicament` as keyof FormState] as string} onChange={(e) => handleMedicamentChange(section.id as string, e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors" placeholder="Ex: Nom, dosage, voie..." />
                        </div>
                        {section.interventions && (
                           <div>
                                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Interventions Associées</h3>
                                <CheckboxGroup sectionId={`${section.id}_interventions`} options={section.interventions} selectedValues={formState[`${section.id}_interventions` as keyof FormState] as string[]} onChange={(value) => handleInterventionChange(section.id, value)} />
                           </div>
                        )}
                    </div>
                )}
              </CollapsibleSection>
            ))}

            {/* Use painSectionMeta instead of painSectionData */}
            {painSectionMeta && (
                <CollapsibleSection
                title={painSectionMeta.title}
                isOpen={openSectionId === painSectionMeta.id}
                onToggle={() => handleSectionToggle(painSectionMeta.id)}
                isFilled={isSectionFilled(painSectionMeta.id, formState)}
                >
                <PainSection
                    data={painFieldsData}
                    painState={formState.douleur}
                    onCheckboxChange={handlePainCheckboxChange}
                    onRadioChange={handlePainRadioChange}
                    onSiteChange={handlePainSiteChange}
                    onMedicamentChange={handlePainMedicamentChange}
                    onNonPharmaChange={handlePainNonPharmaChange}
                />
                </CollapsibleSection>
            )}

            {sectionsAfterDouleur.map(section => (
              <CollapsibleSection 
                key={section.id} 
                title={section.title}
                isOpen={openSectionId === section.id}
                onToggle={() => handleSectionToggle(section.id)}
                isFilled={isSectionFilled(section.id, formState)}
              >
                {section.type === 'radio' && <RadioGroup name={section.id} options={section.options} selectedValue={formState[section.id as keyof FormState] as string} onChange={(value) => handleRadioChange(section.id as keyof FormState, value)} />}
                {section.type === 'checkbox' && <CheckboxGroup sectionId={section.id} options={section.options} selectedValues={formState[section.id as keyof FormState] as string[]} onChange={(value) => handleCheckboxChange(section.id as keyof FormState, value)} />}
                {section.hasOtherField && section.id === 'finDeVie' && formState.finDeVie.includes('Autre (à préciser)') && (
                    <div className="mt-4">
                        <label htmlFor="finDeVie_other" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Préciser autre symptôme de fin de vie</label>
                        <input
                            type="text"
                            id="finDeVie_other"
                            value={formState.finDeVie_other}
                            onChange={(e) => handleFinDeVieOtherChange(e.target.value)}
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                            placeholder="Ex: Diminution des réflexes, incontinence..."
                        />
                    </div>
                )}
                 {section.hasIntervention && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                        <div>
                            <label htmlFor={`${section.id}-medicament`} className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Médicament administré</label>
                            <input type="text" id={`${section.id}-medicament`} value={formState[`${section.id}_medicament` as keyof FormState] as string} onChange={(e) => handleMedicamentChange(section.id as string, e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors" placeholder="Ex: Nom, dosage, voie..." />
                        </div>
                        {section.interventions && (
                           <div>
                                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Interventions Associées</h3>
                                <CheckboxGroup sectionId={`${section.id}_interventions`} options={section.interventions} selectedValues={formState[`${section.id}_interventions` as keyof FormState] as string[]} onChange={(value) => handleInterventionChange(section.id, value)} />
                           </div>
                        )}
                    </div>
                )}
              </CollapsibleSection>
            ))}

             <CollapsibleSection
                title="Particularités / Événements notables"
                isOpen={openSectionId === 'particularites'}
                onToggle={() => handleSectionToggle('particularites')}
                isFilled={isSectionFilled('particularites', formState)}
             >
                <ParticularitesSection 
                    value={formState.particularites}
                    onChange={handleParticularitesChange}
                    addExtraSpace={formState.addExtraSpace}
                    onToggleExtraSpace={handleToggleExtraSpace}
                />
             </CollapsibleSection>
          </div>

          {/* Right Column: Tools */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8 flex flex-col gap-8">
                <CollapsibleSection
                    title="Assistant Clinique IA"
                    isOpen={openRightSectionId === 'assistant'}
                    onToggle={() => handleRightSectionToggle('assistant')}
                    isFilled={assistantResponse.trim() !== '' || clinicalQuestion.trim() !== '' || clinicalAssistantQueue.length > 0}
                >
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Obtenez des réponses rapides à vos questions cliniques, adaptées au contexte québécois.</p>
                    <ClinicalAssistant
                        question={clinicalQuestion}
                        onQuestionChange={setClinicalQuestion}
                        complexity={complexityLevel}
                        onComplexityChange={setComplexityLevel}
                        response={assistantResponse}
                        isLoading={isGeneratingAssistant}
                        error={assistantError}
                        onGenerate={handleGenerateAssistantResponse}
                        complexityOptions={complexityOptions}
                        // NEW PROPS
                        isOnline={effectiveIsOnline}
                        isProcessingQueue={isProcessingAssistantQueue}
                        processingMessage={assistantQueueMessage}
                        addExtraSpaceSetting={settings.addExtraSpaceAssistant}
                        onToggleExtraSpaceSetting={handleToggleExtraSpaceAssistant}
                        queue={clinicalAssistantQueue}
                        onDeleteQueuedRequest={handleDeleteAssistantRequest}
                        onRecallQueuedRequest={handleRecallAssistantRequest}
                        // NEW: Article Knowledge Base props
                        includeArticleKnowledgeBase={includeArticleKnowledgeBase}
                        onToggleIncludeArticleKnowledgeBase={handleToggleIncludeArticleKnowledgeBase}
                        knowledgeBaseArticles={knowledgeBaseArticles}
                    />
                </CollapsibleSection>

                {/* NEW: Article Knowledge Base Section */}
                <CollapsibleSection
                    title="Base de Connaissances d'Articles"
                    isOpen={openRightSectionId === 'articleAssistant'}
                    onToggle={() => handleRightSectionToggle('articleAssistant')}
                    isFilled={articleContent.trim() !== '' || knowledgeBaseArticles.length > 0}
                >
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Téléversez des articles ou collez du texte pour créer votre base de connaissances locale. L'Assistant Clinique IA pourra utiliser ces informations pour enrichir ses réponses.
                    </p>
                    <ArticleAssistant
                        articleContent={articleContent}
                        onArticleContentChange={setArticleContent}
                        isPdfLoading={isIngestingArticle} // Renamed prop for clarity
                        ingestionMessage={articleIngestionMessage} // Renamed prop for clarity
                        onIngest={handleIngestArticle}
                        articles={knowledgeBaseArticles}
                        onDeleteArticle={handleDeleteArticle}
                        onRecallArticle={handleRecallArticle}
                    />
                </CollapsibleSection>

                <SaveLoad 
                  savedStates={savedStates}
                  onSave={handleSaveState}
                  onLoad={handleLoadState}
                  onDelete={handleDeleteState}
                />
            </div>
          </div>

           {/* Full-width Note Section at the bottom */}
          <div className="lg:col-span-3 mt-8">
            <GeneratedNote 
                value={aiNote}
                onValueChange={setAiNote}
                isGenerating={isGenerating}
                error={generationError}
                isFormEmpty={isFormEmpty}
                onGenerate={handleGenerateNote}
                onReset={resetForm}
                settings={settings}
                setSettings={setSettings}
                patients={patients}
                generatedNotesHistory={generatedNotesHistory}
                onUpdateNoteInHistory={handleUpdateNoteInHistory}
                onDeleteNoteFromHistory={handleDeleteNoteFromHistory}
                onRecallNote={handleRecallNote}
                theme={theme}
                isOnline={effectiveIsOnline}
                isProcessingQueue={isProcessingQueue} // This is for main note queue
                processingMessage={processingMessage} // This is for main note queue
                noteToRegenerate={noteToRegenerate}
            />
          </div>
        </div>
      </main>
      <Footer />
       {isPatientModalOpen && (
            <PatientModal
                isOpen={isPatientModalOpen}
                onClose={() => setIsPatientModalOpen(false)}
                patients={patients}
                onSave={handleSavePatient}
                onDelete={handleDeletePatient}
            />
       )}
    </div>
  );
};

export default App;
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import jsPDF from 'jspdf';
import type { LayoutSettings, GeneratedNoteRecord, Patient, FormState } from '../types';
import { defaultLayoutSettings, fontOptions } from '../constants';
import CollapsibleSection from './CollapsibleSection';
import ZplGenerator from './ZplGenerator'; // New import for the dedicated ZPL generator
import ShiftJournal from './ShiftJournal'; // Import the new ShiftJournal component

const CopyIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const DocumentDownloadIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" />
    </svg>
);

const PrintIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm-8-14h12a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2z" />
    </svg>
);

const ResetIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.691L7.5 7.5l-2.682 2.682A8.25 8.25 0 009.75 21.75l3.182-3.182m0-4.242l-3.182-3.182" />
    </svg>
);

const SparkleIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 01-1.47-1.47L12.964 18l1.188-.648a2.25 2.25 0 011.47-1.47L16.25 15l.648 1.188a2.25 2.25 0 011.47 1.47L19.536 18l-1.188.648a2.25 2.25 0 01-1.47 1.47z" />
  </svg>
);

const PhotoIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 017.5 0z" />
    </svg>
);

const AdjustmentsHorizontalIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
    </svg>
);

// FIX: Added PencilIcon definition
const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14.25v4.5a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18.75v-11.25A2.25 2.25 0 015.25 5.25h4.5" />
    </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const PowerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 2v10" />
    </svg>
);


interface GeneratedNoteProps {
  value: string;
  onValueChange: (newText: string) => void;
  isGenerating: boolean;
  error: string | null;
  isFormEmpty: boolean;
  onGenerate: () => void;
  onReset: () => void;
  settings: LayoutSettings;
  setSettings: React.Dispatch<React.SetStateAction<LayoutSettings>>;
  patients: Patient[];
  generatedNotesHistory: GeneratedNoteRecord[];
  onUpdateNoteInHistory: (patientId: string | null, timestamp: number, newContent: string) => void;
  onDeleteNoteFromHistory: (timestamp: number) => void;
  onRecallNote: (record: GeneratedNoteRecord) => void;
  theme: 'light' | 'dark';
  isOnline: boolean;
  isProcessingQueue: boolean;
  processingMessage: string | null;
  noteToRegenerate: GeneratedNoteRecord | null;
}

const GeneratedNote: React.FC<GeneratedNoteProps> = ({ 
    value,
    onValueChange,
    isGenerating, 
    error, 
    isFormEmpty, 
    onGenerate, 
    onReset, 
    settings,
    setSettings,
    patients, 
    generatedNotesHistory, 
    onUpdateNoteInHistory,
    onDeleteNoteFromHistory,
    onRecallNote,
    theme,
    isOnline,
    isProcessingQueue,
    processingMessage,
    noteToRegenerate,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ startX: number, startY: number, initialLeft: number, initialTop: number } | null>(null);
  
  // Page dimensions in cm for calculations
  const PAGE_WIDTH_CM = 21.59;
  const PAGE_HEIGHT_CM = 27.94;
  const PT_TO_CM = 0.0352778;

  const [backgroundImage, setBackgroundImage] = useState<string>(() => localStorage.getItem('customFormBackgroundImage') || '');

  // Editing state for notes (both single AI and full shift)
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editableNoteContent, setEditableNoteContent] = useState(value);

  // Display mode for the preview area: 'singleNote' or 'shiftJournal'
  const [displayMode, setDisplayMode] = useState<'singleNote' | 'shiftJournal'>('singleNote');

  // A combined state to disable UI elements consistently
  const isUiDisabled = isGenerating || isProcessingQueue;

  const fullShiftNotesContent = useMemo(() => {
    if (generatedNotesHistory.length === 0) {
        return "Aucune note n'a été générée pour ce quart de travail.";
    }

    const finalContentParts: string[] = [];
    const sortedHistory = [...generatedNotesHistory].sort((a, b) => a.timestamp - b.timestamp);
    const notesByPatient: { [key: string]: GeneratedNoteRecord[] } = {};

    sortedHistory.forEach(note => {
        const patientKey = note.patientId || 'unknown';
        if (!notesByPatient[patientKey]) {
            notesByPatient[patientKey] = [];
        }
        notesByPatient[patientKey].push(note);
    });

    // Iterate over patient groups to build the final text
    Object.keys(notesByPatient).forEach(patientKey => {
        const notes = notesByPatient[patientKey];
        
        // Add a header only if the patient is known
        if (patientKey !== 'unknown') {
            const patient = patients.find(p => p.id === patientKey);
            const patientName = patient?.name || notes[0]?.patientName || 'Patient'; // Fallback
            const room = patient?.room ? ` (Ch. ${patient.room})` : '';
            finalContentParts.push(`--- Patient: ${patientName}${room} ---`);
        }
        
        // Add the notes for the current group
        notes.forEach(note => {
            const time = new Date(note.timestamp).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
            finalContentParts.push(`${time}: ${note.noteContent}`);
        });

        // Add a blank line for separation between patient groups
        finalContentParts.push(""); 
    });

    return finalContentParts.join('\n').trim();
  }, [generatedNotesHistory, patients]);


  // Sync editable content with prop.value when not editing
  useEffect(() => {
    if (!isEditingNote && displayMode === 'singleNote') {
      setEditableNoteContent(value);
    }
  }, [value, isEditingNote, displayMode]);


  const currentContentForPreview = useMemo(() => {
    if (displayMode === 'shiftJournal') {
        return fullShiftNotesContent;
    }
    return isEditingNote ? editableNoteContent : value;
  }, [isEditingNote, editableNoteContent, displayMode, value, fullShiftNotesContent]);


  const noteLines = useMemo(() => {
      if (!currentContentForPreview) return [];

      const doc = new jsPDF({
          orientation: 'p',
          unit: 'cm',
          format: [PAGE_WIDTH_CM, PAGE_HEIGHT_CM]
      });
      
      const fontStyle = settings.fontWeight >= 600 ? 'bold' : 'normal';
      doc.setFont(settings.fontFamily, fontStyle);
      doc.setFontSize(settings.fontSize);

      return doc.splitTextToSize(currentContentForPreview, settings.textBlockWidth);
  }, [currentContentForPreview, settings.fontSize, settings.textBlockWidth, settings.fontFamily, settings.fontWeight]);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);


  const handleCopy = () => {
    let contentToCopy = currentContentForPreview;

    if (contentToCopy) {
      navigator.clipboard.writeText(contentToCopy);
      setIsCopied(true);
    }
  };


  const generatePdf = useCallback((format: 'letter' | 'a4') => {
    const isA4 = format === 'a4';
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'cm',
      format: isA4 ? 'a4' : [PAGE_WIDTH_CM, PAGE_HEIGHT_CM]
    });

    const pageWidth = isA4 ? 21.0 : PAGE_WIDTH_CM;
    const pageHeight = isA4 ? 29.7 : PAGE_HEIGHT_CM;

    if (backgroundImage) {
        doc.addImage(backgroundImage, 'PNG', 0, 0, pageWidth, pageHeight);
    }

    const fontStyle = settings.fontWeight >= 600 ? 'bold' : 'normal';
    doc.setFont(settings.fontFamily, fontStyle);
    doc.setFontSize(settings.fontSize);

    const contentToPrint = currentContentForPreview === "Aucune note n'a été générée pour ce quart de travail." ? '' : currentContentForPreview;
    
    const leftPos = settings.textLeftPosition;
    const topPos = settings.textTopPosition;
    const blockWidth = settings.textBlockWidth;
    const lineHeight = settings.lineHeight;
    const letterSpacing = settings.letterSpacing * PT_TO_CM;

    const splitText = doc.splitTextToSize(contentToPrint, blockWidth);
    
    doc.text(splitText, leftPos, topPos, { 
        lineHeightFactor: lineHeight, 
        baseline: 'top',
        charSpace: letterSpacing,
    });
    doc.save(`${displayMode === 'singleNote' ? 'note-infirmiere' : 'journal-de-quart'}_${isA4 ? 'A4' : 'Lettre'}.pdf`);

  }, [backgroundImage, settings, currentContentForPreview, PAGE_WIDTH_CM, PAGE_HEIGHT_CM, PT_TO_CM, displayMode]);
  
  const handlePrint = useCallback(() => {
    const contentToPrint = currentContentForPreview === "Aucune note n'a été générée pour ce quart de travail." ? '' : currentContentForPreview;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        const leftPos = settings.textLeftPosition;
        const topPos = settings.textTopPosition;
        const blockWidth = settings.textBlockWidth;
        const lineHeight = settings.lineHeight;
        const letterSpacing = settings.letterSpacing;

        printWindow.document.write(`
            <html>
                <head>
                    <title>${displayMode === 'singleNote' ? 'Note Infirmière' : 'Journal de Quart'}</title>
                    <style>
                        body { margin: 0; padding: 0; }
                        .print-container {
                            position: relative;
                            width: ${PAGE_WIDTH_CM}cm;
                            height: ${PAGE_HEIGHT_CM}cm;
                            overflow: hidden;
                        }
                        ${backgroundImage ? `.print-container::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background-image: url(${backgroundImage});
                            background-size: contain;
                            background-repeat: no-repeat;
                            z-index: -1;
                        }` : ''}
                        .note-text {
                            position: absolute;
                            font-family: '${settings.fontFamily}', monospace;
                            font-weight: ${settings.fontWeight};
                            top: ${topPos}cm;
                            left: ${leftPos}cm;
                            width: ${blockWidth}cm;
                            font-size: ${settings.fontSize}pt;
                            line-height: ${lineHeight};
                            letter-spacing: ${letterSpacing}pt;
                            white-space: pre-wrap;
                            color: #1f2937; 
                        }
                    </style>
                </head>
                <body>
                    <div class="print-container">
                        <div class="note-text">${contentToPrint.replace(/\n/g, '<br>')}</div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    } else {
        alert("Impossible d'ouvrir la fenêtre d'impression. Veuillez autoriser les pop-ups.");
    }
  }, [backgroundImage, settings, currentContentForPreview, PAGE_WIDTH_CM, PAGE_HEIGHT_CM, displayMode]);
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setBackgroundImage(result);
            localStorage.setItem('customFormBackgroundImage', result);
        };
        reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const resetBackgroundImage = () => {
    setBackgroundImage('');
    localStorage.removeItem('customFormBackgroundImage');
  };

  const handleResetSettings = () => {
    setSettings(defaultLayoutSettings);
  };
  
  const handleSettingChange = (field: keyof LayoutSettings, value: number | string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };
  
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentContentForPreview || isUiDisabled || isEditingNote) return;
    e.preventDefault();
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: settings.textLeftPosition,
      initialTop: settings.textTopPosition,
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [settings, currentContentForPreview, isUiDisabled, isEditingNote]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragStartRef.current || !previewRef.current) return;

    const { startX, startY, initialLeft, initialTop } = dragStartRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const { width: previewWidth, height: previewHeight } = previewRef.current.getBoundingClientRect();

    const dLeftCm = (dx / previewWidth) * PAGE_WIDTH_CM;
    const dTopCm = (dy / previewHeight) * PAGE_HEIGHT_CM;

    const newLeft = Math.max(0.5, Math.min(20, initialLeft + dLeftCm));
    const newTop = Math.max(0.5, Math.min(27, initialTop + dTopCm));
    
    setSettings(prev => ({
        ...prev,
        textLeftPosition: newLeft,
        textTopPosition: newTop,
    }));
  }, [setSettings]);

  const handleMouseUp = useCallback(() => {
    dragStartRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleEditNote = () => {
      setIsEditingNote(true);
      setEditableNoteContent(value);
  };

  const handleSaveNoteEdit = () => {
      onValueChange(editableNoteContent);
      setIsEditingNote(false);
  };

  const handleCancelNoteEdit = () => {
      setEditableNoteContent(value);
      setIsEditingNote(false);
  };
  
  const browserFontStack = useMemo(() => {
    switch(settings.fontFamily) {
        case 'courier': return "'Courier New', Courier, monospace";
        case 'helvetica': return "Helvetica, Arial, sans-serif";
        case 'times': return "'Times New Roman', Times, serif";
        default: return "'Courier New', Courier, monospace";
    }
  }, [settings.fontFamily]);


  const isDraggable = !isUiDisabled && !isEditingNote && currentContentForPreview.trim() !== '' && !isGenerating;

  const isSaveDisabled = editableNoteContent === value;

  const adjustmentsPanel = (
    <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
        <p className="text-xs text-slate-500 dark:text-slate-400 bg-teal-50 dark:bg-teal-900/30 p-2 rounded-md border border-teal-200 dark:border-teal-800">
            <b>Astuce :</b> Vous pouvez aussi cliquer et glisser le texte dans l'aperçu pour le positionner.
        </p>
        <div className="grid grid-cols-1 gap-y-4 text-sm">
            
            <div>
                <label htmlFor="textTopPosition" className="block mb-1 text-slate-600 dark:text-slate-400">Position Verticale (cm): <span className="font-mono text-xs">{settings.textTopPosition.toFixed(2)}</span></label>
                <input type="range" id="textTopPosition" min="0.5" max="27" step="0.05" value={settings.textTopPosition} onChange={e => handleSettingChange('textTopPosition', parseFloat(e.target.value))} className="w-full" disabled={isUiDisabled} />
            </div>
            <div>
                <label htmlFor="textLeftPosition" className="block mb-1 text-slate-600 dark:text-slate-400">Position Horizontale (cm): <span className="font-mono text-xs">{settings.textLeftPosition.toFixed(2)}</span></label>
                <input type="range" id="textLeftPosition" min="0.5" max="20" step="0.05" value={settings.textLeftPosition} onChange={e => handleSettingChange('textLeftPosition', parseFloat(e.target.value))} className="w-full" disabled={isUiDisabled} />
            </div>
            <div>
                <label htmlFor="textBlockWidth" className="block mb-1 text-slate-600 dark:text-slate-400">Largeur du bloc de texte (cm): <span className="font-mono text-xs">{settings.textBlockWidth.toFixed(2)}</span></label>
                <input type="range" id="textBlockWidth" min="10" max="20" step="0.05" value={settings.textBlockWidth} onChange={e => handleSettingChange('textBlockWidth', parseFloat(e.target.value))} className="w-full" disabled={isUiDisabled} />
            </div>

            <hr className="border-slate-200 dark:border-slate-700 my-2" />
            
            <div>
                <label htmlFor="fontFamily" className="block mb-1 text-slate-600 dark:text-slate-400">Police de caractères</label>
                <select
                    id="fontFamily"
                    value={settings.fontFamily}
                    onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    disabled={isUiDisabled}
                >
                    {fontOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="fontSize" className="block mb-1 text-slate-600 dark:text-slate-400">Taille de police (pt): <span className="font-mono text-xs">{settings.fontSize.toFixed(1)}</span></label>
                <input type="range" id="fontSize" min="7" max="14" step="0.5" value={settings.fontSize} onChange={e => handleSettingChange('fontSize', parseFloat(e.target.value))} className="w-full" disabled={isUiDisabled} />
            </div>
            <div>
                <label htmlFor="fontWeight" className="block mb-1 text-slate-600 dark:text-slate-400">Épaisseur du texte: <span className="font-mono text-xs">{settings.fontWeight === 400 ? 'Normal' : 'Gras'}</span></label>
                <input type="range" id="fontWeight" min="400" max="700" step="300" value={settings.fontWeight} onChange={e => handleSettingChange('fontWeight', parseFloat(e.target.value))} className="w-full" disabled={isUiDisabled} />
            </div>
             <div>
                <label htmlFor="lineHeight" className="block mb-1 text-slate-600 dark:text-slate-400">Hauteur de ligne: <span className="font-mono text-xs">{settings.lineHeight.toFixed(2)}</span></label>
                <input type="range" id="lineHeight" min="1.5" max="2.5" step="0.01" value={settings.lineHeight} onChange={e => handleSettingChange('lineHeight', parseFloat(e.target.value))} className="w-full" disabled={isUiDisabled} />
            </div>
             <div>
                <label htmlFor="letterSpacing" className="block mb-1 text-slate-600 dark:text-slate-400">Espacement lettres (pt): <span className="font-mono text-xs">{settings.letterSpacing.toFixed(2)}</span></label>
                <input type="range" id="letterSpacing" min="-1" max="5" step="0.05" value={settings.letterSpacing} onChange={e => handleSettingChange('letterSpacing', parseFloat(e.target.value))} className="w-full" disabled={isUiDisabled} />
            </div>

            <hr className="border-slate-200 dark:border-slate-700 my-2" />

            <div>
                <h4 className="block mb-2 text-slate-600 dark:text-slate-400 font-medium">Options IA</h4>
                <label htmlFor="offlineQueueEnabled" className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input
                            type="checkbox"
                            id="offlineQueueEnabled"
                            className="sr-only"
                            checked={settings.isOfflineQueueEnabled}
                            onChange={(e) => handleSettingChange('isOfflineQueueEnabled', e.target.checked)}
                            disabled={isUiDisabled}
                        />
                        <div className={`block bg-slate-300 dark:bg-slate-600 w-10 h-6 rounded-full ${settings.isOfflineQueueEnabled ? 'bg-teal-500' : ''}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${settings.isOfflineQueueEnabled ? 'translate-x-full' : ''}`}></div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                        Activer la file d'attente hors ligne
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Si désactivé, les notes ne seront pas générées hors ligne.
                        </p>
                    </span>
                </label>
            </div>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
            <h4 className="block mb-2 text-slate-600 dark:text-slate-400 font-medium">Image de fond</h4>
            <div className="flex items-center gap-3">
                    <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/png, image/jpeg"
                />
                <button onClick={triggerFileUpload} className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500" disabled={isUiDisabled}>
                    <PhotoIcon className="w-4 h-4" />
                    Changer l'image...
                </button>
                <button onClick={resetBackgroundImage} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors" title="Supprimer l'image de fond" disabled={isUiDisabled}>
                    <ResetIcon className="w-4 h-4 text-slate-500" />
                </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Chargez votre propre formulaire. L'image est sauvegardée localement.
            </p>
        </div>
    </div>
  );

  const areSettingsDefault = useMemo(() => {
    return JSON.stringify(settings) === JSON.stringify(defaultLayoutSettings) && !backgroundImage;
  }, [settings, backgroundImage]);

  return (
    <>
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700 relative">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">Aperçu & Journal de Quart</h2>
            <div className="flex items-center gap-2">
            <button onClick={onReset} className="p-2 rounded-full hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-slate-700 dark:active:bg-slate-600 transition-colors" title="Réinitialiser le formulaire" disabled={isUiDisabled}>
                    <ResetIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                </button>
            <button 
                onClick={onGenerate} 
                disabled={isUiDisabled || isFormEmpty || (settings.isOfflineQueueEnabled && !isOnline && noteToRegenerate)} 
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
                { isOnline ? <SparkleIcon className="w-5 h-5" /> : <SaveIcon className="w-5 h-5" /> }
                {isGenerating ? 'Génération...' : (isOnline || !settings.isOfflineQueueEnabled ? 'Générer la Note' : 'Sauvegarder pour plus tard')}
            </button>
            </div>
        </div>
      
        {processingMessage && (
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4" role="status">
                <p>{processingMessage}</p>
            </div>
        )}
        {error && !processingMessage && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert"><p>{error}</p></div>}
      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                {/* Display Mode Toggle */}
                <div className="flex mb-4 bg-slate-100 dark:bg-slate-700 rounded-md p-1">
                    <button
                        onClick={() => setDisplayMode('singleNote')}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            displayMode === 'singleNote'
                                ? 'bg-teal-600 text-white shadow'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                        disabled={isUiDisabled}
                    >
                        Note Actuelle
                    </button>
                    <button
                        onClick={() => {
                            setDisplayMode('shiftJournal');
                            setIsEditingNote(false); // Ensure edit mode is off when switching to journal
                        }}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            displayMode === 'shiftJournal'
                                ? 'bg-teal-600 text-white shadow'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                        disabled={isUiDisabled}
                    >
                        Journal du Quart
                        {generatedNotesHistory.length > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-teal-100 bg-teal-500 rounded-full">
                                {generatedNotesHistory.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Unified Preview Area */}
                <div ref={previewRef} className="relative w-full border border-slate-300 dark:border-slate-600 rounded-md overflow-hidden bg-white aspect-[8.5/11]">
                    {backgroundImage && (
                        <img src={backgroundImage} alt="Formulaire de note d'évolution" className="absolute inset-0 w-full h-full object-contain select-none" style={{ pointerEvents: 'none' }} />
                    )}
                    
                    {isEditingNote && displayMode === 'singleNote' ? (
                        <textarea
                            value={editableNoteContent}
                            onChange={(e) => setEditableNoteContent(e.target.value)}
                            className="absolute text-black w-full h-full p-2 resize-none border-none outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                            style={{
                                fontFamily: browserFontStack,
                                fontWeight: settings.fontWeight,
                                fontSize: `${settings.fontSize}pt`,
                                lineHeight: settings.lineHeight,
                                letterSpacing: `${settings.letterSpacing}pt`,
                                top: `${(settings.textTopPosition / PAGE_HEIGHT_CM) * 100}%`,
                                left: `${(settings.textLeftPosition / PAGE_WIDTH_CM) * 100}%`,
                                width: `${(settings.textBlockWidth / PAGE_WIDTH_CM) * 100}%`,
                                height: `calc(100% - ${(settings.textTopPosition / PAGE_HEIGHT_CM) * 100}%)`, 
                                background: 'transparent',
                                color: 'rgb(31 41 55)', 
                            }}
                        />
                    ) : (
                        <div 
                            onMouseDown={handleMouseDown}
                            className={`absolute text-black transition-shadow duration-200
                                ${isDraggable ? 'cursor-move hover:outline-dotted hover:outline-2 hover:outline-slate-400/50' : ''}
                                ${dragStartRef.current ? 'outline-dotted outline-2 outline-teal-500/80 shadow-lg' : ''}
                            `}
                            style={{
                                fontFamily: browserFontStack,
                                fontWeight: settings.fontWeight,
                                top: `${(settings.textTopPosition / PAGE_HEIGHT_CM) * 100}%`,
                                left: `${(settings.textLeftPosition / PAGE_WIDTH_CM) * 100}%`,
                                width: `${(settings.textBlockWidth / PAGE_WIDTH_CM) * 100}%`,
                                color: theme === 'dark' ? 'rgb(203 213 225)' : 'rgb(31 41 55)',
                            }}
                        >
                        {isGenerating && displayMode === 'singleNote'
                                ? <div style={{fontSize: '1rem', whiteSpace: 'pre-wrap', color: 'rgb(100 116 139)'}}>Génération en cours, veuillez patienter...</div> 
                                : noteLines.map((line, index) => (
                                <div
                                    key={index}
                                    style={{
                                        fontSize: `${settings.fontSize}pt`,
                                        lineHeight: settings.lineHeight,
                                        letterSpacing: `${settings.letterSpacing}pt`,
                                        whiteSpace: 'pre',
                                    }}
                                >
                                    {line || '\u00A0'}
                                </div>
                            ))}
                        </div>
                    )}
                
                    {(currentContentForPreview.trim() === '' || currentContentForPreview.includes("Aucune note n'a été générée")) && !isGenerating && !isProcessingQueue && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-800/70 backdrop-blur-[2px]">
                            <p className="text-slate-500 dark:text-slate-400 text-center p-4 font-sans text-base bg-slate-100/80 dark:bg-slate-900/80 rounded-lg shadow">
                                {backgroundImage ? "La note générée par l'IA apparaîtra ici." : "Chargez une image de formulaire via les ajustements, puis remplissez le formulaire pour commencer."}
                            </p>
                        </div>
                    )}
                
                    {(currentContentForPreview.trim() !== '' && !currentContentForPreview.includes("Aucune note n'a été générée")) && !isGenerating && !isProcessingQueue && (
                    <div className="absolute top-2 right-2 flex gap-1.5">
                        {displayMode === 'singleNote' && (
                            <>
                                {!isEditingNote && (
                                    <button onClick={handleEditNote} className="p-2 rounded-md bg-white/80 backdrop-blur-sm dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 transition-colors shadow-md" title="Modifier la note">
                                        <PencilIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                    </button>
                                )}
                                {isEditingNote && (
                                    <>
                                        <button 
                                            onClick={handleSaveNoteEdit} 
                                            className="p-2 rounded-md bg-white/80 backdrop-blur-sm dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 transition-colors shadow-md" 
                                            title="Enregistrer les modifications"
                                            disabled={isSaveDisabled}
                                        >
                                            <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </button>
                                        <button onClick={handleCancelNoteEdit} className="p-2 rounded-md bg-white/80 backdrop-blur-sm dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 transition-colors shadow-md" title="Annuler les modifications">
                                            <XMarkIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                        <button onClick={handleCopy} className="p-2 rounded-md bg-white/80 backdrop-blur-sm dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 transition-colors shadow-md" title="Copier le texte" disabled={isUiDisabled}>
                           <CopyIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                        <button onClick={() => generatePdf('letter')} className="p-2 rounded-md bg-white/80 backdrop-blur-sm dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 transition-colors shadow-md" title="Télécharger en PDF (Format Lettre US)" disabled={isUiDisabled}>
                            <DocumentDownloadIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                        <button onClick={handlePrint} className="p-2 rounded-md bg-white/80 backdrop-blur-sm dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 transition-colors shadow-md" title="Imprimer" disabled={isUiDisabled}>
                           <PrintIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                    </div>
                    )}
                </div>
            </div>
            <div className="space-y-4 lg:col-span-1">
                 <CollapsibleSection
                    title="Ajustements d'affichage"
                    isOpen={showAdjustments} 
                    onToggle={() => setShowAdjustments(p => !p)}
                    isFilled={!areSettingsDefault}
                >
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Ajustements</h3>
                        <button onClick={handleResetSettings} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors" title="Réinitialiser les ajustements d'affichage">
                            <ResetIcon className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>
                    {adjustmentsPanel}
                </CollapsibleSection>

                 <CollapsibleSection
                    title="Historique des notes du quart"
                    isOpen={showHistory}
                    onToggle={() => setShowHistory(p => !p)}
                    isFilled={generatedNotesHistory.length > 0}
                >
                    <ShiftJournal
                        history={generatedNotesHistory}
                        patients={patients}
                        onUpdateNote={onUpdateNoteInHistory}
                        onDeleteNote={onDeleteNoteFromHistory}
                        onRecallNote={onRecallNote}
                    />
                </CollapsibleSection>
                
                {/* Integrate the new ZplGenerator component here */}
                <CollapsibleSection
                  title="Générer Étiquette ZPL"
                  isOpen={true} // Always open as per previous behavior, but its internal controls will be disabled.
                  onToggle={() => {}} // No toggle for this section, it's always visible in its slot
                  isFilled={value.trim() !== '' && displayMode === 'singleNote'} // Filled only if there's content and in single note mode
                >
                    <ZplGenerator 
                        noteContent={value}
                        theme={theme}
                        isDisabled={isUiDisabled || isEditingNote}
                        zplGeneratorMode={displayMode}
                    />
                </CollapsibleSection>
            </div>
        </div>
       {isCopied && <div className="absolute bottom-5 right-5 bg-slate-800 text-white text-sm py-1 px-3 rounded-md animate-pulse">Copié !</div>}
    </div>
    </>
  );
};

export default GeneratedNote;
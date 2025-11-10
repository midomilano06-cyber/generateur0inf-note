import React, { useState, useMemo, useCallback } from 'react';
import type { GeneratedNoteRecord, Patient } from '../types';

// Icons
const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14.25v4.5a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18.75v-11.25A2.25 2.25 0 015.25 5.25h4.5" />
    </svg>
);
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
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
const RecallIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.691L7.5 7.5l-2.682 2.682A8.25 8.25 0 009.75 21.75l3.182-3.182m0-4.242l-3.182-3.182" />
  </svg>
);
const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


interface ShiftJournalProps {
    history: GeneratedNoteRecord[];
    patients: Patient[];
    onUpdateNote: (patientId: string | null, timestamp: number, newContent: string) => void;
    onDeleteNote: (timestamp: number) => void;
    onRecallNote: (record: GeneratedNoteRecord) => void;
}

interface EditState {
    timestamp: number;
    content: string;
}

const ShiftJournal: React.FC<ShiftJournalProps> = ({ history, patients, onUpdateNote, onDeleteNote, onRecallNote }) => {
    const [editingNote, setEditingNote] = useState<EditState | null>(null);

    const sortedHistory = useMemo(() => {
        return [...history].sort((a, b) => a.timestamp - b.timestamp);
    }, [history]);

    const notesByPatient = useMemo(() => {
        const grouped: { [key: string]: GeneratedNoteRecord[] } = {};
        sortedHistory.forEach(note => {
            const patientKey = note.patientId || 'unknown';
            if (!grouped[patientKey]) {
                grouped[patientKey] = [];
            }
            grouped[patientKey].push(note);
        });
        return grouped;
    }, [sortedHistory]);

    const handleEditClick = (note: GeneratedNoteRecord) => {
        setEditingNote({ timestamp: note.timestamp, content: note.noteContent });
    };

    const handleSaveEdit = () => {
        if (editingNote) {
            const originalNote = history.find(n => n.timestamp === editingNote.timestamp);
            onUpdateNote(originalNote?.patientId || null, editingNote.timestamp, editingNote.content);
            setEditingNote(null);
        }
    };

    const handleCancelEdit = () => {
        setEditingNote(null);
    };

    const formatTimestamp = useCallback((timestamp: number): string => {
        return new Date(timestamp).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
    }, []);

    if (history.length === 0) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px] bg-slate-50 dark:bg-slate-800/50 rounded-md border-2 border-dashed border-slate-300 dark:border-slate-600">
                <p className="text-slate-500 dark:text-slate-400 text-center">Aucune note dans le journal pour le moment.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-h-[calc(8.5/11*70vw)] lg:max-h-[70vh] overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900/50 rounded-md border border-slate-200 dark:border-slate-700">
            {Object.entries(notesByPatient).map(([patientId, notes]) => {
                const patient = patients.find(p => p.id === patientId);
                const patientName = patient?.name || (Array.isArray(notes) && notes[0]?.patientName) || 'Patient Inconnu';
                const room = patient?.room ? `(Ch. ${patient.room})` : '';

                return (
                    <div key={patientId} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-teal-700 dark:text-teal-400 mb-3">{patientName} <span className="text-sm font-normal text-slate-500">{room}</span></h3>
                        <div className="space-y-4">
                            {Array.isArray(notes) && notes.map(note => (
                                <div key={note.timestamp} className={`p-3 rounded-md bg-slate-50 dark:bg-slate-800/70 border ${note.isOffline ? 'border-amber-400 dark:border-amber-500' : 'border-slate-200 dark:border-slate-700/50'}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-grow">
                                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-2">
                                                <span>{formatTimestamp(note.timestamp)}</span>
                                                {note.isOffline && (
                                                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400" title="Cette note a été générée hors ligne et sera mise à jour par l'IA lors de la prochaine connexion.">
                                                        <ClockIcon className="w-3 h-3" />
                                                        <span>En attente de synchro</span>
                                                    </span>
                                                )}
                                            </div>
                                            {editingNote?.timestamp === note.timestamp ? (
                                                <textarea
                                                    value={editingNote.content}
                                                    onChange={(e) => setEditingNote(prev => prev ? { ...prev, content: e.target.value } : null)}
                                                    rows={5}
                                                    className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-sm"
                                                />
                                            ) : (
                                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{note.noteContent}</p>
                                            )}
                                        </div>
                                        <div className="flex-shrink-0 ml-4 flex flex-col gap-1">
                                            {editingNote?.timestamp === note.timestamp ? (
                                                <>
                                                    <button onClick={handleSaveEdit} className="p-2 rounded-md hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors" title="Enregistrer">
                                                        <CheckIcon className="w-5 h-5 text-green-600" />
                                                    </button>
                                                    <button onClick={handleCancelEdit} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors" title="Annuler">
                                                        <XMarkIcon className="w-5 h-5 text-slate-600" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => onRecallNote(note)} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="Rappeler la saisie de cette note">
                                                        <RecallIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                                    </button>
                                                    <button onClick={() => handleEditClick(note)} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="Modifier le texte">
                                                        <PencilIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                                    </button>
                                                    <button onClick={() => onDeleteNote(note.timestamp)} className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" title="Supprimer cette note">
                                                        <TrashIcon className="w-5 h-5 text-red-500" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ShiftJournal;
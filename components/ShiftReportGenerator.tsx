


import React, { useState, useEffect, useCallback } from 'react';
import type { GeneratedNoteRecord, Patient } from '../types';
import CollapsibleSection from './CollapsibleSection';
import jsPDF from 'jspdf'; // Import jsPDF for PDF generation

const DocumentTextIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" />
    </svg>
);

const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 01-1.47-1.47L12.964 18l1.188-.648a2.25 2.25 0 011.47-1.47L16.25 15l.648 1.188a2.25 2.25 0 011.47 1.47L19.536 18l-1.188.648a2.25 2.25 0 01-1.47 1.47z" />
  </svg>
);

const CopyIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);


interface ShiftReportGeneratorProps {
    generatedNotesHistory: GeneratedNoteRecord[];
    onGenerate: () => Promise<void>;
    output: string;
    isLoading: boolean;
    error: string | null;
    onClear: () => void;
    hasNotesToReport: boolean;
}

const ShiftReportGenerator: React.FC<ShiftReportGeneratorProps> = ({
    generatedNotesHistory,
    onGenerate,
    output,
    isLoading,
    error,
    onClear,
    hasNotesToReport,
}) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(true); // Always open by default for prominence

    const handleCopy = () => {
        if (output) {
            navigator.clipboard.writeText(output);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const isFilled = output.trim() !== '' || generatedNotesHistory.length > 0;

    return (
        <CollapsibleSection
            title="Rapport de Garde IA"
            isOpen={isOpen}
            onToggle={() => setIsOpen(!isOpen)}
            isFilled={isFilled}
        >
            <div className="space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Générez un résumé des notes d'évolution de tous les patients pour faciliter la transmission à l'équipe suivante.
                </p>

                <div className="flex gap-2">
                    <button
                        onClick={onGenerate}
                        disabled={isLoading || !hasNotesToReport}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                    >
                        <SparkleIcon className="w-5 h-5" />
                        {isLoading ? 'Génération...' : 'Générer le Rapport'}
                    </button>
                    <button
                        onClick={onClear}
                        disabled={!isFilled}
                        className="p-2 rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Effacer le rapport et l'historique des notes"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>

                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mt-4" role="alert"><p>{error}</p></div>}
                
                {output && !isLoading && (
                    <div className="relative mt-4">
                        <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">Rapport Synthétisé</h3>
                        <div className="prose prose-sm dark:prose-invert max-w-none bg-slate-50 dark:bg-slate-800/50 p-3 rounded-md whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                            {output}
                        </div>
                        <button
                            onClick={handleCopy}
                            title={isCopied ? "Copié !" : "Copier le rapport"}
                            className="absolute top-2 right-2 p-1.5 rounded-md bg-white/50 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            <CopyIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                        </button>
                    </div>
                )}
                {!output && !isLoading && generatedNotesHistory.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
                        <p className="text-sm">
                            Historique des notes ({generatedNotesHistory.length}) prêt pour la génération du rapport synthétisé. Cliquez sur "Générer le Rapport" ci-dessus.
                        </p>
                    </div>
                )}
                {!output && !isLoading && generatedNotesHistory.length === 0 && (
                     <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-center">
                        <p className="text-sm">
                            Générez des notes d'évolution pour différents patients pour commencer à construire votre rapport de garde.
                        </p>
                    </div>
                )}
            </div>
            
            {isCopied && <div className="absolute bottom-5 right-5 bg-slate-800 text-white text-sm py-1 px-3 rounded-md animate-pulse">Copié !</div>}
        </CollapsibleSection>
    );
};

export default ShiftReportGenerator;
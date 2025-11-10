import React, { useState, useEffect, useCallback, useMemo } from 'react';
import RadioGroup from './RadioGroup';
import type { Option, ClinicalAssistantRequest, KnowledgeBaseArticle } from '../types';
import CollapsibleSection from './CollapsibleSection';
import jsPDF from 'jspdf'; // Import jsPDF

// Icons
const SparkleIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 01-1.47-1.47L12.964 18l1.188-.648a2.25 2.25 0 011.47-1.47L16.25 15l.648 1.188a2.25 2.25 0 011.47 1.47L19.536 18l-1.188.648a2.25 2.25 0 01-1.47 1.47z" />
  </svg>
);

const CopyIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

// NEW: Download Document Icon
const DocumentDownloadIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" />
    </svg>
);

// NEW: Clock Icon for pending status
const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// NEW: Trash Icon for deleting queued requests
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

// NEW: Recall Icon for recalling queued requests
const RecallIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.691L7.5 7.5l-2.682 2.682A8.25 8.25 0 009.75 21.75l3.182-3.182m0-4.242l-3.182-3.182" />
    </svg>
);


interface ClinicalAssistantProps {
    question: string;
    onQuestionChange: (value: string) => void;
    complexity: string;
    onComplexityChange: (value: string) => void;
    response: string;
    isLoading: boolean;
    error: string | null;
    onGenerate: () => void;
    complexityOptions: Option[];
    // NEW PROPS
    isOnline: boolean;
    isProcessingQueue: boolean;
    processingMessage: string | null;
    addExtraSpaceSetting: boolean;
    onToggleExtraSpaceSetting: () => void;
    queue: ClinicalAssistantRequest[];
    onDeleteQueuedRequest: (id: string) => void;
    onRecallQueuedRequest: (request: ClinicalAssistantRequest) => void;
    // NEW: Article Knowledge Base props
    includeArticleKnowledgeBase: boolean;
    onToggleIncludeArticleKnowledgeBase: () => void;
    knowledgeBaseArticles: KnowledgeBaseArticle[];
}

export const ClinicalAssistant: React.FC<ClinicalAssistantProps> = ({
    question,
    onQuestionChange,
    complexity,
    onComplexityChange,
    response,
    isLoading,
    error,
    onGenerate,
    complexityOptions,
    // NEW PROPS
    isOnline,
    isProcessingQueue,
    processingMessage,
    addExtraSpaceSetting,
    onToggleExtraSpaceSetting,
    queue,
    onDeleteQueuedRequest,
    onRecallQueuedRequest,
    // NEW: Article Knowledge Base props
    includeArticleKnowledgeBase,
    onToggleIncludeArticleKnowledgeBase,
    knowledgeBaseArticles,
}) => {
    const [isCopied, setIsCopied] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const handleCopy = () => {
        if (response) {
            navigator.clipboard.writeText(response);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    // NEW: PDF generation for assistant response
    const generateAssistantPdf = useCallback(() => {
        if (!response.trim()) return;

        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');

        const lines = doc.splitTextToSize(response, 180); // 180mm width for text

        let y = 20; // Starting Y position
        for (const line of lines) {
            if (y > 280) { // Check if new page is needed
                doc.addPage();
                y = 20;
            }
            doc.text(line, 15, y);
            y += 7; // Line height
        }
        
        doc.save(`reponse-assistant-clinique-${Date.now()}.pdf`);

    }, [response]);

    const sortedQueue = useMemo(() => {
        return [...queue].sort((a, b) => b.timestamp - a.timestamp); // Newest first
    }, [queue]);

    const isGenerateButtonDisabled = isLoading || !question.trim() || isProcessingQueue;
    const buttonText = isLoading ? 'Réflexion en cours...' : (isOnline ? 'Générer la Réponse' : 'Mettre en file d\'attente (Hors ligne)');

    return (
        <div className="space-y-4">
            {/* NEW: Toggle for Article Knowledge Base */}
            {knowledgeBaseArticles.length > 0 && (
                <label className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer w-fit">
                    <input
                        type="checkbox"
                        checked={includeArticleKnowledgeBase}
                        onChange={onToggleIncludeArticleKnowledgeBase}
                        className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-teal-600 focus:ring-teal-500"
                        disabled={isLoading || isProcessingQueue}
                    />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                        Inclure la Base de Connaissances d'Articles ({knowledgeBaseArticles.length})
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 ml-2">
                        L'IA utilisera les articles stockés pour enrichir ses réponses.
                    </p>
                </label>
            )}

            <div>
                <label htmlFor="clinical-question" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Votre question</label>
                <textarea
                    id="clinical-question"
                    rows={3}
                    value={question}
                    onChange={(e) => onQuestionChange(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="Ex: Quelle est la différence entre l'hypoglycémie et l'hyperglycémie ?"
                    disabled={isLoading || isProcessingQueue}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Niveau de complexité</label>
                <RadioGroup 
                    name="complexity" 
                    options={complexityOptions} 
                    selectedValue={complexity} 
                    onChange={onComplexityChange} 
                    disabled={isLoading || isProcessingQueue}
                />
            </div>
            
            {/* NEW: Checkbox for extra space */}
            <label className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer w-fit">
                <input
                type="checkbox"
                checked={addExtraSpaceSetting}
                onChange={onToggleExtraSpaceSetting}
                className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-teal-600 focus:ring-teal-500"
                disabled={isLoading || isProcessingQueue}
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Ajouter une ligne blanche additionnelle</span>
            </label>

            <button
                onClick={onGenerate}
                disabled={isGenerateButtonDisabled}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
                <SparkleIcon className="w-5 h-5" />
                {buttonText}
            </button>

            {(response || isLoading || error || isProcessingQueue) && (
                <div className="mt-4">
                    <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">Réponse de l'Assistant</h3>
                    {isLoading && <p className="text-slate-500 dark:text-slate-400 animate-pulse">L'assistant génère une réponse...</p>}
                    {isProcessingQueue && processingMessage && (
                        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-3 mb-3" role="status">
                            <p>{processingMessage}</p>
                        </div>
                    )}
                    {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3" role="alert"><p>{error}</p></div>}
                    {response && !isLoading && (
                         <div className="relative">
                            <div className="prose prose-sm dark:prose-invert max-w-none bg-slate-50 dark:bg-slate-800/50 p-3 rounded-md whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                                {response}
                            </div>
                            <div className="absolute top-2 right-2 flex gap-1.5">
                                <button
                                    onClick={handleCopy}
                                    title={isCopied ? "Copié !" : "Copier la réponse"}
                                    className="p-1.5 rounded-md bg-white/50 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    <CopyIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                </button>
                                <button
                                    onClick={generateAssistantPdf}
                                    title="Télécharger la réponse en PDF"
                                    className="p-1.5 rounded-md bg-white/50 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    <DocumentDownloadIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* NEW: Clinical Assistant History */}
            {sortedQueue.length > 0 && (
                <CollapsibleSection
                    title="Historique des questions"
                    isOpen={showHistory}
                    onToggle={() => setShowHistory(prev => !prev)}
                    isFilled={sortedQueue.length > 0}
                >
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {sortedQueue.map(req => (
                            <div key={req.id} className={`p-3 rounded-md border ${req.status === 'pending' ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-400 text-amber-800 dark:text-amber-300' : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-grow">
                                        <p className="font-semibold text-sm">
                                            {req.question} 
                                            <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">({req.complexity})</span>
                                        </p>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                                            <span>{new Date(req.timestamp).toLocaleString()}</span>
                                            {req.status === 'pending' && (
                                                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                                    <ClockIcon className="w-3 h-3" /> En attente
                                                </span>
                                            )}
                                            {req.includeArticleKnowledgeBase && (
                                                <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400" title="Cette requête a utilisé la Base de Connaissances d'Articles">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                                        <path fillRule="evenodd" d="M2.5 6A2.5 2.5 0 015 3.5h6A2.5 2.5 0 0113.5 6v3.5l1.812-.725A1.25 1.25 0 0117.5 10V15a.5.5 0 00.75.433l2-1A.5.5 0 0021 14.5V9.75a2.75 2.75 0 00-2.75-2.75h-.215L13.956 4.12A2.502 2.502 0 0011.5 3.5h-6A2.5 2.5 0 002.5 6v8a2.5 2.5 0 002.5 2.5h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A2.5 2.5 0 005 17h7.5a.5.5 0 010 1H5A3.5 3.5 0 011.5 14V6A3.5 3.5 0 015 2.5h6A3.5 3.5 0 0114.5 6v3.75a.5.5 0 001 0V6A2.5 2.5 0 0013.5 3.5h-.5a2.5 2.5 0 00-2.5-2.5H5A2.5 2.5 0 002.5 3.5v11A
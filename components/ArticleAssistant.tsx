import React, { useState, useCallback, useMemo } from 'react';
import jsPDF from 'jspdf';
import CollapsibleSection from './CollapsibleSection';
import type { KnowledgeBaseArticle } from '../types'; // Only KnowledgeBaseArticle needed now
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Configure PDF.js worker source
GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.mjs';

// Icons
const PdfUploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3V12m-8.25 6.75h16.5a.75.75 0 00.75-.75v-1.5a.75.75 0 00-.75-.75H3.75a.75.75 0 00-.75.75v1.5c0 .414.336.75.75.75z" />
    </svg>
);
const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);
const RecallIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.691L7.5 7.5l-2.682 2.682A8.25 8.25 0 009.75 21.75l3.182-3.182m0-4.242l-3.182-3.182" />
    </svg>
);

interface ArticleAssistantProps {
    articleContent: string;
    onArticleContentChange: (value: string) => void;
    isPdfLoading: boolean; // Renamed for clarity, indicates PDF processing
    ingestionMessage: string | null; // Renamed for clarity, indicates PDF/ingestion message
    onIngest: (content: string, fileName: string | null) => void;
    articles: KnowledgeBaseArticle[]; // List of stored articles
    onDeleteArticle: (id: string) => void;
    onRecallArticle: (article: KnowledgeBaseArticle) => void;
}

const ArticleAssistant: React.FC<ArticleAssistantProps> = ({
    articleContent,
    onArticleContentChange,
    isPdfLoading,
    ingestionMessage,
    onIngest,
    articles,
    onDeleteArticle,
    onRecallArticle,
}) => {
    const [pdfError, setPdfError] = useState<string | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

    const handlePdfUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setPdfError('Veuillez sélectionner un fichier PDF.');
            setUploadedFileName(null);
            return;
        }

        setPdfError(null);
        setUploadedFileName(file.name);
        onIngest('', null); // Clear previous content and reset message via onIngest callback

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const arrayBuffer = e.target?.result;
                if (!arrayBuffer) {
                    setPdfError('Impossible de lire le fichier PDF.');
                    onIngest('', null); // Trigger loading state reset indirectly
                    return;
                }

                const pdf = await getDocument(arrayBuffer).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
                }
                onIngest(fullText.trim(), file.name); // Pass content and filename for ingestion
            };
            reader.onerror = () => {
                setPdfError('Erreur lors de la lecture du fichier.');
                onIngest('', null); // Trigger loading state reset indirectly
            };
            reader.readAsArrayBuffer(file);
        } catch (err) {
            console.error('Erreur lors du traitement du PDF:', err);
            setPdfError('Erreur lors du traitement du PDF. Assurez-vous que c\'est un PDF valide.');
            onIngest('', null); // Trigger loading state reset indirectly
        } finally {
            // Reset file input value to allow re-uploading the same file
            event.target.value = '';
        }
    }, [onIngest]);

    const handleClearPdfContent = useCallback(() => {
        onArticleContentChange('');
        setUploadedFileName(null);
        setPdfError(null);
    }, [onArticleContentChange]);

    const handleAddArticle = useCallback(() => {
        onIngest(articleContent, uploadedFileName); // Use the current article content and uploaded file name
    }, [articleContent, onIngest, uploadedFileName]);

    const sortedArticles = useMemo(() => {
        return [...articles].sort((a, b) => b.timestamp - a.timestamp); // Newest first
    }, [articles]);


    const isIngestButtonDisabled = isPdfLoading || !articleContent.trim();

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="pdf-upload" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Téléverser un article (PDF)</label>
                <div className="flex items-center space-x-2">
                    <input
                        id="pdf-upload"
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfUpload}
                        className="hidden"
                        disabled={isPdfLoading}
                    />
                    <button
                        onClick={() => document.getElementById('pdf-upload')?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        disabled={isPdfLoading}
                    >
                        <PdfUploadIcon className="w-5 h-5" />
                        <span>{uploadedFileName ? 'Changer de PDF' : 'Sélectionner un PDF'}</span>
                    </button>
                    {uploadedFileName && (
                        <div className="flex items-center gap-1">
                            <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[150px]">{uploadedFileName}</span>
                            <button onClick={handleClearPdfContent} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors" title="Effacer le contenu PDF">
                                <TrashIcon className="w-4 h-4 text-red-500" />
                            </button>
                        </div>
                    )}
                </div>
                {isPdfLoading && (
                    <p className="text-sm text-blue-500 dark:text-blue-400 mt-2 flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 animate-spin" />
                        Extraction du texte du PDF en cours...
                    </p>
                )}
                {pdfError && <p className="text-sm text-red-500 mt-2">{pdfError}</p>}
            </div>

            <div>
                <label htmlFor="article-content" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Contenu de l'Article / Directive</label>
                <textarea
                    id="article-content"
                    rows={8}
                    value={articleContent}
                    onChange={(e) => onArticleContentChange(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="Collez ici le contenu de l'article, de la directive ou du protocole..."
                    disabled={isPdfLoading}
                />
            </div>
            
            {ingestionMessage && (
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-3 mb-3" role="status">
                    <p>{ingestionMessage}</p>
                </div>
            )}

            <button
                onClick={handleAddArticle}
                disabled={isIngestButtonDisabled}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Ajouter à la base de connaissances</span>
            </button>
            
            {/* Knowledge Base Article History */}
            {sortedArticles.length > 0 && (
                <CollapsibleSection
                    title="Articles de la Base de Connaissances"
                    isOpen={true} // Keep open by default as it's a primary display
                    onToggle={() => {}} // No toggle for this section
                    isFilled={sortedArticles.length > 0}
                >
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {sortedArticles.map(article => (
                            <div key={article.id} className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-grow">
                                        <p className="font-semibold text-sm">
                                            {article.title}
                                        </p>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                                            <span>{new Date(article.timestamp).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 ml-4 flex gap-1">
                                        <button 
                                            onClick={() => onRecallArticle(article)} 
                                            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                            title="Charger l'article pour édition"
                                            disabled={isPdfLoading}
                                        >
                                            <RecallIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                        </button>
                                        <button 
                                            onClick={() => onDeleteArticle(article.id)} 
                                            className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                            title="Supprimer cet article"
                                            disabled={isPdfLoading}
                                        >
                                            <TrashIcon className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm whitespace-pre-wrap mt-2 prose prose-sm dark:prose-invert max-w-none">
                                    {article.content.substring(0, 200)}... {/* Show a snippet */}
                                </p>
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
};

export default ArticleAssistant;
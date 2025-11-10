import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const PrintIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
);

const ClearIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);

interface ZplGeneratorProps {
    noteContent: string;
    theme: 'light' | 'dark';
    isDisabled: boolean; // From GeneratedNote's isEditingNote
    zplGeneratorMode: 'singleNote' | 'shiftJournal';
}

const getDpiValue = (printQuality: string): number => {
    switch (printQuality) {
        case '6dpmm': return 152;
        case '8dpmm': return 203;
        case '12dpmm': return 300;
        case '24dpmm': return 600;
        default: return 203; // Default to 8dpmm
    }
};

const generateZplFromNote = (note: string, textSize: number, labelWidthInches: number, labelHeightInches: number, printQuality: string) => {
  // Escape ZPL control characters and other potentially problematic characters
  const escapedText = note
    .replace(/\\/g, '_5C') // Escape backslash first
    .replace(/\^/g, '_5E') // Escape caret
    .replace(/~/g, '_7E')  // Escape tilde
    .replace(/_/g, '_5F')  // Escape underscore (after \ is escaped)
    .replace(/</g, '_3C')  // Escape less-than
    .replace(/>/g, '_3E')  // Escape greater-than
    .replace(/[\r\n]+/g, '\\&'); // Replace newlines with ZPL newline command

  const DPI = getDpiValue(printQuality);

  // Calculate label dimensions in dots
  const pwDots = Math.round(labelWidthInches * DPI);
  const llDots = Math.round(labelHeightInches * DPI);

  // Calculate font dimensions in dots
  // textSize is in points (pt), 1 inch = 72 pt
  const fontHeightDots = Math.round((textSize / 72) * DPI);
  const fontWidthDots = Math.round(fontHeightDots * 0.6); // Maintain aspect ratio for A0N font

  // Define margins and text block positions
  const marginDots = 5; // A small margin from the label edges
  const fo_x = marginDots;
  const fo_y = marginDots;
  const fb_width = Math.max(1, pwDots - (2 * marginDots)); // Ensure width is at least 1 dot

  // Calculate maximum lines based on remaining label height
  const availableHeightForText = Math.max(0, llDots - (2 * marginDots));
  const maxLines = Math.floor(availableHeightForText / fontHeightDots);
  
  // If maxLines is 0, the font is too large for the label height with margins
  // In this case, Labelary might return an empty image or error, but we still generate ZPL.

  return `^XA
^PW${pwDots}
^LL${llDots}
^CI28
^FO${fo_x},${fo_y}
^A0N,${fontHeightDots},${fontWidthDots}
^FB${fb_width},${maxLines > 0 ? maxLines : 1},0,L,0^FD${escapedText}^FS
^XZ`;
};

const ZplGenerator: React.FC<ZplGeneratorProps> = ({ noteContent, theme, isDisabled, zplGeneratorMode }) => {
  const DEFAULT_LABEL_WIDTH_CM = 5.4;
  const DEFAULT_LABEL_HEIGHT_CM = 3.2;
  const DEFAULT_LABEL_WIDTH_IN = DEFAULT_LABEL_WIDTH_CM / 2.54;
  const DEFAULT_LABEL_HEIGHT_IN = DEFAULT_LABEL_HEIGHT_CM / 2.54;

  const [dynamicNote, setDynamicNote] = useState<string>(noteContent);
  const [textSize, setTextSize] = useState<number>(8); // Default font size set to 8
  const [labelSize, setLabelSize] = useState<string>(`${DEFAULT_LABEL_WIDTH_IN.toFixed(2)}x${DEFAULT_LABEL_HEIGHT_IN.toFixed(2)}`); // Default to 5.4cm x 3.2cm
  const [customWidth, setCustomWidth] = useState(DEFAULT_LABEL_WIDTH_CM.toString()); // For custom option, initial value is for 5.4cm
  const [customHeight, setCustomHeight] = useState(DEFAULT_LABEL_HEIGHT_CM.toString()); // For custom option, initial value is for 3.2cm
  const [customUnit, setCustomUnit] = useState<'in' | 'cm'>('cm');
  const [printQuality, setPrintQuality] = useState<string>('8dpmm'); // Default to 8dpmm (203 dpi)
  const [rotation, setRotation] = useState<number>(0);

  const [zplCode, setZplCode] = useState<string>('');
  const [labelImageUrl, setLabelImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const isEffectivelyDisabled = isDisabled || zplGeneratorMode !== 'singleNote';

  // Parse current label dimensions from state
  const currentLabelDimensions = useMemo(() => {
    let width = DEFAULT_LABEL_WIDTH_IN;
    let height = DEFAULT_LABEL_HEIGHT_IN;

    if (labelSize === 'custom') {
        let w = parseFloat(customWidth.replace(',', '.'));
        let h = parseFloat(customHeight.replace(',', '.'));
        
        if (customUnit === 'cm') {
            w = w / 2.54;
            h = h / 2.54;
        }

        if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
            width = w;
            height = h;
        }
    } else {
        const parts = labelSize.split('x').map(Number);
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            width = parts[0];
            height = parts[1];
        }
    }
    return { width, height };
  }, [labelSize, customWidth, customHeight, customUnit, DEFAULT_LABEL_WIDTH_IN, DEFAULT_LABEL_HEIGHT_IN]);


  // Sync internal dynamicNote with external noteContent when prop changes, if not currently disabled
  useEffect(() => {
    if (!isDisabled) { // Only update if the ZPL generator is not generally disabled (e.g., main note is being edited)
         setDynamicNote(noteContent);
    }
  }, [noteContent, isDisabled]);

  // Update zplCode whenever dynamicNote, textSize, or label dimensions/quality change
  useEffect(() => {
    const { width, height } = currentLabelDimensions;
    setZplCode(generateZplFromNote(dynamicNote, textSize, width, height, printQuality));
  }, [dynamicNote, textSize, currentLabelDimensions, printQuality]);

  const fetchLabelImage = useCallback(async (code: string) => {
    if (isEffectivelyDisabled || !code.trim()) {
      setIsLoading(false);
      setLabelImageUrl(null);
      setError(zplGeneratorMode !== 'singleNote' ? "La génération ZPL n'est disponible que pour les notes individuelles (mode 'Note AI')." : null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { width, height } = currentLabelDimensions;
    const dimension = `${width.toFixed(2)}x${height.toFixed(2)}`;

    if (width <= 0 || height <= 0 || isNaN(width) || isNaN(height)) {
        setError('Dimensions d\'étiquette invalides. Veuillez entrer des nombres positifs pour la largeur et la hauteur.');
        setLabelImageUrl(null);
        setIsLoading(false);
        return;
    }
    
    try {
      const formData = new FormData();
      formData.append('file', new Blob([code], { type: 'text/plain' }), 'label.zpl');
      
      const response = await fetch(`https://api.labelary.com/v1/printers/${printQuality}/labels/${dimension}/${rotation}/`, {
        method: 'POST',
        headers: { 'Accept': 'image/png' },
        body: formData,
      });

      if (response.ok) {
        const imageBlob = await response.blob();
        const objectURL = URL.createObjectURL(imageBlob);
        setLabelImageUrl(objectURL);
      } else {
        const errorText = await response.text();
        setError(`Erreur de l'API Labelary : ${errorText}`);
        setLabelImageUrl(null);
      }
    } catch (err) {
      setError('Erreur réseau. Veuillez vérifier votre connexion.');
      setLabelImageUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentLabelDimensions, printQuality, rotation, isEffectivelyDisabled, zplGeneratorMode]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchLabelImage(zplCode);
    }, 300);

    return () => clearTimeout(handler);
  }, [zplCode, fetchLabelImage, labelSize, customWidth, customHeight, customUnit, printQuality, rotation]); // Depend on all relevant states for label image fetch

  useEffect(() => {
    return () => { if (labelImageUrl) URL.revokeObjectURL(labelImageUrl); };
  }, [labelImageUrl]);

  const handleDownload = () => {
    if (isEffectivelyDisabled) return;
    const blob = new Blob([zplCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'label.zpl';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (isEffectivelyDisabled) return;
    if (!labelImageUrl) return; // Print the preview image, not raw ZPL from scratch
    const printWindow = window.open(labelImageUrl, '_blank');
    if (!printWindow) {
        alert("L'aperçu n'a pas pu être ouvert. Veuillez autoriser les pop-ups pour ce site.");
    }
  };

  const handleClear = () => { 
    if (isEffectivelyDisabled) return;
    setDynamicNote(''); 
    const { width, height } = currentLabelDimensions;
    setZplCode(generateZplFromNote('', textSize, width, height, printQuality));
  };

  const handleInsertSnippet = (snippet: string) => {
    if (isEffectivelyDisabled) return;
    const editor = editorRef.current;
    if (!editor) return;
    const { selectionStart, selectionEnd, value } = editor;
    const newText = value.substring(0, selectionStart) + snippet + value.substring(selectionEnd);
    setZplCode(newText);
    setTimeout(() => {
        editor.focus();
        editor.selectionStart = editor.selectionEnd = selectionStart + snippet.length;
    }, 0);
  };

  const hasZplContent = zplCode.trim() !== '' && zplGeneratorMode === 'singleNote';
  const hasDynamicNoteContent = dynamicNote.trim() !== '' && zplGeneratorMode === 'singleNote';
  const hasError = useMemo(() => {
    return zplGeneratorMode !== 'singleNote' || error;
  }, [zplGeneratorMode, error]);


  return (
    <div className="space-y-4">
        {zplGeneratorMode === 'shiftJournal' && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3" role="alert">
                <p className="text-sm">La génération ZPL n'est disponible que pour les notes individuelles (mode 'Note AI').</p>
            </div>
        )}
        {hasError && zplGeneratorMode === 'singleNote' && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3" role="alert"><p>{error}</p></div>
        )}
        
        <div>
            <label htmlFor="dynamic-note" className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Note pour l'étiquette</label>
            <textarea
                id="dynamic-note"
                value={dynamicNote}
                onChange={(e) => setDynamicNote(e.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                placeholder="Entrez votre note ici..."
                rows={4}
                aria-label="Note for ZPL Label"
                disabled={isEffectivelyDisabled}
            />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 col-span-full">Réglages de l'étiquette</h3>
            <div className="flex items-center space-x-2">
                <label htmlFor="label-size" className="text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Taille:</label>
                <select id="label-size" value={labelSize} onChange={(e) => setLabelSize(e.target.value)} className="block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-1.5 pl-3 pr-8 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 text-sm" disabled={isEffectivelyDisabled}>
                    <option value="4x6">4 x 6 (in)</option> 
                    <option value="4x8">4 x 8 (in)</option> 
                    <option value="3x2">3 x 2 (in)</option> 
                    <option value="2.25x1.25">2.25 x 1.25 (in)</option> 
                    <option value={`${DEFAULT_LABEL_WIDTH_IN.toFixed(2)}x${DEFAULT_LABEL_HEIGHT_IN.toFixed(2)}`}>5.4cm x 3.2cm (Défaut)</option> 
                    <option value="custom">Personnalisé</option>
                </select>
            </div>
            <div className="flex items-center space-x-2">
                <label htmlFor="text-size" className="text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Taille du texte:</label>
                <select id="text-size" value={textSize} onChange={(e) => setTextSize(Number(e.target.value))} className="block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-1.5 pl-3 pr-8 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 text-sm" aria-label="Text Size" disabled={isEffectivelyDisabled}>
                    <option value="6">6</option>
                    <option value="8">8 (Défaut)</option>
                    <option value="10">10</option>
                    <option value="12">12</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                    <option value="25">25</option>
                    <option value="30">30</option>
                </select>
            </div>
            {labelSize === 'custom' && (
                <div className="flex items-center space-x-1 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Dim. Perso:</label>
                    <input type="text" value={customWidth} onChange={(e) => setCustomWidth(e.target.value)} className="block w-20 rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-1.5 px-2 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 text-sm" placeholder="Larg." aria-label="Custom width" disabled={isEffectivelyDisabled}/>
                    <span className="text-slate-400">x</span>
                    <input type="text" value={customHeight} onChange={(e) => setCustomHeight(e.target.value)} className="block w-20 rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-1.5 px-2 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 text-sm" placeholder="Haut." aria-label="Custom height" disabled={isEffectivelyDisabled}/>
                    <select value={customUnit} onChange={(e) => setCustomUnit(e.target.value as 'in' | 'cm')} className="block rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-1.5 pl-2 pr-7 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 text-sm" disabled={isEffectivelyDisabled}>
                        <option value="in">in</option>
                        <option value="cm">cm</option>
                    </select>
                </div>
            )}
            <div className="flex items-center space-x-2">
                <label htmlFor="print-quality" className="text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Qualité:</label>
                <select id="print-quality" value={printQuality} onChange={(e) => setPrintQuality(e.target.value)} className="block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-1.5 pl-3 pr-8 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 text-sm" aria-label="Text and Image Quality" disabled={isEffectivelyDisabled}>
                    <option value="6dpmm">Basse (152 dpi)</option> 
                    <option value="8dpmm">Standard (203 dpi)</option> 
                    <option value="12dpmm">Haute (300 dpi)</option> 
                    <option value="24dpmm">Ultra (600 dpi)</option>
                </select>
            </div>
            <div className="flex items-center space-x-2">
                <label htmlFor="rotation" className="text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Rotation:</label>
                <select id="rotation" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-1.5 pl-3 pr-8 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 text-sm" aria-label="Label Rotation" disabled={isEffectivelyDisabled}>
                    <option value="0">0°</option> 
                    <option value="90">90°</option> 
                    <option value="180">180°</option> 
                    <option value="270">270°</option>
                </select>
            </div>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800/60 rounded-lg shadow-inner flex items-center justify-center p-4 border border-slate-200 dark:border-slate-700 min-h-[250px] relative overflow-hidden">
            <div 
                className="p-2 bg-yellow-100 dark:bg-blue-900/50 rounded-lg shadow-lg transition-transform duration-300 ease-in-out"
                style={{ transform: `rotate(${rotation}deg)` }}
            >
                <div className="bg-white rounded-md shadow-inner flex items-center justify-center min-w-[150px] min-h-[100px] p-1">
                    {isLoading && hasDynamicNoteContent && !isEffectivelyDisabled ? (
                        <div className="flex flex-col items-center text-slate-500 dark:text-slate-400 p-8">
                        <svg className="animate-spin h-8 w-8 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span className="mt-2 text-sm">Génération de l'aperçu...</span>
                        </div>
                    ) : hasError || isEffectivelyDisabled ? (
                        <div className="text-center text-red-500 p-4 bg-red-50 dark:bg-red-900/20 rounded-md max-w-sm"><h3 className="font-bold text-sm">Échec de l'aperçu</h3><p className="text-xs mt-1">{error}</p></div>
                    ) : labelImageUrl && hasDynamicNoteContent ? (
                        <img src={labelImageUrl} alt="ZPL Label Preview" className="max-w-full max-h-full object-contain block rounded-sm" style={{ imageRendering: 'pixelated' }} />
                    ) : (
                        <div className="text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center p-8">
                            <ImageIcon className="w-12 h-12 mb-2 text-slate-300 dark:text-slate-600" />
                            <p className="font-semibold text-sm text-slate-500 dark:text-slate-400">L'aperçu de votre étiquette apparaîtra ici</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        <div className="flex gap-2 justify-end mt-4">
            <button onClick={handleDownload} disabled={isEffectivelyDisabled || !hasZplContent} className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors" aria-label="Download ZPL file">
                <DownloadIcon className="w-5 h-5" /> <span>Télécharger .zpl</span>
            </button>
            <button onClick={handlePrint} disabled={isEffectivelyDisabled || !labelImageUrl || hasError} className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors" aria-label="Print ZPL label">
                <PrintIcon className="w-5 h-5" /> <span>Imprimer</span>
            </button>
            <button onClick={handleClear} disabled={isEffectivelyDisabled || (!dynamicNote.trim() && !zplCode.trim())} className="p-2 rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title="Effacer la note et le ZPL" aria-label="Clear all content">
                <ClearIcon className="w-5 h-5" />
            </button>
        </div>
        
        <div className="mt-6">
            <details className="bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <summary className="p-3 cursor-pointer font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-t-lg">
                    Voir/Modifier le code ZPL brut
                </summary>
                <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                    <textarea id="zpl-editor" ref={editorRef} value={zplCode} onChange={(e) => setZplCode(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md font-mono text-sm text-slate-800 dark:text-slate-200 resize-y" placeholder="^XA...^XZ" rows={8} aria-label="ZPL Code Editor" disabled={isEffectivelyDisabled}/>
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Aides ZPL (Snippets)</h3>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => handleInsertSnippet('~SD20\n')} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors" title="Set print darkness (0-30)" disabled={isEffectivelyDisabled}>Noirceur (~SD)</button>
                            <button onClick={() => handleInsertSnippet('^PR6,6,6\n')} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors" title="Set print speed" disabled={isEffectivelyDisabled}>Vitesse (^PR)</button>
                            <button onClick={() => handleInsertSnippet('^FX Votre Commentaire Ici\n')} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors" disabled={isEffectivelyDisabled}>Commentaire (^FX)</button>
                        </div>
                    </div>
                </div>
            </details>
        </div>
    </div>
  );
};

export default ZplGenerator;
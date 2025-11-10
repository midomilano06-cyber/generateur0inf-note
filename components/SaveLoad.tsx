import React, { useState, useMemo, useEffect } from 'react';
import CollapsibleSection from './CollapsibleSection';
import type { SavedState } from '../types';

const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const FolderOpenIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h6.072c.56.005.918.444 1.059.998L12 12l.67 1.252a1.125 1.125 0 001.06.998h6.072M3.75 9.75L2.25 12l1.5 2.25M20.25 9.75L21.75 12l-1.5 2.25M3.75 15h6.072c.56.005.918-.444 1.059-.998L12 12l.67-1.252a1.125 1.125 0 011.06-.998h6.072" />
    </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

interface SaveLoadProps {
    savedStates: Record<string, SavedState>;
    onSave: (name: string) => void;
    onLoad: (name: string) => void;
    onDelete: (name: string) => void;
}

const SaveLoad: React.FC<SaveLoadProps> = ({ savedStates, onSave, onLoad, onDelete }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [saveName, setSaveName] = useState('');
    const [selectedName, setSelectedName] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'az'>('newest');

    const filteredAndSortedStates = useMemo(() => {
        const statesArray = Object.entries(savedStates).map(([name, data]) => ({
            name,
            ...Object(data)
        }));

        // Filter
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        const filtered = lowercasedSearchTerm
            ? statesArray.filter(state =>
                state.name.toLowerCase().includes(lowercasedSearchTerm) ||
                state.aiNote?.toLowerCase().includes(lowercasedSearchTerm) ||
                state.formState?.particularites?.toLowerCase().includes(lowercasedSearchTerm)
            )
            : statesArray;

        // Sort
        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return (b.timestamp || 0) - (a.timestamp || 0);
                case 'oldest':
                    return (a.timestamp || 0) - (b.timestamp || 0);
                case 'az':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });
    }, [savedStates, searchTerm, sortBy]);

    useEffect(() => {
        const currentSelectionExists = filteredAndSortedStates.some(s => s.name === selectedName);
        if (!currentSelectionExists && filteredAndSortedStates.length > 0) {
            setSelectedName(filteredAndSortedStates[0].name);
        } else if (filteredAndSortedStates.length === 0) {
            setSelectedName(null);
        }
    }, [filteredAndSortedStates, selectedName]);

    const handleSave = () => {
        if (saveName.trim()) {
            onSave(saveName);
            setSaveName('');
        } else {
            alert("Veuillez entrer un nom pour la sauvegarde.");
        }
    };

    const handleLoad = () => {
        if (selectedName) {
            onLoad(selectedName);
        } else {
            alert("Veuillez sélectionner une note à charger.");
        }
    };
    
    const handleDelete = () => {
        if (selectedName) {
            onDelete(selectedName);
        } else {
            alert("Veuillez sélectionner une note à supprimer.");
        }
    };

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return 'Date inconnue';
        return new Date(timestamp).toLocaleString('fr-CA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <CollapsibleSection
            title="Enregistrement / Chargement"
            isOpen={isOpen}
            onToggle={() => setIsOpen(!isOpen)}
            isFilled={Object.keys(savedStates).length > 0}
        >
            <div className="space-y-6">
                <div>
                    <h3 className="text-md font-semibold text-slate-600 dark:text-slate-400 mb-2">Enregistrer la note actuelle</h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            value={saveName}
                            onChange={(e) => setSaveName(e.target.value)}
                            placeholder="Nom de la sauvegarde..."
                            className="flex-grow p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                        />
                        <button onClick={handleSave} className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                            <SaveIcon className="w-5 h-5" />
                            <span>Enregistrer</span>
                        </button>
                    </div>
                </div>

                <div>
                    <h3 className="text-md font-semibold text-slate-600 dark:text-slate-400 mb-2">Charger / Gérer les notes</h3>
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-grow">
                                <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Rechercher par nom, mot-clé..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full p-2 pl-10 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                />
                            </div>
                            <div className="flex-shrink-0">
                                <label htmlFor="sort-by" className="sr-only">Trier par</label>
                                <select
                                    id="sort-by"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'az')}
                                    className="w-full sm:w-auto p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                >
                                    <option value="newest">Plus récent</option>
                                    <option value="oldest">Plus ancien</option>
                                    <option value="az">Alphabétique (A-Z)</option>
                                </select>
                            </div>
                        </div>

                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg max-h-60 overflow-y-auto">
                            {filteredAndSortedStates.length > 0 ? (
                                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {filteredAndSortedStates.map((state) => (
                                        <li
                                            key={state.name}
                                            onClick={() => setSelectedName(state.name)}
                                            className={`p-3 cursor-pointer transition-colors ${selectedName === state.name ? 'bg-teal-50 dark:bg-teal-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                        >
                                            <p className="font-medium text-slate-800 dark:text-slate-200">{state.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(state.timestamp)}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-slate-500 dark:text-slate-400 text-center p-6">
                                    {searchTerm ? `Aucune note trouvée pour "${searchTerm}".` : "Aucune note enregistrée."}
                                </p>
                            )}
                        </div>
                        
                        <div className="flex gap-2">
                             <button 
                                 onClick={handleLoad} 
                                 disabled={!selectedName}
                                 className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                 <FolderOpenIcon className="w-5 h-5" />
                                 <span>Charger</span>
                             </button>
                             <button 
                                 onClick={handleDelete} 
                                 disabled={!selectedName}
                                 className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                 <TrashIcon className="w-5 h-5" />
                                  <span>Supprimer</span>
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        </CollapsibleSection>
    );
};

export default SaveLoad;

import React from 'react';

const StethoscopeIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6a3 3 0 013-3h0a3 3 0 013 3v13m-6 0h6m-3-3a3 3 0 100-6 3 3 0 000 6z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19V9a2 2 0 012-2h0a2 2 0 012 2v10" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 19V9a2 2 0 00-2-2h0a2 2 0 00-2 2v10" />
    </svg>
);

const SunIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
);
  
const MoonIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
);

interface HeaderProps {
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    isOnline: boolean;
    forceOffline: boolean;
    onToggleForceOffline: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, isOnline, forceOffline, onToggleForceOffline }) => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md">
      <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <StethoscopeIcon className="w-10 h-10 text-teal-600" />
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-200">
                    Générateur de Notes d'Évolution Infirmières
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Outil d'aide à la rédaction pour les professionnels de santé</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <div 
                className="flex items-center gap-2 p-2 rounded-full"
                title={isOnline ? "Connecté" : "Hors ligne"}
            >
                <span className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                <span className={`hidden sm:inline text-sm font-medium ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {isOnline ? 'En ligne' : 'Hors ligne'}
                </span>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

            <label htmlFor="force-offline-toggle" className="flex items-center cursor-pointer" title="Forcer le mode hors ligne pour tester">
                <div className="relative">
                    <input
                        type="checkbox"
                        id="force-offline-toggle"
                        className="sr-only"
                        checked={forceOffline}
                        onChange={onToggleForceOffline}
                    />
                    <div className={`block bg-slate-300 dark:bg-slate-600 w-10 h-6 rounded-full transition-colors ${forceOffline ? 'bg-amber-500' : ''}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${forceOffline ? 'translate-x-full' : ''}`}></div>
                </div>
                <span className="ml-2 text-sm hidden lg:inline text-slate-600 dark:text-slate-400">
                    Test Hors Ligne
                </span>
            </label>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

            <button 
                onClick={onToggleTheme}
                title="Changer le thème"
                className="p-2 rounded-full hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-slate-700 dark:active:bg-slate-600 transition-colors"
                aria-label="Changer le thème"
            >
                {theme === 'light' ? 
                    <MoonIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" /> : 
                    <SunIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                }
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

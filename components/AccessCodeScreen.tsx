
import React, { useState } from 'react';

const LockIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

interface AccessCodeScreenProps {
  onAccessGranted: (code: string) => void;
  error: string | null;
  isSetupMode: boolean;
}

const AccessCodeScreen: React.FC<AccessCodeScreenProps> = ({ onAccessGranted, error, isSetupMode }) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAccessGranted(code);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-8 border border-slate-200 dark:border-slate-700">
          <div className="text-center mb-8">
             <LockIcon className="w-16 h-16 text-teal-600 dark:text-teal-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{isSetupMode ? "Créer un code d'accès" : "Accès Sécurisé"}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">{isSetupMode ? "Choisissez un code pour protéger l'accès à l'application." : "Veuillez entrer le code d'accès pour continuer."}</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="access-code" className="sr-only">Code d'accès</label>
              <input
                id="access-code"
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-center text-lg tracking-widest"
                placeholder="••••••"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSetupMode ? 'Enregistrer et Entrer' : 'Entrer'}
            </button>
          </form>
           <div className="text-center mt-6">
            <a 
              href="mailto:midomilano06@gmail.com?subject=Réinitialisation%20du%20code%20d'accès%20pour%20Générateur%20de%20Notes"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-500 hover:underline transition-colors"
            >
              Code d'accès oublié ?
            </a>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 px-4">
              Cliquer sur ce lien ouvrira votre application de messagerie pour envoyer une demande de réinitialisation manuelle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessCodeScreen;

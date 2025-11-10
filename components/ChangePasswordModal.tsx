import React, { useState } from 'react';

interface ChangePasswordModalProps {
    onClose: () => void;
    onSubmit: (passwords: { currentCode: string, newCode: string }) => { success: boolean, message: string };
}

const KeyIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-4a6 6 0 016-6h4a6 6 0 016 6z" />
    </svg>
);

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose, onSubmit }) => {
    const [currentCode, setCurrentCode] = useState('');
    const [newCode, setNewCode] = useState('');
    const [confirmCode, setConfirmCode] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (newCode !== confirmCode) {
            setError("Les nouveaux codes d'accès ne correspondent pas.");
            return;
        }

        const result = onSubmit({ currentCode, newCode });
        if (!result.success) {
            setError(result.message);
        } else {
            setSuccessMessage(result.message);
            setTimeout(() => {
                onClose();
            }, 1500);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-8 border border-slate-200 dark:border-slate-700 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="text-center mb-6">
                    <KeyIcon className="w-12 h-12 text-teal-600 dark:text-teal-500 mx-auto mb-3" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Changer le code d'accès</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="current-code" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Code actuel</label>
                        <input
                            id="current-code"
                            type="password"
                            value={currentCode}
                            onChange={(e) => setCurrentCode(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                            required
                            autoFocus
                        />
                    </div>
                    <div>
                        <label htmlFor="new-code" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nouveau code</label>
                        <input
                            id="new-code"
                            type="password"
                            value={newCode}
                            onChange={(e) => setNewCode(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm-code" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirmer le nouveau code</label>
                        <input
                            id="confirm-code"
                            type="password"
                            value={confirmCode}
                            onChange={(e) => setConfirmCode(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                            required
                        />
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    {successMessage && <p className="text-green-600 text-sm text-center">{successMessage}</p>}

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={!!successMessage}
                            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 dark:disabled:bg-slate-600"
                        >
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
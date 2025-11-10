import React from 'react';
import type { Patient } from '../types';

const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 010 7.75" />
    </svg>
);

interface PatientManagerProps {
    patients: Patient[];
    selectedPatientId: string | null;
    onSelectPatient: (id: string | null) => void;
    onManagePatients: () => void;
    selectedPatient: Patient | null;
}

const PatientManager: React.FC<PatientManagerProps> = ({ patients, selectedPatientId, onSelectPatient, onManagePatients, selectedPatient }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <UsersIcon className="w-8 h-8 text-teal-600 dark:text-teal-500" />
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">
                        Gestion des Patients
                    </h2>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                        value={selectedPatientId || ''}
                        onChange={(e) => onSelectPatient(e.target.value || null)}
                        className="w-full flex-grow p-2.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-slate-700 dark:text-slate-200"
                    >
                        <option value="">-- Sélectionner un patient --</option>
                        {patients.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name} {p.room ? `(Ch. ${p.room})` : ''}
                            </option>
                        ))}
                    </select>
                    <button 
                        onClick={onManagePatients}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                        Gérer
                    </button>
                </div>
            </div>
            {selectedPatient && (
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md border border-slate-200 dark:border-slate-700 space-y-1">
                    <p className="text-sm text-slate-700 dark:text-slate-300"><strong>Dx:</strong> {selectedPatient.diagnosis || 'Non spécifié'}</p>
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium"><strong>Allergies:</strong> {selectedPatient.allergies || 'Aucune connue'}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300"><strong>Statut:</strong> {selectedPatient.codeStatus || 'Non spécifié'}</p>
                </div>
            )}
        </div>
    );
};

export default PatientManager;
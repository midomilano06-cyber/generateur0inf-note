import React, { useState, useEffect } from 'react';
import type { Patient } from '../types';
import RadioGroup from './RadioGroup';

// Icons
const UserPlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.5 21h-1.063a12.317 12.317 0 01-4.189-2.006z" />
    </svg>
);
const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
);
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);
const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 010 7.75" />
    </svg>
);

interface PatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    patients: Patient[];
    onSave: (patient: Omit<Patient, 'id'> & { id?: string }) => void;
    onDelete: (patientId: string) => void;
}

const initialFormData = {
    name: '',
    room: '',
    gender: 'Masculin' as 'Masculin' | 'Féminin',
    allergies: '',
    diagnosis: '',
    medicalHistory: '',
    codeStatus: 'Réanimation complète' as Patient['codeStatus'],
};


const PatientModal: React.FC<PatientModalProps> = ({ isOpen, onClose, patients, onSave, onDelete }) => {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (isOpen) {
            setView('list');
            setPatientToEdit(null);
        }
    }, [isOpen]);

    const handleEditClick = (patient: Patient) => {
        setPatientToEdit(patient);
        setFormData({ 
            name: patient.name, 
            room: patient.room || '', 
            gender: patient.gender,
            allergies: patient.allergies || '',
            diagnosis: patient.diagnosis || '',
            medicalHistory: patient.medicalHistory || '',
            codeStatus: patient.codeStatus || 'Réanimation complète',
        });
        setView('form');
    };

    const handleAddClick = () => {
        setPatientToEdit(null);
        setFormData(initialFormData);
        setView('form');
    };

    const handleFormChange = (field: keyof typeof initialFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleGenderChange = (value: string) => {
        setFormData(prev => ({ ...prev, gender: value as 'Masculin' | 'Féminin' }));
    }
    
    const handleCodeStatusChange = (value: string) => {
        setFormData(prev => ({ ...prev, codeStatus: value as Patient['codeStatus'] }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name.trim() === '') {
            alert('Le nom du patient ne peut pas être vide.');
            return;
        }
        const patientData = { ...formData, id: patientToEdit?.id };
        onSave(patientData);
        setView('list');
    };
    
    if (!isOpen) return null;

    const genderOptions = [
        { value: 'Masculin', label: 'Masculin' },
        { value: 'Féminin', label: 'Féminin' },
    ];
    
    const codeStatusOptions = [
        { value: 'Réanimation complète', label: 'Réanimation complète' },
        { value: 'Ne pas réanimer (NPR)', label: 'Ne pas réanimer (NPR)' },
    ];

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700 w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                        <UsersIcon className="w-8 h-8 text-teal-600 dark:text-teal-500" />
                        {view === 'list' ? 'Liste des Patients' : patientToEdit ? 'Modifier le Patient' : 'Ajouter un Patient'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Fermer">
                        <XMarkIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                    </button>
                </div>

                {view === 'list' && (
                    <div className="flex flex-col flex-grow min-h-0">
                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg flex-grow overflow-y-auto mb-4">
                            {patients.length > 0 ? (
                                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {patients.map(p => (
                                        <li key={p.id} className="p-3 flex justify-between items-center">
                                            <div className="space-y-1">
                                                <p className="font-medium text-slate-800 dark:text-slate-200">{p.name}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {p.room ? `Ch. ${p.room} • ` : ''}{p.gender}
                                                </p>
                                                {p.diagnosis && <p className="text-xs text-slate-500 dark:text-slate-400">Dx: {p.diagnosis}</p>}
                                                {p.allergies && <p className="text-xs font-semibold text-red-500 dark:text-red-400">Allergies: {p.allergies}</p>}
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEditClick(p)} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="Modifier">
                                                    <PencilIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                                </button>
                                                <button onClick={() => onDelete(p.id)} className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" title="Supprimer">
                                                    <TrashIcon className="w-5 h-5 text-red-500" />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center p-8 text-slate-500 dark:text-slate-400">Aucun patient enregistré.</p>
                            )}
                        </div>
                        <button onClick={handleAddClick} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                            <UserPlusIcon className="w-5 h-5" />
                            Ajouter un patient
                        </button>
                    </div>
                )}

                {view === 'form' && (
                    <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-1">
                        <div>
                            <label htmlFor="patient-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom complet</label>
                            <input
                                id="patient-name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleFormChange('name', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                required
                                autoFocus
                            />
                        </div>
                        <div>
                            <label htmlFor="patient-room" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Numéro de chambre (facultatif)</label>
                            <input
                                id="patient-room"
                                type="text"
                                value={formData.room}
                                onChange={(e) => handleFormChange('room', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Genre</label>
                             <RadioGroup
                                name="patient-gender"
                                options={genderOptions}
                                selectedValue={formData.gender}
                                onChange={handleGenderChange}
                             />
                        </div>
                        <div>
                            <label htmlFor="patient-diagnosis" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Diagnostic principal</label>
                            <textarea
                                id="patient-diagnosis"
                                value={formData.diagnosis}
                                onChange={(e) => handleFormChange('diagnosis', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                placeholder="Ex: Pneumonie, Insuffisance cardiaque, Post-op..."
                            />
                        </div>
                         <div>
                            <label htmlFor="patient-allergies" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Allergies</label>
                            <textarea
                                id="patient-allergies"
                                value={formData.allergies}
                                onChange={(e) => handleFormChange('allergies', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                placeholder="Ex: Pénicilline, iode, arachides..."
                            />
                        </div>
                        <div>
                            <label htmlFor="patient-history" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Antécédents médicaux pertinents</label>
                            <textarea
                                id="patient-history"
                                value={formData.medicalHistory}
                                onChange={(e) => handleFormChange('medicalHistory', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                placeholder="Ex: Diabète type 2, HTA, AVC en 2020..."
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Statut de réanimation</label>
                             <RadioGroup
                                name="code-status"
                                options={codeStatusOptions}
                                selectedValue={formData.codeStatus || 'Réanimation complète'}
                                onChange={handleCodeStatusChange}
                             />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setView('list')}
                                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PatientModal;
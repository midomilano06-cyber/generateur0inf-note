
import React from 'react';
import type { PainState, PainField } from '../types';
import RadioGroup from './RadioGroup';
import CheckboxGroup from './CheckboxGroup';
import { painNonPharmaInterventions } from '../constants';

interface PainSectionProps {
  data: PainField[];
  painState: PainState;
  onCheckboxChange: (field: keyof Omit<PainState, 'medicament' | 'interventionsNonPharma' | 'site'>, value: string) => void;
  onRadioChange: (field: keyof Omit<PainState, 'medicament' | 'interventionsNonPharma' | 'site'>, value: string) => void;
  onSiteChange: (value: string) => void;
  onMedicamentChange: (value: string) => void;
  onNonPharmaChange: (value: string) => void;
}

const PainSection: React.FC<PainSectionProps> = ({ 
    data, 
    painState, 
    onCheckboxChange, 
    onRadioChange,
    onSiteChange,
    onMedicamentChange,
    onNonPharmaChange,
}) => {
  return (
      <div className="space-y-6">
        {data.map(field => (
          <div key={field.id}>
            <h3 className="text-md font-semibold text-slate-600 dark:text-slate-400 mb-3">
              {field.label}
            </h3>
            {field.type === 'radio' ? (
              <RadioGroup
                name={field.id}
                options={field.options}
                selectedValue={painState[field.id] as string}
                onChange={(value) => onRadioChange(field.id, value)}
              />
            ) : (
              <CheckboxGroup
                sectionId={field.id}
                options={field.options}
                selectedValues={painState[field.id] as string[]}
                onChange={(value) => onCheckboxChange(field.id, value)}
              />
            )}
            {field.id === 'r' && (
              <div className="mt-3">
                <label htmlFor="douleur-site" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Site précis de la douleur</label>
                <input
                    type="text"
                    id="douleur-site"
                    value={painState.site}
                    onChange={(e) => onSiteChange(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="Ex: Abdomen, membre inférieur droit..."
                />
              </div>
            )}
          </div>
        ))}

        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-6">
            <div>
                <label htmlFor="douleur-medicament" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Intervention pharmacologique (Médicament administré)</label>
                <input
                    type="text"
                    id="douleur-medicament"
                    value={painState.medicament}
                    onChange={(e) => onMedicamentChange(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="Ex: Morphine 5mg, Paracétamol 1g..."
                />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Interventions non pharmacologiques</h3>
              <CheckboxGroup
                sectionId="douleur_interventions_non_pharma"
                options={painNonPharmaInterventions}
                selectedValues={painState.interventionsNonPharma}
                onChange={onNonPharmaChange}
              />
            </div>
        </div>
      </div>
  );
};

export default PainSection;
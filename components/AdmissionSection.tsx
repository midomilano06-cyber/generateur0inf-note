import React from 'react';
import CollapsibleSection from './CollapsibleSection';
import CheckboxGroup from './CheckboxGroup';
import RadioGroup from './RadioGroup';
import type { FormState } from '../types';
import { 
    admissionBaseOptions,
    orientationOptions,
    autonomieOptions,
    accesVeineuxGaugeOptions,
    drainsOptions,
    sondesOptions,
    siteMembreOptions
} from '../constants';


interface AdmissionSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  isFilled: boolean;
  state: FormState;
  onChange: (field: keyof FormState, value: string | boolean | string[]) => void;
}

const AdmissionSection: React.FC<AdmissionSectionProps> = ({ isOpen, onToggle, isFilled, state, onChange }) => {

    const handleCheckboxGroupChange = (field: keyof FormState, value: string) => {
        const currentValues = state[field] as string[];
        const newValues = currentValues.includes(value) ? currentValues.filter(item => item !== value) : [...currentValues, value];
        onChange(field, newValues);
    }

  return (
    <CollapsibleSection title="Admission du Patient(e)" isOpen={isOpen} onToggle={onToggle} isFilled={isFilled}>
        <div className="space-y-6">
            <div>
                 <CheckboxGroup
                    sectionId="admission-base"
                    options={admissionBaseOptions}
                    selectedValues={state.admissionCheckboxes}
                    onChange={(value) => handleCheckboxGroupChange('admissionCheckboxes', value)}
                />
            </div>

            <div>
                <h3 className="text-md font-semibold text-slate-600 dark:text-slate-400 mb-3">Orientation</h3>
                 <CheckboxGroup
                    sectionId="orientation"
                    options={orientationOptions}
                    selectedValues={state.orientation}
                    onChange={(value) => handleCheckboxGroupChange('orientation', value)}
                />
            </div>

            <div>
                <h3 className="text-md font-semibold text-slate-600 dark:text-slate-400 mb-3">Autonomie Fonctionnelle</h3>
                <RadioGroup
                    name="autonomie"
                    options={autonomieOptions}
                    selectedValue={state.autonomie}
                    onChange={(value) => onChange('autonomie', value)}
                />
            </div>

            <div>
                <h3 className="text-md font-semibold text-slate-600 dark:text-slate-400 mb-3">Effets Personnels (inventaire)</h3>
                 <textarea
                    value={state.effetsPersonnels}
                    onChange={(e) => onChange('effetsPersonnels', e.target.value)}
                    rows={3}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="Lister les effets personnels du patient (ex: lunettes, prothèses dentaires, téléphone...)"
                />
            </div>

             <div>
                <h3 className="text-md font-semibold text-slate-600 dark:text-slate-400 mb-3">Dispositifs</h3>
                <div className="space-y-4">
                    <div className="flex flex-col">
                        <label className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer w-fit">
                             <input
                                type="checkbox"
                                checked={state.accesVeineux}
                                onChange={(e) => onChange('accesVeineux', e.target.checked)}
                                className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-slate-700 dark:text-slate-300 font-medium">Accès veineux fonctionnel (CVP)</span>
                        </label>
                        {state.accesVeineux && (
                            <div className="pl-8 mt-2 space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Calibre (Jelco)</p>
                                    <RadioGroup
                                        name="accesVeineux_gauge"
                                        options={accesVeineuxGaugeOptions}
                                        selectedValue={state.accesVeineux_gauge}
                                        onChange={(value) => onChange('accesVeineux_gauge', value)}
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Site</p>
                                    <RadioGroup
                                        name="accesVeineux_site"
                                        options={siteMembreOptions}
                                        selectedValue={state.accesVeineux_site}
                                        onChange={(value) => onChange('accesVeineux_site', value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                     <div className="flex flex-col">
                        <label className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer w-fit">
                            <input
                                type="checkbox"
                                checked={state.piccLine}
                                onChange={(e) => onChange('piccLine', e.target.checked)}
                                className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-slate-700 dark:text-slate-300 font-medium">PICC Line en place et fonctionnel</span>
                        </label>
                        {state.piccLine && (
                            <div className="pl-8 mt-2">
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Site</p>
                                <RadioGroup
                                    name="piccLine_site"
                                    options={siteMembreOptions}
                                    selectedValue={state.piccLine_site}
                                    onChange={(value) => onChange('piccLine_site', value)}
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Drains</h4>
                        <CheckboxGroup
                            sectionId="drains"
                            options={drainsOptions}
                            selectedValues={state.drains}
                            onChange={(value) => handleCheckboxGroupChange('drains', value)}
                        />
                    </div>

                     <div>
                        <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Sondes</h4>
                        <CheckboxGroup
                            sectionId="sondes"
                            options={sondesOptions}
                            selectedValues={state.sondes}
                            onChange={(value) => handleCheckboxGroupChange('sondes', value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    </CollapsibleSection>
  );
};

export default AdmissionSection;

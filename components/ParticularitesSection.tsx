import React from 'react';

interface ParticularitesSectionProps {
  value: string;
  onChange: (value: string) => void;
  addExtraSpace: boolean;
  onToggleExtraSpace: () => void;
}

const ParticularitesSection: React.FC<ParticularitesSectionProps> = ({ value, onChange, addExtraSpace, onToggleExtraSpace }) => {
  return (
    <div className="space-y-4">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
        placeholder="Ajouter une note sur un événement particulier (ex: visite du médecin, examen réalisé, réaction spécifique...)"
      />
      <label className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={addExtraSpace}
          onChange={onToggleExtraSpace}
          className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-teal-600 focus:ring-teal-500"
        />
        <span className="text-slate-700 dark:text-slate-300 font-medium">Ajouter une ligne blanche additionnelle</span>
      </label>
    </div>
  );
};

export default ParticularitesSection;
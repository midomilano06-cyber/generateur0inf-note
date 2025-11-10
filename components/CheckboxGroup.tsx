import React from 'react';
import type { Option } from '../types';

interface CheckboxGroupProps {
  sectionId: string;
  options: Option[];
  selectedValues: string[];
  onChange: (value: string) => void;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ sectionId, options, selectedValues, onChange }) => {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map(option => (
        <label key={option.value} className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
          <input
            type="checkbox"
            name={sectionId}
            value={option.value}
            checked={selectedValues.includes(option.value)}
            onChange={() => onChange(option.value)}
            className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-teal-600 focus:ring-teal-500"
          />
          <span className="text-slate-700 dark:text-slate-300">{option.label}</span>
        </label>
      ))}
    </div>
  );
};

export default CheckboxGroup;
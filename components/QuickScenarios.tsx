
import React, { useState } from 'react';
import { scenariosData } from '../constants';
import type { FormState, Scenario, ScenarioCategory } from '../types';

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 01-1.47-1.47L12.964 18l1.188-.648a2.25 2.25 0 011.47-1.47L16.25 15l.648 1.188a2.25 2.25 0 011.47 1.47L19.536 18l-1.188.648a2.25 2.25 0 01-1.47 1.47z" />
    </svg>
);

const RoutineIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 12.75h.008v.008H12v-.008z" />
  </svg>
);

const SpecificsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15" />
  </svg>
);

const AlertIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

const PalliativeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

const categoryIcons: { [key: string]: React.ElementType } = {
  'Routine & Événements': RoutineIcon,
  'Suivis Spécifiques': SpecificsIcon,
  'Alertes & Situations Aiguës': AlertIcon,
  'Soins Palliatifs': PalliativeIcon,
};

interface QuickScenariosProps {
  onScenarioSelect: (scenarioState: Partial<FormState>) => void;
}

const QuickScenarios: React.FC<QuickScenariosProps> = ({ onScenarioSelect }) => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const handleCategoryToggle = (title: string) => {
    setOpenCategory(prev => (prev === title ? null : title));
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
        <SparklesIcon className="w-6 h-6 text-teal-500" />
        Scénarios & Points de Départ
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Cliquez sur une catégorie pour voir les scénarios et accélérer la saisie de vos notes.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenariosData.map((category: ScenarioCategory) => {
          const Icon = categoryIcons[category.title] || SparklesIcon;
          const isOpen = openCategory === category.title;
          
          return (
            <div key={category.title} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300">
              <button
                onClick={() => handleCategoryToggle(category.title)}
                className="w-full flex items-center justify-between p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-t-lg"
                aria-expanded={isOpen}
              >
                <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Icon className="w-5 h-5 text-teal-600 dark:text-teal-500" />
                  {category.title}
                </h3>
                <ChevronDownIcon className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <div 
                className="grid transition-all duration-300 ease-in-out"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                    <div className="p-4 pt-0">
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex flex-col gap-2">
                        {category.scenarios.map((scenario: Scenario) => (
                          <button
                            key={scenario.label}
                            onClick={() => onScenarioSelect(scenario.state)}
                            className="w-full text-left px-3 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-teal-50 dark:hover:bg-teal-900/40 hover:border-teal-400 dark:hover:border-teal-600 transform hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-800/50 focus:ring-teal-500"
                          >
                            {scenario.label}
                          </button>
                        ))}
                      </div>
                    </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default QuickScenarios;
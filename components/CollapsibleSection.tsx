import React from 'react';

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);


interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  isFilled: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, isOpen, onToggle, isFilled }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
            <span 
                className={`w-3 h-3 rounded-full transition-colors ${isFilled ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'}`} 
                title={isFilled ? "Cette section est remplie" : "Cette section est vide"}
            ></span>
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">
                {title}
            </h2>
        </div>
        <ChevronDownIcon className={`w-6 h-6 text-slate-500 dark:text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div 
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
            <div className="p-6 pt-0 space-y-3">
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                 {children}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;

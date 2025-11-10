import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-800 mt-8 py-4 border-t border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4 lg:px-8 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>
          &copy; {new Date().getFullYear()} Outil de Génération de Notes Infirmières. Développé pour un usage professionnel.
        </p>
        <p className="mt-1">
          Cet outil est un prototype et ne stocke aucune donnée patient.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
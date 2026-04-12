import React from 'react';

export const SignLanguageLibrary: React.FC<{ language: string }> = ({ language }) => {
  return (
    <div className="glass-panel p-8 rounded-3xl">
      <h2 className="text-2xl font-bold mb-4">{language} Sign Library</h2>
      <p className="text-slate-500">Explore and learn common signs in {language}.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {/* Placeholder for library items */}
        {['A', 'B', 'C', 'D', 'HELLO', 'THANK YOU'].map(sign => (
          <div key={sign} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
            <div className="text-4xl mb-2">👋</div>
            <div className="font-bold">{sign}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

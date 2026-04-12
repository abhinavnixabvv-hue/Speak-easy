import React from 'react';
import { Siren } from 'lucide-react';

export const EmergencySigns: React.FC = () => {
  return (
    <div className="glass-panel p-8 rounded-3xl bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-red-500 rounded-2xl text-white">
          <Siren size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-100">Emergency Signs</h2>
          <p className="text-red-700 dark:text-red-300">Quick access to critical emergency communication.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {['HELP', 'MEDICAL', 'FIRE', 'POLICE'].map(sign => (
          <div key={sign} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-800 flex items-center justify-between">
            <span className="text-xl font-bold">{sign}</span>
            <div className="text-3xl">🆘</div>
          </div>
        ))}
      </div>
    </div>
  );
};

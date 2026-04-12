import React from 'react';
import { Database } from 'lucide-react';

export const LandmarkDataCollector: React.FC = () => {
  return (
    <div className="glass-panel p-8 rounded-3xl space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Database className="text-blue-600" /> Data Collector
      </h2>
      <p className="text-slate-500">Help improve the model by recording new sign landmarks.</p>
      <div className="flex gap-4">
        <button className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold">Start Recording</button>
        <button className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold">Export Data</button>
      </div>
    </div>
  );
};

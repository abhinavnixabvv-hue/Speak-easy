import React from 'react';
import { Activity } from 'lucide-react';

export const ModelInsights: React.FC = () => {
  return (
    <div className="glass-panel p-8 rounded-3xl space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Activity className="text-blue-600" /> Model Insights
      </h2>
      <div className="space-y-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="text-sm font-bold text-slate-500 uppercase mb-2">Confidence Score</div>
          <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="w-[85%] h-full bg-blue-600" />
          </div>
          <div className="text-right text-sm font-bold mt-1">85%</div>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="text-sm font-bold text-slate-500 uppercase mb-2">Processing Latency</div>
          <div className="text-2xl font-black">12ms</div>
        </div>
      </div>
    </div>
  );
};

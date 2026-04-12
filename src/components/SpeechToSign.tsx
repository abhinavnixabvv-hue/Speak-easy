import React from 'react';
import { Mic } from 'lucide-react';

export const SpeechToSign: React.FC = () => {
  return (
    <div className="glass-panel p-8 rounded-3xl text-center space-y-6">
      <h2 className="text-2xl font-bold">Speech to Sign</h2>
      <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto text-white shadow-xl">
        <Mic size={40} />
      </div>
      <p className="text-slate-500">Click the microphone and speak to see the sign translation.</p>
      <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 italic">
        Sign animation will appear here
      </div>
    </div>
  );
};

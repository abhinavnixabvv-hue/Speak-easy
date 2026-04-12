import React, { useState } from 'react';
import { Button } from "./ui/button";

export const TextToSign: React.FC = () => {
  const [text, setText] = useState('');
  return (
    <div className="glass-panel p-8 rounded-3xl space-y-6">
      <h2 className="text-2xl font-bold">Text to Sign</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something to see the sign..."
        className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <Button className="w-full py-6 rounded-2xl font-bold text-lg">Convert to Sign</Button>
      <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 italic">
        Sign animation will appear here
      </div>
    </div>
  );
};

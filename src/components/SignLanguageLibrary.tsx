import React, { useState } from 'react';
import { Search, Filter, BookOpen, PlayCircle, Info } from 'lucide-react';

interface SignItem {
  sign: string;
  emoji: string;
  description: string;
  category: 'alphabet' | 'greeting' | 'common' | 'emergency';
}

const aslSigns: SignItem[] = [
  { sign: "A", emoji: "✊", description: "Fist with thumb on side", category: "alphabet" },
  { sign: "B", emoji: "✋", description: "Flat hand, thumb across palm", category: "alphabet" },
  { sign: "C", emoji: "🤏", description: "Curved hand like a C", category: "alphabet" },
  { sign: "D", emoji: "☝️", description: "Index finger up, others touch thumb", category: "alphabet" },
  { sign: "HELLO", emoji: "👋", description: "Wave hand", category: "greeting" },
  { sign: "THANK YOU", emoji: "🙏", description: "Hand from chin to front", category: "greeting" },
  { sign: "YES", emoji: "👍", description: "Fist nodding", category: "common" },
  { sign: "NO", emoji: "👎", description: "Index and middle touch thumb", category: "common" },
  { sign: "PLEASE", emoji: "🤲", description: "Flat hand circles on chest", category: "common" },
  { sign: "SORRY", emoji: "✊", description: "Fist circles on chest", category: "common" },
  { sign: "HELP", emoji: "🆘", description: "Fist on flat palm", category: "emergency" },
  { sign: "EMERGENCY", emoji: "🚨", description: "Shaking E handshape", category: "emergency" },
];

const islSigns: SignItem[] = [
  { sign: "Namaste", emoji: "🙏", description: "Both palms together", category: "greeting" },
  { sign: "A", emoji: "✊", description: "Fist", category: "alphabet" },
  { sign: "B", emoji: "✋", description: "Flat hand", category: "alphabet" },
  { sign: "C", emoji: "🤏", description: "Curved hand", category: "alphabet" },
  { sign: "D", emoji: "☝️", description: "Index finger up", category: "alphabet" },
  { sign: "WATER", emoji: "💧", description: "Index finger at chin", category: "common" },
  { sign: "FOOD", emoji: "🍱", description: "Hand to mouth", category: "common" },
];

export const SignLanguageLibrary: React.FC<{ language: string }> = ({ language }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  
  const signs = language === 'ASL' ? aslSigns : islSigns;
  const filteredSigns = signs.filter(s => 
    (s.sign.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase())) &&
    (filter === "all" || s.category === filter)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <BookOpen className="text-indigo-600" />
            {language} Sign Library
          </h2>
          <p className="text-slate-500 font-medium">Master the art of visual communication.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search signs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">All Categories</option>
            <option value="alphabet">Alphabet</option>
            <option value="greeting">Greetings</option>
            <option value="common">Common Phrases</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredSigns.map((s, i) => (
          <div 
            key={i} 
            className="group glass-panel p-6 rounded-[32px] hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 border-2 border-transparent hover:border-indigo-500/20 flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-5xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              {s.emoji}
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{s.sign}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              {s.description}
            </p>
            <button className="mt-auto w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all">
              <PlayCircle size={16} /> View Tutorial
            </button>
          </div>
        ))}
      </div>

      {filteredSigns.length === 0 && (
        <div className="py-20 text-center space-y-4 opacity-40">
          <Search size={64} className="mx-auto text-slate-300" />
          <p className="text-xl font-bold">No signs found matching your search.</p>
        </div>
      )}

      <div className="p-8 rounded-[40px] bg-slate-900 text-white flex flex-col md:flex-row items-center gap-8 border border-slate-800">
        <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/40">
          <Info size={32} />
        </div>
        <div className="space-y-2">
          <h4 className="text-xl font-black tracking-tight">Learning Tip</h4>
          <p className="text-slate-400 leading-relaxed">
            Practice each sign in front of a mirror or use our real-time recognition tool to verify your hand placement. 
            Consistency is key to mastering sign language.
          </p>
        </div>
      </div>
    </div>
  );
};

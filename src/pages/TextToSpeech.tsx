import React, { useState, useEffect } from 'react';
import { Volume2, Play, Pause, RotateCcw, Settings as SettingsIcon, Trash2, Download } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSettings } from '../components/SettingsContext';
import { toast } from 'sonner';

export const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [searchVoice, setSearchVoice] = useState('');
  const { settings, updateSettings } = useSettings();
  const synth = window.speechSynthesis;

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        
        if (!settings.voice) {
          const defaultVoice = availableVoices.find(v => v.default) || availableVoices[0];
          updateSettings({ voice: defaultVoice.name });
        }
      }
    };

    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    // Retry loading voices after a short delay as some browsers load them asynchronously
    const timer = setTimeout(loadVoices, 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredVoices = voices.filter(v => 
    v.name.toLowerCase().includes(searchVoice.toLowerCase()) || 
    v.lang.toLowerCase().includes(searchVoice.toLowerCase())
  );

  const handleSpeak = () => {
    if (synth.speaking) {
      synth.cancel();
    }

    if (text) {
      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = voices.find(v => v.name === settings.voice);
      
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = settings.speed;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synth.speak(utterance);
    }
  };

  const handleStop = () => {
    synth.cancel();
    setIsSpeaking(false);
  };

  const handleClear = () => {
    setText('');
    handleStop();
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tight">Text to Speech</h1>
        <p className="text-slate-500 dark:text-slate-400">Convert written text into natural-sounding speech.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-8 rounded-3xl space-y-6">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here..."
              className="w-full min-h-[300px] bg-transparent border-none focus:ring-0 text-xl resize-none placeholder:text-slate-300 dark:placeholder:text-slate-700"
            />
            
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <button
                  onClick={isSpeaking ? handleStop : handleSpeak}
                  disabled={!text}
                  className={cn(
                    "flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg",
                    isSpeaking 
                      ? "bg-red-500 text-white shadow-red-500/30" 
                      : "bg-blue-600 text-white shadow-blue-500/30 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  )}
                >
                  {isSpeaking ? (
                    <>
                      <Pause size={22} fill="currentColor" /> Stop Speaking
                    </>
                  ) : (
                    <>
                      <Play size={22} fill="currentColor" /> Start Speaking
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleClear}
                  disabled={!text}
                  className="p-4 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  title="Clear text"
                >
                  <Trash2 size={22} />
                </button>
              </div>

              <div className="text-sm text-slate-400 font-medium">
                {text.length} characters
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-3xl space-y-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 font-bold text-lg">
                <SettingsIcon size={20} className="text-blue-500" /> Voice Settings
              </div>
              <button 
                onClick={() => {
                  const availableVoices = synth.getVoices();
                  setVoices(availableVoices);
                  toast.success(`Loaded ${availableVoices.length} voices`);
                }}
                className="text-xs text-blue-600 hover:underline"
              >
                Refresh Voices
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Voice</label>
                <input
                  type="text"
                  placeholder="Search voices..."
                  value={searchVoice}
                  onChange={(e) => setSearchVoice(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs mb-2"
                />
                <select
                  value={settings.voice}
                  onChange={(e) => updateSettings({ voice: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {filteredVoices.map(voice => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Speed</label>
                  <span className="text-blue-600 font-bold">{settings.speed}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.speed}
                  onChange={(e) => updateSettings({ speed: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
            <div className="flex gap-4">
              <div className="bg-blue-600 p-3 rounded-xl text-white h-fit">
                <Volume2 size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-blue-900 dark:text-blue-100">Pro Tip</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                  You can adjust the speed while speaking to find the most comfortable pace for your listening.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

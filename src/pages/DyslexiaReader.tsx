import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Play, Pause, RotateCcw, Type, AlignLeft, Sun, Moon, Accessibility, Sparkles, Loader2, Copy, Download } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSettings } from '../components/SettingsContext';
import { GoogleGenAI } from "@google/genai";
import { toast } from 'sonner';

export const DyslexiaReader: React.FC = () => {
  const [text, setText] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [mode, setMode] = useState<'edit' | 'read'>('edit');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const { settings, updateSettings } = useSettings();
  const synth = window.speechSynthesis;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const ai = React.useMemo(() => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' }), []);

  const words = text.split(/\s+/).filter(w => w.length > 0);

  const handleAISimplify = async () => {
    if (!text || text.length < 20) return;
    
    setIsSummarizing(true);
    try {
      if (!process.env.GEMINI_API_KEY) {
        toast.error('Gemini API Key is missing. Please configure it in Settings.');
        return;
      }
      const prompt = language === 'ml-IN'
        ? `Simplify the following Malayalam text for someone with dyslexia. Break it into small, easy-to-read chunks or bullet points. Use simple language but maintain the original meaning.
        Text: "${text}"
        Simplified:`
        : `Simplify the following text for someone with dyslexia. Break it into small, easy-to-read chunks or bullet points. Use simple language but maintain the original meaning.
        Text: "${text}"
        Simplified:`;

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: [{ parts: [{ text: prompt }] }],
      });
      const textResult = response.text;
      
      if (!textResult) throw new Error('Simplification failed');
      
      setText(textResult.trim());
      setMode('read');
      toast.success('Text simplified and chunked by AI');
    } catch (error) {
      console.error("Simplification failed:", error);
      toast.error('Failed to simplify text');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleStartReading = () => {
    if (synth.speaking) synth.cancel();
    
    setMode('read');
    setIsReading(true);
    setCurrentWordIndex(0);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    const voices = synth.getVoices();
    const selectedVoice = voices.find(v => v.name === settings.voice);
    
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = settings.speed;

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        const textBefore = text.substring(0, charIndex);
        const wordCount = textBefore.split(/\s+/).filter(w => w.length > 0).length;
        setCurrentWordIndex(wordCount);
      }
    };

    utterance.onend = () => {
      setIsReading(false);
      setCurrentWordIndex(-1);
    };

    utteranceRef.current = utterance;
    synth.speak(utterance);
  };

  const handleTogglePlay = () => {
    if (synth.paused) {
      synth.resume();
      setIsReading(true);
    } else if (synth.speaking) {
      synth.pause();
      setIsReading(false);
    } else {
      handleStartReading();
    }
  };

  const handleReset = () => {
    synth.cancel();
    setIsReading(false);
    setCurrentWordIndex(-1);
    if (mode === 'read') handleStartReading();
  };

  const copyText = () => {
    navigator.clipboard.writeText(text);
    toast.success('Text copied to clipboard');
  };

  const downloadText = () => {
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "reading_text.txt";
    document.body.appendChild(element);
    element.click();
    toast.success('Text downloaded');
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Dyslexia Reader</h1>
          <p className="text-slate-500 dark:text-slate-400">Accessible reading with word highlighting and custom fonts.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="en-US">English</option>
            <option value="ml-IN">Malayalam</option>
          </select>
          <button
            onClick={handleAISimplify}
            disabled={!text || text.length < 20 || isSummarizing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-all disabled:opacity-50"
          >
            {isSummarizing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            AI Simplify
          </button>
          <button
            onClick={() => setMode('edit')}
            className={cn(
              "px-4 py-2 rounded-xl font-bold transition-all",
              mode === 'edit' ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            )}
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (text) setMode('read');
            }}
            disabled={!text}
            className={cn(
              "px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-50",
              mode === 'read' ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            )}
          >
            Read
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {mode === 'edit' ? (
            <div
              className="glass-panel p-8 rounded-3xl"
            >
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste text you want to read here..."
                  className={cn(
                    "w-full min-h-[500px] bg-transparent border-none focus:ring-0 text-2xl resize-none",
                    settings.fontFamily !== 'default' && `font-${settings.fontFamily}`
                  )}
                />
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={copyText}
                      disabled={!text}
                      className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                      title="Copy text"
                    >
                      <Copy size={20} />
                    </button>
                    <button 
                      onClick={downloadText}
                      disabled={!text}
                      className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                      title="Download text"
                    >
                      <Download size={20} />
                    </button>
                  </div>
                  <button 
                    onClick={() => setText('')}
                    disabled={!text}
                    className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors disabled:opacity-50 font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="glass-panel p-12 rounded-3xl min-h-[500px]"
              >
                <div className={cn(
                  "flex flex-wrap gap-x-4 gap-y-6 text-3xl leading-[2]",
                  settings.fontFamily !== 'default' && `font-${settings.fontFamily}`
                )}>
                  {words.map((word, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: index === currentWordIndex ? '#3b82f6' : 'transparent',
                        color: index === currentWordIndex ? '#ffffff' : 'inherit',
                        transform: index === currentWordIndex ? 'scale(1.1)' : 'scale(1)',
                      }}
                      className={cn(
                        "px-2 rounded-lg transition-all duration-200",
                        index === currentWordIndex ? "shadow-lg shadow-blue-500/30" : "text-slate-700 dark:text-slate-300"
                      )}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {mode === 'read' && (
            <div className="glass-panel p-6 rounded-3xl flex items-center justify-center gap-6">
              <button
                onClick={handleReset}
                className="p-4 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw size={24} />
              </button>
              <button
                onClick={handleTogglePlay}
                className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/30 hover:scale-105 transition-transform"
              >
                {isReading ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
              </button>
              <div className="w-10" /> {/* Spacer */}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-3xl space-y-8">
            <div className="flex items-center gap-2 font-bold text-lg">
              <Accessibility size={20} className="text-blue-500" /> Reader Settings
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-bold">Reading Font</div>
                  <div className="text-xs text-slate-500">Choose a comfortable font</div>
                </div>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => updateSettings({ fontFamily: e.target.value as any })}
                  className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-2 py-1 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="default">Default</option>
                  <option value="dyslexic">OpenDyslexic</option>
                  <option value="arial">Arial</option>
                  <option value="comic">Comic Sans</option>
                  <option value="atkinson">Atkinson</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-bold">High Contrast</div>
                  <div className="text-xs text-slate-500">Enhanced readability</div>
                </div>
                <button
                  onClick={() => updateSettings({ highContrast: !settings.highContrast })}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    settings.highContrast ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200",
                      settings.highContrast ? "left-[24px]" : "left-[4px]"
                    )}
                  />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Reading Speed</label>
                  <span className="text-blue-600 font-bold">{settings.speed}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={settings.speed}
                  onChange={(e) => updateSettings({ speed: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30">
            <div className="flex gap-4">
              <div className="bg-emerald-600 p-3 rounded-xl text-white h-fit">
                <Type size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-100">Why this helps</h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed">
                  OpenDyslexic uses weighted bottoms to help prevent letters from rotating or flipping in the mind.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

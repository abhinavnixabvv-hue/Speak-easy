import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, RotateCcw, Copy, Download, Trash2, Languages, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";
import { toast } from 'sonner';

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish (Spain)' },
  { code: 'es-MX', name: 'Spanish (Mexico)' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'ru-RU', name: 'Russian' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'zh-CN', name: 'Chinese (Mandarin)' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'ar-SA', name: 'Arabic' },
  { code: 'tr-TR', name: 'Turkish' },
  { code: 'nl-NL', name: 'Dutch' },
  { code: 'pl-PL', name: 'Polish' },
  { code: 'vi-VN', name: 'Vietnamese' },
  { code: 'th-TH', name: 'Thai' },
  { code: 'ml-IN', name: 'Malayalam' },
];

export const SpeechToText: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState(() => {
    return localStorage.getItem('speakeasy-stt-current') || '';
  });
  const [interimTranscript, setInterimTranscript] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [isPolishing, setIsPolishing] = useState(false);
  const [history, setHistory] = useState<{ text: string; date: string }[]>(() => {
    const saved = localStorage.getItem('speakeasy-stt-history');
    return saved ? JSON.parse(saved) : [];
  });
  const recognitionRef = useRef<any>(null);

  const ai = React.useMemo(() => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' }), []);

  const handlePolish = async () => {
    if (!transcript || isPolishing) return;
    setIsPolishing(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Please fix the punctuation, grammar, and capitalization of the following transcript. Maintain the original meaning and language.
        Transcript: "${transcript}"
        Polished:`,
      });

      if (!response.text) throw new Error('Failed to polish transcript');
      setTranscript(response.text.trim());
      toast.success('Transcript polished by AI');
    } catch (error) {
      console.error('Polish Error:', error);
      toast.error('Failed to polish transcript');
    } finally {
      setIsPolishing(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('speakeasy-stt-history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('speakeasy-stt-current', transcript);
  }, [transcript]);

  const addToHistory = (text: string) => {
    if (!text.trim()) return;
    setHistory(prev => [{ text, date: new Date().toLocaleString() }, ...prev].slice(0, 10));
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          setTranscript(prev => prev + ' ' + final);
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          // Quietly handle no-speech, it just means the user was silent
          setIsListening(false);
          return;
        }
        if (event.error === 'aborted') {
          // Aborted usually means it was stopped manually or by a conflict
          setIsListening(false);
          return;
        }
        console.error('Speech recognition error', event.error);
        toast.error(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        // Only restart if we're still supposed to be listening
        // and the recognition wasn't stopped by the cleanup function
        if (isListening && recognitionRef.current === recognition) {
          try {
            recognition.start();
          } catch (err) {
            console.error('Failed to restart recognition:', err);
          }
        }
      };

      recognitionRef.current = recognition;

      if (isListening) {
        try {
          recognition.start();
        } catch (err) {
          console.error('Failed to start recognition:', err);
          setIsListening(false);
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, isListening]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInterimTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const clearTranscript = () => {
    if (transcript.trim()) {
      addToHistory(transcript);
    }
    setTranscript('');
    setInterimTranscript('');
  };

  const saveToHistory = () => {
    if (transcript.trim()) {
      addToHistory(transcript);
      toast.success('Transcript saved to history');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcript);
    toast.success('Transcript copied to clipboard');
  };

  const downloadTranscript = () => {
    const element = document.createElement("a");
    const file = new Blob([transcript], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "transcript.txt";
    document.body.appendChild(element);
    element.click();
    toast.success('Transcript downloaded');
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Speech to Text</h1>
          <p className="text-slate-500 dark:text-slate-400">Convert spoken words into real-time text.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
            <Languages size={18} className="text-slate-400" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-medium"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel min-h-[400px] p-8 rounded-3xl relative flex flex-col">
            <div className="flex-1 text-xl leading-relaxed whitespace-pre-wrap">
              {transcript}
              <span className="text-slate-400 dark:text-slate-600 italic">
                {interimTranscript}
              </span>
              {!transcript && !interimTranscript && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center space-y-4">
                  <Mic size={48} className="opacity-20" />
                  <p>Your transcript will appear here as you speak...</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button 
                  onClick={copyToClipboard}
                  disabled={!transcript}
                  className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  title="Copy to clipboard"
                >
                  <Copy size={20} />
                </button>
                <button 
                  onClick={downloadTranscript}
                  disabled={!transcript}
                  className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  title="Download as TXT"
                >
                  <Download size={20} />
                </button>
                <button 
                  onClick={handlePolish}
                  disabled={!transcript || isPolishing}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold hover:bg-indigo-200 transition-all disabled:opacity-50"
                >
                  {isPolishing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  AI Polish
                </button>
                <button 
                  onClick={saveToHistory}
                  disabled={!transcript}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold hover:bg-emerald-200 transition-all disabled:opacity-50"
                >
                  Save
                </button>
              </div>

              <button 
                onClick={clearTranscript}
                disabled={!transcript && !interimTranscript}
                className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors disabled:opacity-50 font-medium"
              >
                <Trash2 size={18} /> Clear
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-3xl text-center space-y-6">
            <div className="relative inline-block">
              {isListening && (
                <div
                  className="absolute inset-0 bg-blue-500 rounded-full opacity-20 scale-150"
                />
              )}
              <button
                onClick={toggleListening}
                className={cn(
                  "relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
                  isListening 
                    ? "bg-red-500 text-white shadow-red-500/40" 
                    : "bg-blue-600 text-white shadow-blue-500/40 hover:scale-105"
                )}
              >
                {isListening ? <MicOff size={40} /> : <Mic size={40} />}
              </button>
            </div>
            
            <div>
              <h3 className="text-xl font-bold">{isListening ? 'Listening...' : 'Ready to Listen'}</h3>
              <p className="text-slate-500 text-sm mt-1">
                {isListening ? 'Speak clearly into your microphone' : 'Click the button to start transcribing'}
              </p>
            </div>

            <div className="h-8 flex items-center justify-center">
              {isListening && (
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className="w-1 bg-blue-500 rounded-full h-4 animate-pulse"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {history.length > 0 && (
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h4 className="font-bold flex items-center gap-2">
                <RotateCcw size={18} className="text-blue-500" /> Recent History
              </h4>
              <div className="space-y-3">
                {history.map((item, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm border border-slate-100 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] mb-1">{item.date}</div>
                    <p className="line-clamp-2">{item.text}</p>
                    <button 
                      onClick={() => setTranscript(prev => prev + ' ' + item.text)}
                      className="text-blue-600 text-xs font-bold mt-2 hover:underline"
                    >
                      Restore
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => setHistory([])}
                  className="text-slate-400 text-xs w-full text-center hover:text-red-500 transition-colors"
                >
                  Clear History
                </button>
              </div>
            </div>
          )}

          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h4 className="font-bold flex items-center gap-2">
              <RotateCcw size={18} className="text-blue-500" /> Tips for better results
            </h4>
            <ul className="text-sm text-slate-500 space-y-2 list-disc pl-4">
              <li>Use a quiet environment</li>
              <li>Speak at a natural pace</li>
              <li>Ensure your microphone is correctly positioned</li>
              <li>Check your internet connection for better accuracy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

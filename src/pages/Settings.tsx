import React from 'react';
import { Settings as SettingsIcon, Sun, Moon, Accessibility, Volume2, Info, Github } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSettings } from '../components/SettingsContext';

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-4xl font-black tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Customize SpeakEasy to fit your needs.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-6">
          <div className="glass-panel p-8 rounded-3xl space-y-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sun size={22} className="text-orange-500" /> Appearance
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-bold">Theme</div>
                  <div className="text-sm text-slate-500">Switch between light and dark mode</div>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => updateSettings({ theme: 'light' })}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      settings.theme === 'light' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                    )}
                  >
                    <Sun size={20} />
                  </button>
                  <button
                    onClick={() => updateSettings({ theme: 'dark' })}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      settings.theme === 'dark' ? "bg-slate-700 text-blue-400 shadow-sm" : "text-slate-500"
                    )}
                  >
                    <Moon size={20} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-bold">High Contrast</div>
                  <div className="text-sm text-slate-500">Increase contrast for better visibility</div>
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
                      "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                      settings.highContrast ? "left-[24px]" : "left-[4px]"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl space-y-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Accessibility size={22} className="text-emerald-500" /> Accessibility
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-bold">Reading Font</div>
                  <div className="text-sm text-slate-500">Choose a font for better readability</div>
                </div>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => updateSettings({ fontFamily: e.target.value as any })}
                  className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="default">Default (Inter)</option>
                  <option value="dyslexic">OpenDyslexic</option>
                  <option value="arial">Arial</option>
                  <option value="comic">Comic Sans</option>
                  <option value="atkinson">Atkinson Hyperlegible</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="glass-panel p-8 rounded-3xl space-y-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Volume2 size={22} className="text-blue-500" /> Voice & Audio
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Default Voice Speed</label>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Slow</span>
                  <span className="text-blue-600 font-bold">{settings.speed}x</span>
                  <span className="text-sm font-medium">Fast</span>
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
                <button
                  onClick={() => {
                    const utterance = new SpeechSynthesisUtterance("Audio test successful. SpeakEasy is ready.");
                    utterance.rate = settings.speed;
                    window.speechSynthesis.speak(utterance);
                  }}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                  Test Voice Output
                </button>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Info size={22} className="text-slate-500" /> About SpeakEasy
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              SpeakEasy is an open-source accessibility platform built to empower individuals with communication disabilities. 
              Our mission is to make technology more inclusive through the power of AI.
            </p>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Version 1.0.0</span>
              <a 
                href="#" 
                className="flex items-center gap-2 text-blue-600 font-bold hover:underline"
              >
                <Github size={18} /> Source Code
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

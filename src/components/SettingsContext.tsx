import React, { createContext, useContext, useEffect, useState } from 'react';

interface Settings {
  theme: 'light' | 'dark';
  voice: string;
  speed: number;
  fontFamily: 'default' | 'dyslexic' | 'arial' | 'comic' | 'atkinson';
  highContrast: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('speakeasy-settings');
    return saved ? JSON.parse(saved) : {
      theme: 'light',
      voice: '',
      speed: 1,
      fontFamily: 'default',
      highContrast: false,
    };
  });

  useEffect(() => {
    localStorage.setItem('speakeasy-settings', JSON.stringify(settings));
    
    // Apply theme
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply font family
    const fontClasses = ['dyslexic-font', 'font-arial', 'font-comic', 'font-atkinson'];
    document.body.classList.remove(...fontClasses);
    
    if (settings.fontFamily === 'dyslexic') document.body.classList.add('dyslexic-font');
    if (settings.fontFamily === 'arial') document.body.classList.add('font-arial');
    if (settings.fontFamily === 'comic') document.body.classList.add('font-comic');
    if (settings.fontFamily === 'atkinson') document.body.classList.add('font-atkinson');

    // Apply high contrast
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};

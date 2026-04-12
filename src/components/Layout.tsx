import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Hand, 
  Mic, 
  Volume2, 
  BookOpen, 
  Settings as SettingsIcon,
  Menu,
  X,
  Accessibility,
  Sun,
  Moon,
  MessageSquare,
  Eye
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSettings } from './SettingsContext';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/sign-to-speech', label: 'Sign to Speech', icon: Hand },
  { path: '/speech-to-text', label: 'Speech to Text', icon: Mic },
  { path: '/text-to-speech', label: 'Text to Speech', icon: Volume2 },
  { path: '/dyslexia-reader', label: 'Dyslexia Reader', icon: BookOpen },
  { path: '/ai-chat', label: 'AI Chat Assistant', icon: MessageSquare },
  { path: '/vision-assistance', label: 'Vision Assistance', icon: Eye },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const { settings, updateSettings } = useSettings();

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Top Navbar */}
      <header className="sticky top-0 z-[60] glass-panel border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:flex p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30">
              <Accessibility size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">Speak Easy</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
            aria-label="Toggle theme"
          >
            {settings.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link 
            to="/sign-to-speech" 
            className="hidden md:flex px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:flex glass-panel h-full flex-col z-50 border-r border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-[280px] opacity-100' : 'w-0 opacity-0'}`}
        >
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  )}
                >
                  <Icon size={22} className={cn(isActive ? "text-white" : "group-hover:text-indigo-500")} />
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <>
            <div
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[70] md:hidden"
            />
            <div
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white dark:bg-slate-900 z-[80] md:hidden shadow-2xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600 p-2 rounded-xl text-white">
                    <Accessibility size={24} />
                  </div>
                  <span className="font-bold text-xl">Speak Easy</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                  <X size={24} />
                </button>
              </div>

                <nav className="flex-1 space-y-2">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-2xl transition-all",
                          isActive 
                            ? "bg-indigo-600 text-white shadow-lg" 
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                        )}
                      >
                        <Icon size={24} />
                        <span className="font-bold text-lg">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </>
          )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};


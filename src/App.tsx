/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './components/SettingsContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { SignToSpeech } from './pages/SignToSpeech';
import { SpeechToText } from './pages/SpeechToText';
import { TextToSpeech } from './pages/TextToSpeech';
import { DyslexiaReader } from './pages/DyslexiaReader';
import { AIChat } from './pages/AIChat';
import { VisionAssistance } from './pages/VisionAssistance';
import { Settings } from './pages/Settings';

import { Toaster } from 'sonner';

export default function App() {
  return (
    <SettingsProvider>
      <Router>
        <Layout>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sign-to-speech" element={<SignToSpeech />} />
            <Route path="/speech-to-text" element={<SpeechToText />} />
            <Route path="/text-to-speech" element={<TextToSpeech />} />
            <Route path="/dyslexia-reader" element={<DyslexiaReader />} />
            <Route path="/ai-chat" element={<AIChat />} />
            <Route path="/vision-assistance" element={<VisionAssistance />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </SettingsProvider>
  );
}


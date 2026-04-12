import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User, Bot, Loader2, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { GoogleGenAI } from "@google/genai";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isPolished?: boolean;
}

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your Smart Communication Helper. Type a simple phrase, and I'll help you turn it into a polite, complete sentence.",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const prompt = language === 'ml-IN'
        ? `Convert the following simple or fragmented input into a polite, complete, and natural-sounding sentence in Malayalam for someone with a communication disability. 
        Input: "${input}"
        Output:`
        : `Convert the following simple or fragmented input into a polite, complete, and natural-sounding sentence for someone with a communication disability. 
        Input: "${input}"
        Output:`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      if (!response.text) throw new Error('Failed to polish sentence');

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text.trim(),
        sender: 'ai',
        timestamp: new Date(),
        isPolished: true,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      toast.error('Failed to get AI response. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="p-6 bg-indigo-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Smart Communication Helper</h2>
            <p className="text-indigo-100 text-sm">AI-powered sentence polisher</p>
          </div>
        </div>
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs font-medium focus:ring-0 outline-none"
        >
          <option value="en-US" className="text-slate-900">English</option>
          <option value="ml-IN" className="text-slate-900">Malayalam</option>
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  message.sender === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {message.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm relative group ${
                  message.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none'
                }`}>
                  <p className="leading-relaxed">{message.text}</p>
                  {message.isPolished && (
                    <button 
                      onClick={() => speak(message.text)}
                      className="absolute -right-12 top-1/2 -translate-y-1/2 p-2 bg-white dark:bg-slate-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600"
                      title="Speak aloud"
                    >
                      <Volume2 size={18} />
                    </button>
                  )}
                  <span className="text-[10px] opacity-50 mt-2 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex gap-3 items-center bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none">
              <Loader2 size={18} className="animate-spin text-indigo-600" />
              <span className="text-sm text-slate-500">AI is thinking...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a simple phrase (e.g., 'want water')..."
            className="flex-1 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
          >
            <Send size={24} />
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-3 text-center">
          Tip: Enter short phrases and SpeakEasy will help you form complete, polite sentences.
        </p>
      </div>
    </div>
  );
};

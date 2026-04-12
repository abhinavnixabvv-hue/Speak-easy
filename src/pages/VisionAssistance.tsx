import React, { useRef, useState, useEffect } from 'react';
import { Camera, Eye, Loader2, Volume2, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';

export const VisionAssistance: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('en-US');

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const startCamera = async () => {
    try {
      const constraints = {
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Explicitly call play to ensure it starts
        await videoRef.current.play();
        setIsCameraActive(true);
        setError(null);
      }
    } catch (err) {
      console.error('Camera Error:', err);
      // Fallback to any available camera if environment fails
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsCameraActive(true);
          setError(null);
        }
      } catch (fallbackErr) {
        setError('Could not access camera. Please ensure you have granted permissions and are using HTTPS.');
        toast.error('Camera access denied');
      }
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsCameraActive(false);
  };

  const analyzeScene = async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;

    setIsAnalyzing(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      const base64Data = imageData.split(',')[1];
      
      try {
        const prompt = language === 'ml-IN' 
          ? "നിങ്ങൾ ഒരു കാഴ്ചപരിമിതിയുള്ള വ്യക്തിയെ സഹായിക്കുകയാണ്. ഈ ചിത്രത്തിലുള്ള കാര്യങ്ങൾ വളരെ വ്യക്തമായും ലളിതമായും മലയാളത്തിൽ വിവരിക്കുക. പ്രധാനപ്പെട്ട വസ്തുക്കൾ, അവയുടെ സ്ഥാനം, ചുറ്റുപാട് എന്നിവയെക്കുറിച്ച് പറയുക. വിവരണം 3 വാചകങ്ങളിൽ കൂടരുത്."
          : "You are assisting a visually impaired person. Describe the scene in front of them with high precision. Identify key objects, their relative positions (left, right, center, foreground, background), and any potential obstacles or important context. Be concise but descriptive. Keep it under 3 sentences.";

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: {
            parts: [
              { text: prompt },
              { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
            ]
          }
        });

        if (!response.text) throw new Error('Failed to analyze scene');

        setDescription(response.text.trim());
        speak(response.text.trim());
      } catch (err) {
        console.error('Analysis Error:', err);
        toast.error('Failed to analyze scene');
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const speak = (text: string) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
          <Eye size={18} /> Vision Assistance
        </div>
        <h1 className="text-4xl font-black tracking-tight">What's in front of me?</h1>
        <div className="flex justify-center mt-4">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium"
          >
            <option value="en-US">English (US)</option>
            <option value="ml-IN">Malayalam</option>
          </select>
        </div>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Use your camera to identify objects and describe your surroundings. 
          Designed to help visually impaired users navigate their environment.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Camera Feed */}
        <div className="relative aspect-video bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              "w-full h-full object-cover bg-black transition-opacity duration-500",
              isCameraActive ? "opacity-100" : "opacity-0"
            )}
          />
          
          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4">
              <div className="p-6 bg-white/10 rounded-full backdrop-blur-md">
                <Camera size={48} />
              </div>
              <button
                onClick={startCamera}
                className="px-8 py-4 bg-indigo-600 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
              >
                Start Camera
              </button>
              {error && (
                <div className="flex items-center gap-2 text-rose-400 text-sm mt-4">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
            </div>
          )}

          {isCameraActive && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
              <button
                onClick={analyzeScene}
                disabled={isAnalyzing}
                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 className="animate-spin" /> : <Eye />}
                {isAnalyzing ? 'Analyzing...' : 'Describe Scene'}
              </button>
              <button
                onClick={stopCamera}
                className="p-4 bg-white/10 backdrop-blur-md text-white rounded-2xl hover:bg-white/20 transition-all"
              >
                <RefreshCw size={24} />
              </button>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-[32px] h-full flex flex-col">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Volume2 className="text-indigo-600" /> AI Description
            </h3>
            
            <div className="flex-1 flex flex-col justify-center text-center space-y-6">
              {description ? (
                <div className="space-y-6">
                  <p className="text-2xl font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                    "{description}"
                  </p>
                  <button
                    onClick={() => speak(description)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold hover:bg-indigo-200 transition-all"
                  >
                    <Volume2 size={20} /> Repeat Audio
                  </button>
                </div>
              ) : (
                <div className="text-slate-400 space-y-4">
                  <Eye size={64} className="mx-auto opacity-20" />
                  <p>Point your camera at something and click "Describe Scene" to get an AI-powered description.</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                AI Vision Engine Active
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

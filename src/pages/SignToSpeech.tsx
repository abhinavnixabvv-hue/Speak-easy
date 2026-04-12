import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Camera, CameraOff, Info, Hand, Loader2, Trash2, BookOpen, Siren, Activity, Database, Type } from "lucide-react";
import { Button } from "../components/ui/button";
import { useHandLandmarker } from "../hooks/useHandLandmarker";
import { usePoseLandmarker } from "../hooks/usePoseLandmarker";
import { classifyGesture, classifyTwoHandGesture, type GestureResult } from "../lib/gestureClassifier";
import { HandLandmarkCanvas } from "../components/HandLandmarkCanvas";
import { SignLanguageLibrary } from "../components/SignLanguageLibrary";
import { EmergencySigns } from "../components/EmergencySigns";
import { ModelInsights } from "../components/ModelInsights";
import { LandmarkDataCollector } from "../components/LandmarkDataCollector";
import { LandmarkSmoother } from "../lib/smoothing";
import { KNNClassifier } from "../lib/knnClassifier";
import { customTrainingData } from "../lib/customData";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { Link } from "react-router-dom";

type SignLanguage = 'ASL' | 'ISL';

const aslSigns = [
  { sign: "A", emoji: "✊", description: "Fist with thumb on side", category: "alphabet" },
  { sign: "B", emoji: "✋", description: "Flat hand, thumb across palm", category: "alphabet" },
  { sign: "C", emoji: "🤏", description: "Curved hand like a C", category: "alphabet" },
  { sign: "D", emoji: "☝️", description: "Index finger up, others touch thumb", category: "alphabet" },
  { sign: "HELLO", emoji: "👋", description: "Wave hand", category: "greeting" },
  { sign: "THANK YOU", emoji: "🙏", description: "Hand from chin to front", category: "greeting" },
  { sign: "YES", emoji: "👍", description: "Fist nodding", category: "response" },
  { sign: "NO", emoji: "👎", description: "Index and middle touch thumb", category: "response" },
];

const islSigns = [
  { sign: "Namaste", emoji: "🙏", description: "Both palms together", category: "greeting" },
  { sign: "A", emoji: "✊", description: "Fist", category: "alphabet" },
  { sign: "B", emoji: "✋", description: "Flat hand", category: "alphabet" },
  { sign: "C", emoji: "🤏", description: "Curved hand", category: "alphabet" },
  { sign: "D", emoji: "☝️", description: "Index finger up", category: "alphabet" },
];

export const SignToSpeech: React.FC = () => {
  const [language, setLanguage] = useState<SignLanguage>('ASL');
  const [activeTab, setActiveTab] = useState<'recognition' | 'library' | 'emergency' | 'insights' | 'collector'>('recognition');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [currentSign, setCurrentSign] = useState<GestureResult | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [recognitionLog, setRecognitionLog] = useState<{sign: string, emoji: string, timestamp: string}[]>([]);
  const [handLandmarks, setHandLandmarks] = useState<NormalizedLandmark[][]>([]);
  const [poseLandmarks, setPoseLandmarks] = useState<any>(null);
  const [typedText, setTypedText] = useState("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastMediaPipeTimestampRef = useRef<number>(-1);
  const animFrameRef = useRef<number>(0);
  const smootherRef = useRef(new LandmarkSmoother(5));
  const knnRef = useRef<KNNClassifier>(new KNNClassifier(customTrainingData));

  const { initModel: initHandModel, detect: detectHands, isModelLoading: isHandModelLoading, isModelReady: isHandModelReady } = useHandLandmarker();
  const { initModel: initPoseModel, detect: detectPose, isModelLoading: isPoseModelLoading, isModelReady: isPoseModelReady } = usePoseLandmarker();

  const toggleCamera = async () => {
    if (isCameraOn) {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsCameraOn(false);
      cancelAnimationFrame(animFrameRef.current);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraOn(true);
          await initHandModel();
          await initPoseModel();
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }
  };

  const runDetectionLoop = useCallback(() => {
    if (!videoRef.current || !isCameraOn) return;

    const video = videoRef.current;
    if (video.readyState >= 2) {
      let timestamp = Math.max(1, performance.now());
      if (timestamp <= lastMediaPipeTimestampRef.current) {
        timestamp = lastMediaPipeTimestampRef.current + 1;
      }
      lastMediaPipeTimestampRef.current = timestamp;

      const handResult = detectHands(video);
      const poseResult = detectPose(video, timestamp);

      if (handResult && handResult.landmarks) {
        const smoothedLandmarks = handResult.landmarks.map(hand => smootherRef.current.add(hand));
        setHandLandmarks(smoothedLandmarks);
        
        const gestures = smoothedLandmarks.map(landmarks => classifyGesture(landmarks, language, poseLandmarks));
        const validGestures = gestures.filter((g): g is GestureResult => g !== null);
        
        if (validGestures.length > 0) {
          const topGesture = validGestures[0];
          setCurrentSign(topGesture);
          setConfidence(0.95);
          
          // Gesture typing logic
          if (topGesture.name === "Thumbs Up / YES" || topGesture.name === "Thumbs Up") {
             // Backspace logic could go here
          }
        } else {
          setCurrentSign(null);
          setConfidence(0);
        }
      }

      if (poseResult && poseResult.landmarks) {
        setPoseLandmarks(poseResult.landmarks);
      }
    }

    animFrameRef.current = requestAnimationFrame(runDetectionLoop);
  }, [isCameraOn, detectHands, detectPose, language, poseLandmarks, initHandModel, initPoseModel]);

  useEffect(() => {
    if (isCameraOn) {
      animFrameRef.current = requestAnimationFrame(runDetectionLoop);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isCameraOn, runDetectionLoop]);

  const commonSigns = language === 'ASL' ? aslSigns : islSigns;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft size={20} /> Back to Home
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button 
              variant={activeTab === 'recognition' ? 'default' : 'ghost'} 
              onClick={() => setActiveTab('recognition')}
              className="gap-2"
            >
              <Camera size={18} /> Recognition
            </Button>
            <Button 
              variant={activeTab === 'library' ? 'default' : 'ghost'} 
              onClick={() => setActiveTab('library')}
              className="gap-2"
            >
              <BookOpen size={18} /> Library
            </Button>
            <Button 
              variant={activeTab === 'emergency' ? 'default' : 'ghost'} 
              onClick={() => setActiveTab('emergency')}
              className="gap-2"
            >
              <Siren size={18} /> Emergency
            </Button>
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Sign to Speech <span className="text-blue-600">Bridge</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Real-time AI recognition of ASL and ISL gestures. Bridge the communication gap instantly.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          {['ASL', 'ISL'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang as SignLanguage)}
              className={`px-8 py-3 rounded-2xl font-bold transition-all ${
                language === lang 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {activeTab === 'recognition' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="relative aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <HandLandmarkCanvas 
                  landmarks={handLandmarks} 
                  width={videoRef.current?.videoWidth || 640} 
                  height={videoRef.current?.videoHeight || 480} 
                />
                
                {!isCameraOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white p-8 text-center">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                      <CameraOff size={40} className="text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Camera is Off</h3>
                    <Button size="lg" onClick={toggleCamera} className="gap-2">
                      <Camera size={20} /> Start Camera
                    </Button>
                  </div>
                )}
              </div>

              <div className="glass-panel p-8 rounded-3xl shadow-xl border-2 border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                      <Activity size={20} />
                    </div>
                    <h3 className="font-bold text-lg">Live Recognition</h3>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-10 text-center">
                  {currentSign ? (
                    <div className="space-y-4">
                      <div className="text-8xl mb-2 drop-shadow-xl">{currentSign.emoji}</div>
                      <div className="text-5xl font-black text-blue-600 tracking-tighter uppercase">{currentSign.name}</div>
                      <div className="px-4 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full text-sm font-bold">
                        {Math.round(confidence * 100)}% Confidence
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 opacity-40">
                      <Hand size={64} className="mx-auto text-slate-300 animate-pulse" />
                      <p className="text-lg font-medium">Waiting for signs...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl shadow-lg">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <BookOpen size={18} className="text-blue-600" />
                  Supported Gestures
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {commonSigns.map((s, i) => (
                    <div key={i} className="flex flex-col items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                      <span className="text-2xl">{s.emoji}</span>
                      <span className="text-xs font-bold mt-1">{s.sign}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <SignLanguageLibrary language={language} />
        )}

        {activeTab === 'emergency' && (
          <EmergencySigns />
        )}
      </div>
    </div>
  );
};

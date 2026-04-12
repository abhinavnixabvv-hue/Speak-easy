import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Camera, CameraOff, Info, Hand, Loader2, Trash2, BookOpen, Type, Siren, Activity, Database, Mic } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useHandLandmarker } from "@/src/hooks/useHandLandmarker";
import { usePoseLandmarker } from "@/src/hooks/usePoseLandmarker";
import { classifyGesture, classifyTwoHandGesture, type GestureResult } from "@/src/lib/gestureClassifier";
import { HandLandmarkCanvas } from "@/src/components/HandLandmarkCanvas";
import { SignLanguageLibrary } from "@/src/components/SignLanguageLibrary";
import { TextToSign } from "@/src/components/TextToSign";
import { SpeechToSign } from "@/src/components/SpeechToSign";
import { EmergencySigns } from "@/src/components/EmergencySigns";
import { ModelInsights } from "@/src/components/ModelInsights";
import { LandmarkDataCollector } from "@/src/components/LandmarkDataCollector";
import { LandmarkSmoother } from "@/src/lib/smoothing";
import { KNNClassifier } from "@/src/lib/knnClassifier";
import { customTrainingData } from "@/src/lib/customData";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

type SignLanguage = 'ASL' | 'ISL';

type SignTab = "camera" | "library" | "textToSign" | "speechToSign" | "emergency" | "insights" | "collector";

interface SignLanguageRecognitionProps {
  onBack?: () => void;
}

const aslSigns = [
  { sign: "A", emoji: "✊", description: "Fist, thumb on side", category: "alphabet" },
  { sign: "B", emoji: "✋", description: "Open hand, fingers together", category: "alphabet" },
  { sign: "C", emoji: "🤏", description: "Curved hand like a C", category: "alphabet" },
  { sign: "D", emoji: "☝️", description: "Index finger up, others touch thumb", category: "alphabet" },
  { sign: "E", emoji: "✊", description: "Fist, fingers curled over thumb", category: "alphabet" },
  { sign: "F", emoji: "👌", description: "OK sign, thumb and index touch", category: "alphabet" },
  { sign: "G", emoji: "🤏", description: "Index and thumb pointing forward", category: "alphabet" },
  { sign: "H", emoji: "✌️", description: "Index and middle pointing forward", category: "alphabet" },
  { sign: "I", emoji: "☝️", description: "Pinky finger up", category: "alphabet" },
  { sign: "K", emoji: "✌️", description: "Index and middle up, thumb touches middle", category: "alphabet" },
  { sign: "L", emoji: "☝️", description: "L shape with thumb and index", category: "alphabet" },
  { sign: "M", emoji: "✊", description: "Thumb under three fingers", category: "alphabet" },
  { sign: "N", emoji: "✊", description: "Thumb under two fingers", category: "alphabet" },
  { sign: "O", emoji: "👌", description: "Circle with all fingers and thumb", category: "alphabet" },
  { sign: "P", emoji: "✌️", description: "K sign pointing downwards", category: "alphabet" },
  { sign: "Q", emoji: "🤏", description: "G sign pointing downwards", category: "alphabet" },
  { sign: "R", emoji: "🤞", description: "Index and middle crossed", category: "alphabet" },
  { sign: "S", emoji: "✊", description: "Fist, thumb over fingers", category: "alphabet" },
  { sign: "T", emoji: "✊", description: "Thumb under index finger", category: "alphabet" },
  { sign: "U", emoji: "✌️", description: "Index and middle up and together", category: "alphabet" },
  { sign: "V", emoji: "✌️", description: "Index and middle up and apart", category: "alphabet" },
  { sign: "W", emoji: "✋", description: "Index, middle, and ring fingers up", category: "alphabet" },
  { sign: "X", emoji: "☝️", description: "Index finger hooked", category: "alphabet" },
  { sign: "Y", emoji: "🤙", description: "Thumb and pinky extended", category: "alphabet" },
  { sign: "HELP", emoji: "🆘", description: "Thumb up with middle finger extended", category: "emergency" },
  { sign: "HELLO", emoji: "👋", description: "Open hand, all fingers extended", category: "greeting" },
  { sign: "Thumbs Up / YES", emoji: "👍", description: "Thumb up, fingers closed", category: "response" },
  { sign: "Thumbs Down / NO", emoji: "👎", description: "Thumb down, fingers closed", category: "response" },
  { sign: "One", emoji: "1️⃣", description: "Only index finger up", category: "number" },
];

const islSigns = [
  { sign: "A", emoji: "🅰️", description: "Index of one hand touches thumb of other", category: "alphabet" },
  { sign: "B", emoji: "✋", description: "Open hand (Single hand fallback)", category: "alphabet" },
  { sign: "C", emoji: "🤏", description: "Curved hand like a C", category: "alphabet" },
  { sign: "E", emoji: "📧", description: "Index of one hand touches index of other", category: "alphabet" },
  { sign: "I", emoji: "ℹ️", description: "Index of one hand touches middle of other", category: "alphabet" },
  { sign: "L", emoji: "☝️", description: "L shape with thumb and index", category: "alphabet" },
  { sign: "O", emoji: "⭕", description: "Index of one hand touches ring of other", category: "alphabet" },
  { sign: "U", emoji: "🆙", description: "Index of one hand touches pinky of other", category: "alphabet" },
  { sign: "Namaste / Hello", emoji: "🙏", description: "Hands together in front of chest", category: "greeting" },
  { sign: "Teacher", emoji: "👨‍🏫", description: "Touch forehead with index finger", category: "occupation" },
  { sign: "Hello", emoji: "👋", description: "All fingers extended, open hand", category: "greeting" },
  { sign: "Thumbs Up", emoji: "👍", description: "Thumb up, fingers closed", category: "response" },
  { sign: "Thumbs Down", emoji: "👎", description: "Thumb down, fingers closed", category: "response" },
  { sign: "One", emoji: "1️⃣", description: "Only index finger up", category: "number" },
];

export const SignToSpeech: React.FC<SignLanguageRecognitionProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<SignTab>("camera");
  const [language, setLanguage] = useState<SignLanguage>("ASL");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [detectedSign, setDetectedSign] = useState<GestureResult | null>(null);
  const [currentLandmarks, setCurrentLandmarks] = useState<NormalizedLandmark[][]>([]);
  const [detectionLog, setDetectionLog] = useState<{ gesture: GestureResult; time: string }[]>([]);
  const [typedString, setTypedString] = useState("");
  const [isTypingMode, setIsTypingMode] = useState(false);
  const lastDetectedRef = useRef<string | null>(null);
  const lastAlphabetRef = useRef<string | null>(null);
  const isTriggerActiveRef = useRef(false);
  const lastDetectionTimeRef = useRef<number>(0);
  const lastMediaPipeTimestampRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const smoothersRef = useRef<LandmarkSmoother[]>([]);
  const knnRef = useRef<KNNClassifier>(new KNNClassifier(customTrainingData));

  const commonSigns = language === 'ASL' ? aslSigns : islSigns;

  const { initModel: initHandModel, detect: detectHands, isModelLoading: isHandModelLoading, isModelReady: isHandModelReady } = useHandLandmarker();
  const { initModel: initPoseModel, detect: detectPose, isModelLoading: isPoseModelLoading, isModelReady: isPoseModelReady } = usePoseLandmarker();

  const isModelLoading = isHandModelLoading || isPoseModelLoading;
  const isModelReady = isHandModelReady && isPoseModelReady;

  const runDetectionLoop = useCallback(() => {
    const video = videoRef.current;
    if (!video || !streamRef.current || video.paused || video.ended) {
      animFrameRef.current = requestAnimationFrame(runDetectionLoop);
      return;
    }

    try {
      let timestamp = Math.max(1, performance.now());
      if (timestamp <= lastMediaPipeTimestampRef.current) {
        timestamp = lastMediaPipeTimestampRef.current + 1;
      }
      lastMediaPipeTimestampRef.current = timestamp;
      
      const handResult = detectHands(video, timestamp);
      const poseResult = detectPose(video, timestamp);
      
      const poseLandmarks = poseResult?.landmarks[0];

      if (handResult && handResult.landmarks.length > 0) {
        const handCount = handResult.landmarks.length;
        
        // Ensure we have enough smoothers
        while (smoothersRef.current.length < handCount) {
          smoothersRef.current.push(new LandmarkSmoother(5));
        }

        // Apply smoothing to all detected hands
        const smoothedLandmarks = handResult.landmarks.map((handLandmarks, i) => 
          smoothersRef.current[i].add(handLandmarks)
        );

        setCurrentLandmarks(smoothedLandmarks);

        // Classify all hands
        const gestures = smoothedLandmarks.map(landmarks => classifyGesture(landmarks, language, poseLandmarks));
        
        // Two-hand gesture classification (especially for ISL)
        const twoHandGesture = classifyTwoHandGesture(smoothedLandmarks, language, poseLandmarks);
        
        // Emergency Trigger: Two Thumbs Down
        if (gestures.length >= 2) {
          const thumbsDownCount = gestures.filter(g => g && (g.name === "Thumbs Down / NO" || g.name === "Thumbs Down")).length;
          if (thumbsDownCount >= 2) {
            setActiveTab("emergency");
            animFrameRef.current = requestAnimationFrame(runDetectionLoop);
            return;
          }
        }

        // Primary gesture
        let gesture = twoHandGesture || gestures[0];
        
        // If rule-based fails or for specific complex signs, use KNN
        if (smoothedLandmarks[0] && (!gesture || gesture.name === "HELP" || gesture.name === "HELLO")) {
          const knnResult = knnRef.current.predict(smoothedLandmarks[0]);
          if (knnResult && knnResult.confidence > 0.45) {
            const signInfo = commonSigns.find(s => s.sign === knnResult.label);
            if (signInfo) {
              gesture = { 
                name: signInfo.sign, 
                emoji: signInfo.emoji, 
                category: signInfo.category 
              };
            }
          }
        }

        if (gesture) {
          const now = Date.now();
          
          // Only process if not in cooldown (1 second)
          if (now - lastDetectionTimeRef.current < 1000) {
            animFrameRef.current = requestAnimationFrame(runDetectionLoop);
            return;
          }

          setDetectedSign(gesture);
          lastDetectionTimeRef.current = now;

          // Logic for Gesture Typing
          if (isTypingMode) {
            // Check if ANY hand is a Thumbs Down trigger (Type)
            const hasTypeTrigger = gestures.some(g => g && (g.name === "Thumbs Down / NO" || g.name === "Thumbs Down"));
            // Check if ANY hand is a Thumbs Up trigger (Backspace)
            const hasBackspaceTrigger = gestures.some(g => g && (g.name === "Thumbs Up / YES" || g.name === "Thumbs Up"));
            
            if (hasTypeTrigger) {
              if (!isTriggerActiveRef.current && lastAlphabetRef.current) {
                setTypedString(prev => prev + lastAlphabetRef.current);
                isTriggerActiveRef.current = true;
              }
            } else if (hasBackspaceTrigger) {
              if (!isTriggerActiveRef.current && typedString.length > 0) {
                setTypedString(prev => prev.slice(0, -1));
                isTriggerActiveRef.current = true;
              }
            } else if (gesture.category === "alphabet") {
              lastAlphabetRef.current = gesture.name;
              isTriggerActiveRef.current = false;
            } else {
              isTriggerActiveRef.current = false;
            }
          }

          // Only log if different from last detection to avoid spam
          if (gesture.name !== lastDetectedRef.current) {
            lastDetectedRef.current = gesture.name;
            setDetectionLog((prev) => {
              const updated = [{ gesture, time: new Date().toLocaleTimeString() }, ...prev];
              return updated.slice(0, 20);
            });
          }
        } else {
          setDetectedSign(null);
          lastDetectedRef.current = null;
        }
      } else {
        setCurrentLandmarks([]);
        setDetectedSign(null);
        // Clear smoothers when no hands are detected to avoid "ghost" smoothing on re-entry
        smoothersRef.current.forEach(s => s.clear());
      }
    } catch (err) {
      console.error("Detection error:", err);
    }

    animFrameRef.current = requestAnimationFrame(runDetectionLoop);
  }, [detectHands, detectPose, language, commonSigns, isTypingMode, typedString]);

  const startCamera = async () => {
    try {
      setHasPermission(null);
      
      // Try with ideal constraints first
      const constraints = {
        video: { 
          facingMode: "user", 
          width: { ideal: 640 }, 
          height: { ideal: 480 } 
        },
      };
      
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (e) {
        console.warn("Failed with ideal constraints, trying basic video:true", e);
        // Fallback to simplest possible constraints
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      setHasPermission(true);

      // Init models after camera is running
      await Promise.all([initHandModel(), initPoseModel()]);
    } catch (error) {
      console.error("Camera access denied:", error);
      setHasPermission(false);
    }
  };

  // Start detection loop once camera is active and model ready
  useEffect(() => {
    if (isCameraActive && isModelReady) {
      animFrameRef.current = requestAnimationFrame(runDetectionLoop);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isCameraActive, isModelReady, runDetectionLoop]);

  const stopCamera = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setDetectedSign(null);
    setCurrentLandmarks([]);
    smoothersRef.current.forEach(s => s.clear());
  };

  useEffect(() => {
    if (activeTab !== "camera" && isCameraActive) {
      stopCamera();
    }
  }, [activeTab, isCameraActive]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-8"
    >
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Sign Language</h1>
            <p className="text-slate-600 dark:text-slate-400">Recognition & Library</p>
          </div>
        </div>

        {/* Tab Switcher & Language Selector */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 rounded-xl bg-slate-200 dark:bg-slate-800 p-1 w-full sm:w-auto overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveTab("camera")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === "camera"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Camera className="h-4 w-4" />
              Live Recognition
            </button>
            <button
              onClick={() => setActiveTab("library")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === "library"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Sign Library
            </button>
            <button
              onClick={() => setActiveTab("textToSign")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === "textToSign"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Type className="h-4 w-4" />
              Text to Sign
            </button>
            <button
              onClick={() => setActiveTab("speechToSign")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === "speechToSign"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Mic className="h-4 w-4" />
              Speech to Sign
            </button>
            <button
              onClick={() => setActiveTab("emergency")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === "emergency"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Siren className="h-4 w-4" />
              Emergency
            </button>
          </div>

          <div className="flex gap-2 bg-blue-100/50 dark:bg-blue-900/20 p-1 rounded-xl border border-blue-200 dark:border-blue-800 w-full sm:w-auto">
            <button
              onClick={() => setLanguage('ASL')}
              className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                language === 'ASL' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40'
              }`}
            >
              ASL
            </button>
            <button
              onClick={() => setLanguage('ISL')}
              className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                language === 'ISL' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40'
              }`}
            >
              ISL
            </button>
          </div>
        </div>

        {activeTab === "camera" ? (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Camera View */}
          <div className="lg:col-span-2">
            <div className="relative aspect-video overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-900 shadow-lg">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover ${isCameraActive ? '' : 'hidden'}`}
              />
              {isCameraActive && (
                <>
                  <HandLandmarkCanvas
                    landmarks={currentLandmarks}
                    width={640}
                    height={480}
                  />

                  {/* Detection overlay */}
                  <AnimatePresence>
                    {detectedSign && (
                       <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-blue-600 px-6 py-3 text-white shadow-xl"
                      >
                        <p className="text-lg font-semibold">{detectedSign.emoji} {detectedSign.name}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Recording indicator */}
                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/90 dark:bg-slate-900/90 px-3 py-1.5 backdrop-blur-sm">
                    <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Live</span>
                  </div>
                </>
              )}
              {!isCameraActive && (
                <div className="absolute inset-0 flex h-full flex-col items-center justify-center gap-4 p-8">
                  {isModelLoading ? (
                    <>
                      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                      <p className="text-center text-slate-400">
                        Loading AI model...
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="rounded-full bg-slate-800 p-6">
                        <Camera className="h-12 w-12 text-slate-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-slate-400 mb-4 max-w-xs">
                          {hasPermission === false
                            ? "Camera access was denied. Please check your browser settings and ensure you have granted permission to this site."
                            : "Enable your camera to start sign language recognition"}
                        </p>
                        {hasPermission === false && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setHasPermission(null);
                              startCamera();
                            }}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            Try Again
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Camera Controls */}
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <Button
                variant={isCameraActive ? "destructive" : "hero"}
                size="lg"
                onClick={isCameraActive ? stopCamera : startCamera}
                className="gap-2"
                disabled={isModelLoading}
              >
                {isModelLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading Model...
                  </>
                ) : isCameraActive ? (
                  <>
                    <CameraOff className="h-5 w-5" />
                    Stop Camera
                  </>
                ) : (
                  <>
                    <Camera className="h-5 w-5" />
                    Start Camera
                  </>
                )}
              </Button>

              <Button
                variant={isTypingMode ? "hero" : "outline"}
                size="lg"
                onClick={() => setIsTypingMode(!isTypingMode)}
                className={`gap-2 ${isTypingMode ? 'bg-blue-600' : 'border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400'}`}
              >
                <Type className="h-5 w-5" />
                {isTypingMode ? "Typing Mode: ON" : "Enable Gesture Typing"}
              </Button>
            </div>

            {/* Typed Text Display */}
            <AnimatePresence>
              {isTypingMode && (
                 <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-blue-100 dark:border-blue-900/30 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Gesture Typed Text
                    </h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setTypedString(prev => prev.slice(0, -1))}
                        className="text-slate-400 hover:text-amber-600"
                        disabled={!typedString}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Backspace
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setTypedString("")}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Clear
                      </Button>
                    </div>
                  </div>
                  <div className="min-h-[80px] bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                    {typedString ? (
                      <p className="text-3xl font-bold tracking-widest text-slate-900 dark:text-slate-100 break-all">
                        {typedString}
                      </p>
                    ) : (
                      <p className="text-slate-400 italic text-sm">
                        Show an alphabet, then flash a "Thumb Down" 👎 to type it...
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex flex-col gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <p className="text-xs text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wider">How to type:</p>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1.5 list-disc pl-4">
                          <li><b>Type:</b> Show an alphabet sign, then flash a <b>Thumb Down</b> 👎 gesture.</li>
                          <li><b>Backspace:</b> Flash a <b>Thumb Up</b> 👍 gesture to delete the last character.</li>
                          <li><b>Emergency:</b> Flash <b>Two Thumbs Down</b> 👎👎 to trigger the emergency menu.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Detection Log */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  <Hand className="h-5 w-5 text-blue-600" />
                  Recognition Log
                  {detectionLog.length > 0 && (
                    <span className="ml-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                      {detectionLog.length}
                    </span>
                  )}
                </h2>
                {detectionLog.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setDetectionLog([])} className="h-7 gap-1 text-xs text-slate-500">
                    <Trash2 className="h-3 w-3" /> Clear
                  </Button>
                )}
              </div>
              <div className="min-h-[120px] max-h-[280px] overflow-y-auto rounded-xl bg-slate-50 dark:bg-slate-950 p-3">
                {detectionLog.length > 0 ? (
                  <ul className="space-y-2">
                    {detectionLog.map((entry, i) => (
                      <motion.li
                        key={`${entry.gesture.name}-${entry.time}-${i}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 rounded-lg bg-white dark:bg-slate-900 p-2.5 shadow-sm border border-slate-100 dark:border-slate-800"
                      >
                        <span className="text-xl">{entry.gesture.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{entry.gesture.name}</p>
                          <p className="text-xs text-slate-500">{entry.gesture.category}</p>
                        </div>
                        <span className="text-xs text-slate-400 whitespace-nowrap">{entry.time}</span>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 text-sm text-center py-8">
                    {isCameraActive
                      ? "Show a hand gesture to the camera..."
                      : "Start the camera to begin recognition"}
                  </p>
                )}
              </div>
            </div>

            {/* Common Signs Reference */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                <Info className="h-5 w-5 text-blue-600" />
                Supported Gestures
                <span className="ml-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                  {commonSigns.length}
                </span>
              </h2>
              <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {commonSigns.map((item) => (
                  <div
                    key={item.sign}
                    className="flex items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-100 dark:border-slate-800"
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.sign}</p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        ) : activeTab === "library" ? (
          <SignLanguageLibrary language={language} />
        ) : activeTab === "textToSign" ? (
          <TextToSign />
        ) : activeTab === "speechToSign" ? (
          <SpeechToSign />
        ) : activeTab === "insights" ? (
          <ModelInsights />
        ) : activeTab === "collector" ? (
          <LandmarkDataCollector />
        ) : (
          <EmergencySigns />
        )}
      </div>
    </motion.div>
  );
}

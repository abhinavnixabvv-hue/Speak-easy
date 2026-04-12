import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useState, useCallback, useRef } from "react";

export const useHandLandmarker = () => {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  const initModel = useCallback(async () => {
    if (handLandmarkerRef.current) return;
    setIsModelLoading(true);
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
      });
      setIsModelReady(true);
    } catch (error) {
      console.error("Failed to init HandLandmarker:", error);
    } finally {
      setIsModelLoading(false);
    }
  }, []);

  const detect = useCallback((video: HTMLVideoElement, timestamp: number) => {
    if (!handLandmarkerRef.current) return null;
    return handLandmarkerRef.current.detectForVideo(video, timestamp);
  }, []);

  return { initModel, detect, isModelLoading, isModelReady };
};

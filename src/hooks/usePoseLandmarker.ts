import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useState, useCallback, useRef } from "react";

export const usePoseLandmarker = () => {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);

  const initModel = useCallback(async () => {
    if (poseLandmarkerRef.current) return;
    setIsModelLoading(true);
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm"
      );
      poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numPoses: 1
      });
      setIsModelReady(true);
    } catch (error) {
      console.error("Failed to init PoseLandmarker:", error);
    } finally {
      setIsModelLoading(false);
    }
  }, []);

  const detect = useCallback((video: HTMLVideoElement, timestamp: number) => {
    if (!poseLandmarkerRef.current) return null;
    return poseLandmarkerRef.current.detectForVideo(video, timestamp);
  }, []);

  return { initModel, detect, isModelLoading, isModelReady };
};

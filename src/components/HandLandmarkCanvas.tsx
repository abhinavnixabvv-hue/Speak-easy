import React, { useEffect, useRef } from 'react';
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

interface HandLandmarkCanvasProps {
  landmarks: NormalizedLandmark[][];
  width: number;
  height: number;
}

export const HandLandmarkCanvas: React.FC<HandLandmarkCanvasProps> = ({ landmarks, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;

    landmarks.forEach(hand => {
      hand.forEach(landmark => {
        ctx.beginPath();
        ctx.arc(landmark.x * width, landmark.y * height, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      });
    });
  }, [landmarks, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
    />
  );
};

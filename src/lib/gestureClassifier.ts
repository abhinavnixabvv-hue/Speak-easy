import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export interface GestureResult {
  name: string;
  emoji: string;
  category: string;
}

export const classifyGesture = (landmarks: NormalizedLandmark[], language: string, poseLandmarks?: any): GestureResult | null => {
  if (!landmarks) return null;

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  
  const indexPip = landmarks[6];
  const middlePip = landmarks[10];
  const ringPip = landmarks[14];
  const pinkyPip = landmarks[18];

  const isIndexUp = indexTip.y < indexPip.y;
  const isMiddleUp = middleTip.y < middlePip.y;
  const isRingUp = ringTip.y < ringPip.y;
  const isPinkyUp = pinkyTip.y < pinkyPip.y;
  
  const fingersUp = [isIndexUp, isMiddleUp, isRingUp, isPinkyUp].filter(Boolean).length;

  // Basic heuristics for ASL/ISL
  if (fingersUp === 0 && thumbTip.y < indexPip.y) return { name: 'A', emoji: '✊', category: 'alphabet' };
  if (fingersUp === 4 && thumbTip.y > indexPip.y) return { name: 'B', emoji: '✋', category: 'alphabet' };
  
  const distThumbIndex = Math.sqrt(Math.pow(thumbTip.x - indexTip.x, 2) + Math.pow(thumbTip.y - indexTip.y, 2));
  if (fingersUp === 0 && distThumbIndex > 0.1 && thumbTip.x < indexTip.x) return { name: 'C', emoji: '🤏', category: 'alphabet' };
  if (isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp && thumbTip.y > middleTip.y) return { name: 'D', emoji: '☝️', category: 'alphabet' };
  
  if (isIndexUp && isMiddleUp && !isRingUp && !isPinkyUp) return { name: 'V', emoji: '✌️', category: 'alphabet' };
  if (isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp) return { name: 'L', emoji: '☝️', category: 'alphabet' };
  
  if (fingersUp === 5) return { name: 'HELLO', emoji: '👋', category: 'greeting' };
  if (fingersUp === 0 && thumbTip.y > indexTip.y) return { name: 'YES', emoji: '👍', category: 'response' };
  if (fingersUp === 0 && thumbTip.x > indexTip.x) return { name: 'NO', emoji: '👎', category: 'response' };

  return null;
};

export const classifyTwoHandGesture = (allLandmarks: NormalizedLandmark[][], language: string, poseLandmarks?: any): GestureResult | null => {
  if (allLandmarks.length < 2) return null;
  // Simple check for Namaste (ISL)
  const leftHand = allLandmarks[0];
  const rightHand = allLandmarks[1];
  const dist = Math.sqrt(Math.pow(leftHand[0].x - rightHand[0].x, 2) + Math.pow(leftHand[0].y - rightHand[0].y, 2));
  if (dist < 0.1) return { name: 'Namaste', emoji: '🙏', category: 'greeting' };
  
  return null;
};

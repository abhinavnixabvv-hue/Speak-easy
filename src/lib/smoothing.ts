import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export class LandmarkSmoother {
  private history: NormalizedLandmark[][] = [];
  private windowSize: number;

  constructor(windowSize: number = 5) {
    this.windowSize = windowSize;
  }

  add(landmarks: NormalizedLandmark[]): NormalizedLandmark[] {
    this.history.push(landmarks);
    if (this.history.length > this.windowSize) {
      this.history.shift();
    }

    if (this.history.length === 1) return landmarks;

    const smoothed: NormalizedLandmark[] = [];
    for (let i = 0; i < landmarks.length; i++) {
      let x = 0, y = 0, z = 0;
      for (const frame of this.history) {
        x += frame[i].x;
        y += frame[i].y;
        z += frame[i].z;
      }
      smoothed.push({
        x: x / this.history.length,
        y: y / this.history.length,
        z: z / this.history.length,
        visibility: landmarks[i].visibility,
      });
    }
    return smoothed;
  }

  clear() {
    this.history = [];
  }
}

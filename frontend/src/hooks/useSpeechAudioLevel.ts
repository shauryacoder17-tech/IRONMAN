"use client";

import { useRef, useState, useCallback } from "react";

// Analyzes an <audio> element's OUTPUT level (Jarvis speaking),
// as opposed to microphone input (which useSpeechToText handles separately).
export function useSpeechAudioLevel() {
  const [level, setLevel] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const attach = useCallback((audioEl: HTMLAudioElement) => {
    const ctx = audioCtxRef.current ?? new AudioContext();
    audioCtxRef.current = ctx;

    const source = ctx.createMediaElementSource(audioEl);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyser.connect(ctx.destination); // keep audio audible

    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      setLevel(Math.min(1, avg / 100)); // normalize 0-1
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, []);

  const detach = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setLevel(0);
  }, []);

  return { level, attach, detach };
}

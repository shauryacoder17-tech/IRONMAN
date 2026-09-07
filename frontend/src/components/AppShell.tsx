"use client";

import { useState } from "react";
import Landing from "@/components/landing/Landing";
import Dashboard from "@/components/dashboard/Dashboard";

type View = "landing" | "booting" | "dashboard";

const fallbackDialogue = [
  "Hello Shaurya.",
  "JARVIS systems are online.",
  "Arc reactor synchronization is complete.",
  "How may I assist you?",
  "How was your day?",
  "I hope you are doing well.",
  "I am here to help you with anything you need.",
  "Please let me know if you have any questions or concerns.",
  "I am always available to assist you.",
];

function getFemaleVoice() {
  const voices = window.speechSynthesis.getVoices();
  const femaleVoicePattern =
    /female|samantha|victoria|karen|zira|ava|susan|hazel|moira|aria|jenny/i;

  return (
    voices.find((voice) => femaleVoicePattern.test(voice.name)) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en"))
  );
}

function speakFallback() {
  window.speechSynthesis.cancel();
  let started = false;

  const speakWithLoadedVoice = () => {
    if (started) return;
    started = true;

    const femaleVoice = getFemaleVoice();
    fallbackDialogue.forEach((line, index) => {
      const utterance = new SpeechSynthesisUtterance(line);
      utterance.voice = femaleVoice ?? null;
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;
      window.setTimeout(
        () => window.speechSynthesis.speak(utterance),
        index * 850,
      );
    });
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    speakWithLoadedVoice();
  } else {
    window.speechSynthesis.addEventListener(
      "voiceschanged",
      speakWithLoadedVoice,
      { once: true },
    );
    window.setTimeout(speakWithLoadedVoice, 500);
  }
}

async function playJarvisVoice(audioContext: AudioContext) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch("/api/jarvis-tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: fallbackDialogue.join(" ") }),
      signal: controller.signal,
    });
    if (!response.ok) return false;

    const audioBuffer = await audioContext.decodeAudioData(
      await response.arrayBuffer(),
    );
    await audioContext.resume();

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();

    return true;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}

export default function AppShell() {
  const [view, setView] = useState<View>("landing");

  function activate() {
    const audioContext = new window.AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(440, now);
    oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.18);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.42);

    void playJarvisVoice(audioContext).then((played) => {
      if (!played) speakFallback();
    });

    setView("booting");
    setTimeout(() => setView("dashboard"), 1200);
  }

  if (view === "dashboard") return <Dashboard />;

  return <Landing onActivate={activate} isBooting={view === "booting"} />;
}

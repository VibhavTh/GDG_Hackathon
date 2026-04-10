"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ConversationTurn, PendingConfirmation, VoiceAssistantResponse } from "@/lib/voice-assistant/types";

export type VoiceAssistantState =
  | "idle"
  | "recording"
  | "transcribing"
  | "processing"
  | "speaking"
  | "confirming"
  | "error";

export interface UseVoiceAssistantReturn {
  state: VoiceAssistantState;
  lastReply: string;
  conversationHistory: ConversationTurn[];
  pendingConfirmation: PendingConfirmation | null;
  productKeywords: string[];
  startRecording: () => void;
  stopRecording: () => void;
  confirmAction: () => void;
  cancelAction: () => void;
  reset: () => void;
}

export function useVoiceAssistant(): UseVoiceAssistantReturn {
  const router = useRouter();
  const [state, setState] = useState<VoiceAssistantState>("idle");
  const [lastReply, setLastReply] = useState("");
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);
  const [productKeywords, setProductKeywords] = useState<string[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesLoadedRef = useRef(false);

  // Pre-load voices so they're available when speak() is first called
  useEffect(() => {
    if (typeof window === "undefined") return;
    const load = () => { voicesLoadedRef.current = true; };
    if (window.speechSynthesis.getVoices().length > 0) {
      load();
    } else {
      window.speechSynthesis.addEventListener("voiceschanged", load, { once: true });
    }
  }, []);

  // Fetch product keywords on mount for Deepgram hints
  useEffect(() => {
    fetch("/api/voice-assistant")
      .then((r) => r.json())
      .then((data: { keywords?: string[] }) => {
        if (data.keywords) setProductKeywords(data.keywords);
      })
      .catch(() => {}); // non-fatal
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Pick the best available English voice: prefer Google/Microsoft neural voices
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) =>
      v.lang.startsWith("en") && /google us english|google uk english female|microsoft aria|microsoft jenny|samantha/i.test(v.name)
    ) ?? voices.find((v) => v.lang === "en-US" && v.localService === false)
      ?? voices.find((v) => v.lang === "en-US")
      ?? voices.find((v) => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => {
      setState("idle");
      onEnd?.();
    };
    utterance.onerror = () => setState("idle");
    utteranceRef.current = utterance;
    setState("speaking");
    window.speechSynthesis.speak(utterance);
  }, []);

  const sendToAssistant = useCallback(
    async (transcript: string, confirmation?: PendingConfirmation | null) => {
      setState("processing");

      const body = {
        transcript,
        conversationHistory,
        pendingConfirmation: confirmation ?? undefined,
      };

      try {
        const res = await fetch("/api/voice-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data: VoiceAssistantResponse = await res.json();

        if (data.error && !data.spokenReply) {
          setState("error");
          setLastReply("Something went wrong. Please try again.");
          return;
        }

        setLastReply(data.spokenReply);

        // Update conversation history
        setConversationHistory((prev) => [
          ...prev,
          { role: "user", content: transcript },
          { role: "assistant", content: data.spokenReply },
        ]);

        if (data.requiresConfirmation) {
          setPendingConfirmation(data.requiresConfirmation);
          setState("confirming");
          speak(data.spokenReply);
        } else {
          setPendingConfirmation(null);
          // Refresh server component data if a tool mutated something
          if (data.toolInvoked) {
            router.refresh();
          }
          speak(data.spokenReply);
        }
      } catch (err) {
        console.error("[useVoiceAssistant] fetch error:", err);
        setState("error");
        setLastReply("Connection error. Please try again.");
      }
    },
    [conversationHistory, speak]
  );

  const processAudio = useCallback(
    async (audioBlob: Blob) => {
      setState("transcribing");

      try {
        const keywordsParam = productKeywords.join(",");
        const transcribeUrl = `/api/voice-assistant/transcribe${keywordsParam ? `?keywords=${encodeURIComponent(keywordsParam)}` : ""}`;

        const res = await fetch(transcribeUrl, {
          method: "POST",
          headers: { "Content-Type": audioBlob.type || "audio/webm" },
          body: audioBlob,
        });

        const data: { transcript?: string; error?: string } = await res.json();

        if (!data.transcript || data.transcript.trim() === "") {
          setState("idle");
          setLastReply("I didn't catch that. Please try again.");
          return;
        }

        await sendToAssistant(data.transcript, pendingConfirmation);
      } catch (err) {
        console.error("[useVoiceAssistant] transcribe error:", err);
        setState("error");
        setLastReply("Transcription failed. Please try again.");
      }
    },
    [productKeywords, pendingConfirmation, sendToAssistant]
  );

  const startRecording = useCallback(async () => {
    if (state !== "idle" && state !== "confirming" && state !== "error") return;

    // Stop any active speech
    window.speechSynthesis?.cancel();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        // Stop all tracks to release microphone
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        processAudio(audioBlob);
      };

      recorder.start();
      setState("recording");
    } catch (err) {
      console.error("[useVoiceAssistant] microphone access denied:", err);
      setState("error");
      setLastReply("Microphone access is needed to use voice commands.");
    }
  }, [state, processAudio]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const confirmAction = useCallback(() => {
    if (!pendingConfirmation) return;
    sendToAssistant("yes", pendingConfirmation);
  }, [pendingConfirmation, sendToAssistant]);

  const cancelAction = useCallback(() => {
    setPendingConfirmation(null);
    setLastReply("Cancelled.");
    speak("Cancelled.");
  }, [speak]);

  const reset = useCallback(() => {
    window.speechSynthesis?.cancel();
    mediaRecorderRef.current?.stop();
    setPendingConfirmation(null);
    setConversationHistory([]);
    setLastReply("");
    setState("idle");
  }, []);

  return {
    state,
    lastReply,
    conversationHistory,
    pendingConfirmation,
    productKeywords,
    startRecording,
    stopRecording,
    confirmAction,
    cancelAction,
    reset,
  };
}

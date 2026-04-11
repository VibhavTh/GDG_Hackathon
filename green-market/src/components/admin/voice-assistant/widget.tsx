"use client";

import { useState, useEffect, useRef } from "react";
import { useVoiceAssistant } from "./use-voice-assistant";
import { Icon } from "@/components/ui/icon";

const STATE_LABEL: Record<string, string> = {
  idle: "Ready",
  recording: "Listening",
  transcribing: "Transcribing",
  processing: "Thinking",
  speaking: "Speaking",
  confirming: "Confirm action",
  error: "Error",
};

export function VoiceAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const historyEndRef = useRef<HTMLDivElement>(null);

  const {
    state,
    lastReply,
    conversationHistory,
    pendingConfirmation,
    startRecording,
    stopRecording,
    confirmAction,
    cancelAction,
    reset,
  } = useVoiceAssistant();

  // Scroll to bottom when history grows
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationHistory.length]);

  const isRecording = state === "recording";
  const isBusy = state === "transcribing" || state === "processing" || state === "speaking";
  const isConfirming = state === "confirming";
  const isError = state === "error";
  const isActive = state !== "idle" && state !== "error";

  return (
    <>
      {/* Panel */}
      {isOpen && (
        <div
          className="fixed bottom-[5.5rem] right-4 md:bottom-24 md:right-8 z-50 w-[22rem] rounded-2xl overflow-hidden animate-slide-up-fast"
          style={{
            background: "var(--color-surface-container-low)",
            boxShadow: "0 8px 48px rgba(23, 56, 9, 0.12), 0 2px 8px rgba(23, 56, 9, 0.06)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ background: "var(--color-surface-container)" }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "var(--color-secondary)" }}
              >
                <Icon name="mic" size="sm" className="text-white text-[14px]" />
              </div>
              <span className="font-headline text-sm font-semibold" style={{ color: "var(--color-on-surface)" }}>
                Farm Assistant
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* State indicator dot */}
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    isError
                      ? "bg-error"
                      : isRecording
                      ? "bg-secondary animate-pulse"
                      : isBusy
                      ? "bg-tertiary animate-pulse"
                      : "bg-primary/30"
                  }`}
                />
                <span
                  className="text-[10px] font-medium uppercase tracking-widest"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  {STATE_LABEL[state]}
                </span>
              </div>

              <button
                onClick={() => { setIsOpen(false); reset(); }}
                className="w-6 h-6 flex items-center justify-center rounded-full transition-colors duration-150 hover:bg-surface-container-highest"
                aria-label="Close"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                <Icon name="close" size="sm" className="text-[16px]" />
              </button>
            </div>
          </div>

          {/* Error banner */}
          {isError && (
            <div
              className="px-5 py-2.5 text-xs font-medium animate-slide-down"
              style={{
                background: "var(--color-error-container)",
                color: "var(--color-on-error-container)",
              }}
            >
              Something went wrong. Try again.
            </div>
          )}

          {/* Conversation */}
          <div className="px-5 py-4 max-h-48 overflow-y-auto space-y-4">
            {conversationHistory.length === 0 ? (
              <div className="py-2">
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  Hold the mic and speak. Try{" "}
                  <span style={{ color: "var(--color-on-surface)", fontWeight: 500 }}>
                    &quot;What orders need fulfilling?&quot;
                  </span>{" "}
                  or{" "}
                  <span style={{ color: "var(--color-on-surface)", fontWeight: 500 }}>
                    &quot;Set honey to 20 units.&quot;
                  </span>
                </p>
              </div>
            ) : (
              conversationHistory.slice(-8).map((turn, i) => (
                <div key={i} className={`flex gap-2 ${turn.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                      turn.role === "user"
                        ? "rounded-tr-sm"
                        : "rounded-tl-sm"
                    }`}
                    style={
                      turn.role === "user"
                        ? {
                            background: "var(--color-primary)",
                            color: "var(--color-on-primary)",
                          }
                        : {
                            background: "var(--color-surface-container)",
                            color: "var(--color-on-surface)",
                          }
                    }
                  >
                    {turn.content}
                  </div>
                </div>
              ))
            )}
            <div ref={historyEndRef} />
          </div>

          {/* Recording waveform */}
          {isRecording && (
            <div className="flex items-center justify-center gap-1 py-2 animate-slide-down">
              {[0.6, 1, 0.75, 1, 0.5, 0.85, 0.65].map((h, i) => (
                <div
                  key={i}
                  className="w-0.5 rounded-full animate-pulse"
                  style={{
                    height: `${h * 20}px`,
                    background: "var(--color-secondary)",
                    animationDelay: `${i * 80}ms`,
                    animationDuration: "600ms",
                  }}
                />
              ))}
            </div>
          )}

          {/* Confirmation banner */}
          {isConfirming && pendingConfirmation && (
            <div
              className="mx-4 mb-3 p-3 rounded-xl animate-slide-down"
              style={{
                background: "var(--color-secondary-fixed)",
                color: "var(--color-on-secondary-fixed)",
              }}
            >
              <div className="flex gap-2 mt-2">
                <button
                  onClick={confirmAction}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold transition-opacity duration-150 hover:opacity-85 active:opacity-70"
                  style={{
                    background: "var(--color-secondary)",
                    color: "var(--color-on-secondary)",
                  }}
                >
                  Yes, do it
                </button>
                <button
                  onClick={cancelAction}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold transition-opacity duration-150 hover:opacity-85 active:opacity-70"
                  style={{
                    background: "var(--color-surface-container-highest)",
                    color: "var(--color-on-surface)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Push-to-talk */}
          <div className="flex flex-col items-center gap-1.5 pb-5 pt-2">
            <button
              onPointerDown={startRecording}
              onPointerUp={stopRecording}
              onPointerLeave={stopRecording}
              disabled={isBusy}
              aria-label={isRecording ? "Release to send" : "Hold to record"}
              className="relative w-14 h-14 rounded-full flex items-center justify-center select-none touch-none transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              style={{
                background: isRecording
                  ? "var(--color-secondary)"
                  : "var(--color-secondary)",
                color: "white",
                transform: isRecording ? "scale(1.1)" : undefined,
              }}
            >
              {/* Ripple ring during recording */}
              {isRecording && (
                <span
                  className="absolute inset-0 rounded-full animate-ping opacity-30"
                  style={{ background: "var(--color-secondary)" }}
                />
              )}
              <Icon
                name={isRecording ? "graphic_eq" : "mic"}
                size="md"
                className="relative z-10"
              />
            </button>
            <p
              className="text-[10px] font-medium uppercase tracking-widest"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              {isRecording ? "Release to send" : isBusy ? "Please wait" : "Hold to speak"}
            </p>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        aria-label={isOpen ? "Close voice assistant" : "Open voice assistant"}
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
        style={{
          background: isOpen
            ? "var(--color-surface-container-highest)"
            : isActive
            ? "var(--color-secondary)"
            : "var(--color-secondary)",
          color: "white",
          boxShadow: "0 4px 24px rgba(23, 56, 9, 0.20)",
        }}
      >
        <Icon
          name={isOpen ? "keyboard_arrow_down" : "mic"}
          size="md"
          className={`transition-transform duration-200 ${isOpen ? "rotate-0" : ""}`}
        />
      </button>
    </>
  );
}

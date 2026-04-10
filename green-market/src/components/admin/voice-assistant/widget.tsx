"use client";

import { useState } from "react";
import { useVoiceAssistant } from "./use-voice-assistant";
import type { VoiceAssistantState } from "./use-voice-assistant";
import { Icon } from "@/components/ui/icon";

const STATE_LABELS: Record<VoiceAssistantState, string> = {
  idle: "Hold to speak",
  recording: "Listening...",
  transcribing: "Transcribing...",
  processing: "Thinking...",
  speaking: "Speaking...",
  confirming: "Waiting for confirmation",
  error: "Something went wrong",
};

const STATE_COLORS: Record<VoiceAssistantState, string> = {
  idle: "bg-primary text-on-primary",
  recording: "bg-secondary text-on-secondary",
  transcribing: "bg-tertiary text-on-tertiary",
  processing: "bg-tertiary text-on-tertiary",
  speaking: "bg-primary text-on-primary",
  confirming: "bg-secondary-container text-on-secondary-container",
  error: "bg-error text-on-error",
};

export function VoiceAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
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

  const isActive = state !== "idle" && state !== "error";
  const fabColor = STATE_COLORS[state];

  function handleFabClick() {
    setIsOpen((prev) => !prev);
  }

  return (
    <>
      {/* Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 md:bottom-20 md:right-8 w-80 rounded-xl shadow-ambient bg-surface-container-low z-50 overflow-hidden"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.10)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-surface-container">
            <span className="font-headline text-sm font-semibold text-on-surface">
              Voice Assistant
            </span>
            <button
              onClick={() => { setIsOpen(false); reset(); }}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label="Close voice assistant"
            >
              <Icon name="close" size="sm" />
            </button>
          </div>

          {/* Status bar */}
          <div className={`px-4 py-2 text-xs font-medium ${state === "error" ? "bg-error-container text-on-error-container" : "bg-surface-container-low text-on-surface-variant"}`}>
            {STATE_LABELS[state]}
          </div>

          {/* Conversation history */}
          <div className="px-4 py-3 max-h-40 overflow-y-auto space-y-2">
            {conversationHistory.length === 0 ? (
              <p className="text-xs text-on-surface-variant italic">
                Hold the mic button and speak a command. For example: &quot;What orders need fulfilling?&quot; or &quot;Set honey to 20 units.&quot;
              </p>
            ) : (
              conversationHistory.slice(-6).map((turn, i) => (
                <div key={i} className={`text-xs ${turn.role === "user" ? "text-on-surface font-medium" : "text-primary"}`}>
                  <span className="font-semibold uppercase tracking-wide text-[10px] text-on-surface-variant">
                    {turn.role === "user" ? "You" : "Assistant"}
                  </span>
                  <p className="mt-0.5">{turn.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Last reply callout */}
          {lastReply && (
            <div className="mx-4 mb-3 px-3 py-2 rounded-lg bg-surface-container text-sm text-on-surface">
              {lastReply}
            </div>
          )}

          {/* Confirmation mode */}
          {state === "confirming" && pendingConfirmation && (
            <div className="mx-4 mb-3 px-3 py-2 rounded-lg bg-secondary-container text-on-secondary-container text-xs">
              <p className="font-medium mb-2">Confirm action</p>
              <div className="flex gap-2">
                <button
                  onClick={confirmAction}
                  className="flex-1 py-1.5 rounded-lg bg-secondary text-on-secondary text-xs font-semibold transition-opacity hover:opacity-90"
                >
                  Yes, do it
                </button>
                <button
                  onClick={cancelAction}
                  className="flex-1 py-1.5 rounded-lg bg-surface-container text-on-surface text-xs font-semibold transition-opacity hover:opacity-90"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Push-to-talk button */}
          <div className="flex justify-center pb-4">
            <button
              onPointerDown={startRecording}
              onPointerUp={stopRecording}
              onPointerLeave={stopRecording}
              disabled={state === "transcribing" || state === "processing" || state === "speaking"}
              aria-label={state === "recording" ? "Release to send" : "Hold to record"}
              className={`
                w-14 h-14 rounded-full flex items-center justify-center
                transition-all duration-150 select-none touch-none
                ${state === "recording" ? "bg-secondary text-on-secondary scale-110" : "bg-primary text-on-primary"}
                disabled:opacity-50 disabled:cursor-not-allowed
                active:scale-95
              `}
            >
              <Icon
                name={state === "recording" ? "graphic_eq" : "mic"}
                size="md"
              />
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={handleFabClick}
        aria-label="Open voice assistant"
        className={`
          fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50
          w-14 h-14 rounded-full flex items-center justify-center
          shadow-ambient transition-all duration-200
          ${isOpen ? "bg-surface-container-low text-on-surface" : fabColor}
          ${isActive && !isOpen ? "animate-pulse" : ""}
        `}
        style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
      >
        <Icon name={isOpen ? "keyboard_arrow_down" : "mic"} size="md" />
      </button>
    </>
  );
}

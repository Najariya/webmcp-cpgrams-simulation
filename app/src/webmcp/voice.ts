/**
 * Voice layer — page-side narration for voice-enabled agents and citizens.
 *
 * WebMCP has no native voice API and always requires a visible page, so
 * voice-readiness is the page's job. Two pieces:
 *  1. `announce()` — pushes citizen-facing state changes to an aria-live
 *     region (screen readers / voice agents hear page state) and, when Voice
 *     Mode is on, speaks them aloud.
 *  2. `speak()` — shared speechSynthesis helper (voice selection incl.
 *     Devanagari-capable voices for Hindi, cancel-previous) also used by the
 *     speak_aloud tool.
 *
 * Voice Mode is a reversible preference persisted under its own localStorage
 * key; it never gates or carries citizen data.
 */
import { create } from "zustand";

const VOICE_KEY = "advocate-voice-v1";

function loadVoiceMode(): boolean {
  try {
    return localStorage.getItem(VOICE_KEY) === "on";
  } catch {
    return false;
  }
}

function saveVoiceMode(on: boolean): void {
  try {
    localStorage.setItem(VOICE_KEY, on ? "on" : "off");
  } catch {
    /* storage unavailable — preference stays session-only */
  }
}

export interface VoiceState {
  voiceMode: boolean;
  setVoiceMode: (on: boolean) => void;
  toggleVoiceMode: () => void;
}

export const useVoiceStore = create<VoiceState>((set, get) => ({
  voiceMode: loadVoiceMode(),
  setVoiceMode: (on) => {
    saveVoiceMode(on);
    set({ voiceMode: on });
  },
  toggleVoiceMode: () => get().setVoiceMode(!get().voiceMode),
}));

export interface AnnounceState {
  /** Latest announcement; `seq` changes per push so identical text re-announces. */
  message: string | null;
  seq: number;
  push: (message: string) => void;
}

export const useAnnounceStore = create<AnnounceState>((set) => ({
  message: null,
  seq: 0,
  push: (message) => set((s) => ({ message, seq: s.seq + 1 })),
}));

/** Speak text in the given BCP-47 locale; returns false when speech is
 *  unavailable (embedded browsers, missing voices) — callers degrade to
 *  text-only announcements. */
export function speak(text: string, lang: "en-IN" | "hi-IN"): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return false;
  const utter = new SpeechSynthesisUtterance(text.slice(0, 300));
  utter.lang = lang;
  const voices = window.speechSynthesis.getVoices();
  const match =
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
  if (match) utter.voice = match;
  utter.rate = 0.98;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
  return true;
}

/** Announce a citizen-facing state change: always to the aria-live region,
 *  and aloud when Voice Mode is on. */
export function announce(text: string, lang: "en" | "hi" = "en"): void {
  useAnnounceStore.getState().push(text);
  if (useVoiceStore.getState().voiceMode) {
    speak(text, lang === "hi" ? "hi-IN" : "en-IN");
  }
}

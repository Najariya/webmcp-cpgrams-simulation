/**
 * Voice layer — set_voice_mode tool contract, preference persistence and
 * graceful degradation where speechSynthesis is unavailable (node/embedded).
 */
import { beforeEach, describe, expect, it } from "vitest";
import { setVoiceModeTool, speakAloudTool } from "../src/webmcp/tools";
import { announce, useAnnounceStore, useVoiceStore } from "../src/webmcp/voice";

const signal = new AbortController().signal;
const j = (s: string | Promise<string>) => Promise.resolve(s).then(JSON.parse) as Promise<Record<string, never> & { ok: boolean; data?: Record<string, unknown>; error?: { code: string; field?: string } }>;

const localStorageStub = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { store = {}; },
  };
})();
(globalThis as { localStorage?: unknown }).localStorage = localStorageStub;

describe("set_voice_mode tool", () => {
  beforeEach(() => {
    localStorageStub.clear();
    useVoiceStore.getState().setVoiceMode(false);
    useAnnounceStore.setState({ message: null, seq: 0 });
  });

  it("rejects unknown keys and non-boolean values with field+hint", async () => {
    const r1 = await j(setVoiceModeTool.execute({ enabled: true, extra: 1 } as never, { signal }));
    expect(r1.error?.code).toBe("INVALID_ARGUMENT");
    const r2 = await j(setVoiceModeTool.execute({ enabled: "yes" } as never, { signal }));
    expect(r2.error?.code).toBe("INVALID_ARGUMENT");
    expect(r2.error?.field).toBe("enabled");
  });

  it("enables narration: store flips, preference persists, envelope confirms", async () => {
    const r = await j(setVoiceModeTool.execute({ enabled: true }, { signal }));
    expect(r.ok).toBe(true);
    expect(r.data?.voiceMode).toBe(true);
    expect(useVoiceStore.getState().voiceMode).toBe(true);
    expect(localStorageStub.getItem("advocate-voice-v1")).toBe("on");
  });

  it("disables narration and persists off", async () => {
    await j(setVoiceModeTool.execute({ enabled: true }, { signal }));
    const r = await j(setVoiceModeTool.execute({ enabled: false }, { signal }));
    expect(r.ok).toBe(true);
    expect(r.data?.voiceMode).toBe(false);
    expect(localStorageStub.getItem("advocate-voice-v1")).toBe("off");
  });

  it("works signed out (preference, not citizen data)", async () => {
    // no citizen sign-in happens anywhere in this file
    const r = await j(setVoiceModeTool.execute({ enabled: true }, { signal }));
    expect(r.ok).toBe(true);
  });
});

describe("announcements", () => {
  beforeEach(() => {
    useVoiceStore.getState().setVoiceMode(false);
    useAnnounceStore.setState({ message: null, seq: 0 });
  });

  it("announce pushes to the live region store and re-announces identical text", () => {
    announce("Grievance lodged. Your registration ID is PG-26-19619.");
    const a = useAnnounceStore.getState();
    expect(a.message).toContain("PG-26-19619");
    expect(a.seq).toBe(1);
    announce("Grievance lodged. Your registration ID is PG-26-19619.");
    expect(useAnnounceStore.getState().seq).toBe(2);
  });

  it("speak degrades gracefully without speechSynthesis (node/embedded)", async () => {
    const r = await j(speakAloudTool.execute({ text: "Hello citizen" }, { signal }));
    expect(r.ok).toBe(true);
    expect(r.data?.spoken).toBe(false);
  });
});

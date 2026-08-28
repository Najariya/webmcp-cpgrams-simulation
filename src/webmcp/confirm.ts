import { create } from "zustand";

/**
 * Human confirmation gate (v4 §28–§29).
 *
 * Flow: a consequential tool call computes a stable hash of its payload and
 * asks for approval → the page shows the exact payload to the citizen →
 * Confirm/Decline records a decision bound to that hash → the agent retries
 * the identical call, which now succeeds (or fails as declined).
 *
 * Guarantees:
 * - payload-hash binding (any field change → new hash → re-confirmation);
 * - 60-second single-use approvals;
 * - idempotency: an identical successful call replays the recorded result
 *   with `alreadyProcessed: true` instead of mutating again.
 */

const TTL_MS = 60_000;

export function hashPayload(value: unknown): string {
  const stable = (v: unknown): string => {
    if (v === null || typeof v !== "object") return JSON.stringify(v) ?? "null";
    if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`;
    const o = v as Record<string, unknown>;
    return `{${Object.keys(o).sort().map((k) => `${JSON.stringify(k)}:${stable(o[k])}`).join(",")}}`;
  };
  const s = stable(value);
  let h1 = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h1 ^= s.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193) >>> 0;
  }
  return h1.toString(16).padStart(8, "0");
}

export interface ConfirmRequest {
  action: string; // tool name
  payloadHash: string;
  title: string;
  rows: { k: string; v: string }[];
  createdAt: number;
}

interface Decision {
  approvedAt?: number;
  declinedAt?: number;
}

interface ConfirmState {
  request: ConfirmRequest | null;
  decisions: Record<string, Decision>;
  results: Record<string, { env: string; at: number }>; // `${tool}:${hash}` → recorded envelope
  ask: (r: Omit<ConfirmRequest, "createdAt">) => void;
  approve: () => void;
  decline: () => void;
  clearRequest: () => void;
  decisionFor: (hash: string) => Decision | undefined;
  recordResult: (tool: string, hash: string, envelope: string) => void;
  resultFor: (tool: string, hash: string) => string | undefined;
  /** v4 §29: a consequential tool stays replay-reachable briefly after success. */
  recentResult: (tool: string, maxAgeMs?: number) => boolean;
}

const REPLAY_WINDOW_MS = 60_000;

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  request: null,
  decisions: {},
  results: {},
  ask: (r) => set({ request: { ...r, createdAt: Date.now() } }),
  approve: () => {
    const req = get().request;
    if (!req) return;
    set((s) => ({
      decisions: { ...s.decisions, [req.payloadHash]: { approvedAt: Date.now() } },
      request: null,
    }));
  },
  decline: () => {
    const req = get().request;
    if (!req) return;
    set((s) => ({
      decisions: { ...s.decisions, [req.payloadHash]: { declinedAt: Date.now() } },
      request: null,
    }));
  },
  clearRequest: () => set({ request: null }),
  decisionFor: (hash) => get().decisions[hash],
  recordResult: (tool, hash, envelope) =>
    set((s) => ({ results: { ...s.results, [`${tool}:${hash}`]: { env: envelope, at: Date.now() } } })),
  resultFor: (tool, hash) => get().results[`${tool}:${hash}`]?.env,
  recentResult: (tool, maxAgeMs = REPLAY_WINDOW_MS) => {
    const r = get().results[`${tool}:last`];
    return Boolean(r && Date.now() - r.at <= maxAgeMs);
  },
}));

export type GateVerdict = "approved" | "declined" | "pending";

/** Check the gate for a payload hash, honouring the TTL and single use. */
export function checkGate(hash: string): GateVerdict {
  const d = useConfirmStore.getState().decisionFor(hash);
  if (!d) return "pending";
  if (d.approvedAt !== undefined) {
    if (Date.now() - d.approvedAt > TTL_MS) return "pending"; // expired → re-ask
    return "approved";
  }
  if (d.declinedAt !== undefined && Date.now() - d.declinedAt <= TTL_MS) return "declined";
  return "pending";
}

/** Consume an approval (single use). */
export function consumeApproval(hash: string): void {
  const d = useConfirmStore.getState().decisionFor(hash);
  if (d?.approvedAt !== undefined) {
    useConfirmStore.setState((s) => {
      const decisions = { ...s.decisions };
      delete decisions[hash];
      return { decisions };
    });
  }
}

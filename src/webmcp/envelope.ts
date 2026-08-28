/**
 * Universal result envelope (docs/03-TOOL-CONTRACTS.md §2) — voice-first contract.
 * Every tool returns a JSON *string* with { ok, summary, data | error, meta }.
 * `summary` is one short Hindi + English sentence meant to be read aloud verbatim.
 */

export interface EnvelopeOk<T> {
  ok: true;
  summary: string;
  data: T;
  meta: { tool: string; ts: string };
}

export interface ToolError {
  code:
    | "INVALID_ARG"
    | "PRECONDITION"
    | "PENDING_CONFIRMATION"
    | "CONFLICT"
    | "NOT_FOUND"
    | "RATE_LIMITED"
    | "ABORTED"
    | "INTERNAL";
  message: string;
  field?: string;
  hint?: string;
  retry?: boolean;
  retryAfterSec?: number;
}

export interface EnvelopeErr {
  ok: false;
  summary: string;
  error: ToolError;
  meta: { tool: string; ts: string };
}

export type Envelope<T> = EnvelopeOk<T> | EnvelopeErr;

const BUDGET = 1400; // chars for stringified data — Chrome guide caps tool output ~1.5K total

function budgetClip<T>(data: T): T {
  const json = JSON.stringify(data);
  if (json.length <= BUDGET) return data;
  // arrays: trim items instead of discarding everything
  if (Array.isArray(data)) {
    let keep = data.length;
    while (keep > 0 && JSON.stringify(data.slice(0, keep)).length + 60 > BUDGET) keep--;
    return { items: data.slice(0, keep), truncated: true, total: data.length } as unknown as T;
  }
  return { truncated: true, note: "Output clipped to budget; narrow your query." } as unknown as T;
}

export function ok<T>(tool: string, summary: string, data: T): string {
  const env: EnvelopeOk<T> = {
    ok: true,
    summary,
    data: budgetClip(data),
    meta: { tool, ts: new Date().toISOString() },
  };
  return JSON.stringify(env);
}

export function err(
  tool: string,
  summary: string,
  error: ToolError,
): string {
  const env: EnvelopeErr = { ok: false, summary, error, meta: { tool, ts: new Date().toISOString() } };
  return JSON.stringify(env);
}

/** Wrap any tool body: never throw — surface INTERNAL with a speakable summary. */
export async function guarded(
  tool: string,
  failSummaryHiEn: string,
  body: () => Promise<string>,
): Promise<string> {
  try {
    return await body();
  } catch (e) {
    return err(tool, failSummaryHiEn, {
      code: "INTERNAL",
      message: e instanceof Error ? e.message : String(e),
      hint: "Unexpected page error — tell the user something went wrong and to retry.",
      retry: true,
    });
  }
}

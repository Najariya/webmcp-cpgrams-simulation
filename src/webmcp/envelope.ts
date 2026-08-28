/**
 * Universal tool-result envelope (v4 §24–§25).
 * { ok, speakable, data|error } — speakable is ONE locale, never bilingual concatenation;
 * the locale follows the citizen's current interaction language (default en).
 */

export interface EnvelopeOk<T> {
  ok: true;
  speakable: string;
  data: T;
  nextActions?: string[];
  meta: { tool: string; ts: string };
}

export type ErrorCode =
  | "INVALID_ARGUMENT"
  | "NOT_FOUND"
  | "PRECONDITION_FAILED"
  | "CONFIRMATION_REQUIRED"
  | "CONFLICT"
  | "INTERNAL";

export interface ToolError {
  code: ErrorCode;
  message: string;
  field?: string;
  hint?: string;
  retry?: boolean;
}

export interface EnvelopeErr {
  ok: false;
  speakable: string;
  error: ToolError;
  meta: { tool: string; ts: string };
}

export type Envelope<T> = EnvelopeOk<T> | EnvelopeErr;

const BUDGET = 1400; // Chrome guide caps tool output ~1.5K chars total

function budgetClip<T>(data: T): T {
  const json = JSON.stringify(data);
  if (json.length <= BUDGET) return data;
  if (Array.isArray(data)) {
    let keep = data.length;
    while (keep > 0 && JSON.stringify(data.slice(0, keep)).length + 60 > BUDGET) keep--;
    return { items: data.slice(0, keep), truncated: true, total: data.length } as unknown as T;
  }
  return { truncated: true, note: "Output clipped to budget; narrow the query." } as unknown as T;
}

export function ok<T>(tool: string, speakable: string, data: T, nextActions?: string[]): string {
  const env: EnvelopeOk<T> = {
    ok: true,
    speakable,
    data: budgetClip(data),
    ...(nextActions?.length ? { nextActions } : {}),
    meta: { tool, ts: new Date().toISOString() },
  };
  return JSON.stringify(env);
}

export function err(tool: string, speakable: string, error: ToolError): string {
  const env: EnvelopeErr = { ok: false, speakable, error, meta: { tool, ts: new Date().toISOString() } };
  return JSON.stringify(env);
}

/** Wrap any tool body: never throw — surface INTERNAL with a speakable line. */
export async function guarded(tool: string, failSpeakable: string, body: () => Promise<string>): Promise<string> {
  try {
    return await body();
  } catch (e) {
    return err(tool, failSpeakable, {
      code: "INTERNAL",
      message: e instanceof Error ? e.message : String(e),
      hint: "Unexpected page error — tell the user something went wrong and suggest retrying.",
      retry: true,
    });
  }
}

/**
 * Text-size preference — 3 steps (100% / 112.5% / 125%) applied to the html
 * root font-size so every rem-based size in the app scales together.
 * Persisted under its own localStorage key (UI preference, not citizen data).
 */
export const TYPE_STEPS = [1, 1.125, 1.25] as const;
export const TYPE_STEP_LABELS = ["100%", "112.5%", "125%"] as const;
const KEY = "advocate-type-v1";

export function loadTypeStep(): number {
  try {
    const v = parseInt(localStorage.getItem(KEY) ?? "0", 10);
    return Number.isInteger(v) && v >= 0 && v < TYPE_STEPS.length ? v : 0;
  } catch {
    return 0;
  }
}

export function applyTypeStep(step: number): void {
  const i = Math.min(Math.max(step, 0), TYPE_STEPS.length - 1);
  document.documentElement.style.fontSize = `${16 * TYPE_STEPS[i]}px`;
}

export function saveTypeStep(step: number): void {
  try {
    localStorage.setItem(KEY, String(step));
  } catch {
    /* storage unavailable — preference stays session-only */
  }
}

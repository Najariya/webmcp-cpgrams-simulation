import { describe, expect, it } from "vitest";
import { err, ok } from "../src/webmcp/envelope";

describe("result envelope budgets (v4 §24, §26)", () => {
  it("keeps ordinary results within the ~1.5K Chrome budget", () => {
    const env = ok("get_sla_status", "survey", { cases: Array.from({ length: 20 }, (_, i) => ({ regId: `PG-26-${i}`, subject: "x".repeat(60), blob: "y".repeat(80) })) });
    expect(env.length).toBeLessThan(1600);
    const parsed = JSON.parse(env) as { data: { truncated?: boolean; total?: number } };
    expect(parsed.data.truncated).toBe(true);
  });

  it("trims arrays instead of discarding everything", () => {
    const env = ok("list", "l", Array.from({ length: 50 }, () => ({ text: "z".repeat(90) })));
    const parsed = JSON.parse(env) as { data: { items?: unknown[]; total?: number } };
    expect(parsed.data.items?.length).toBeLessThan(50);
    expect(parsed.data.total).toBe(50);
  });

  it("carries speakable + nextActions and the error taxonomy", () => {
    const okEnv = JSON.parse(ok("t", "s", { a: 1 }, ["send_reminder"]));
    expect(okEnv.speakable).toBe("s");
    expect(okEnv.nextActions).toEqual(["send_reminder"]);
    const errEnv = JSON.parse(err("t", "s", { code: "CONFIRMATION_REQUIRED", message: "m", hint: "h" }));
    expect(errEnv.ok).toBe(false);
    expect(errEnv.error.code).toBe("CONFIRMATION_REQUIRED");
    expect(errEnv.error.hint).toBe("h");
  });
});

describe("object-aware budget trimming (eval E02 regression)", () => {
  it("trims the array field inside an object, keeps scalars", () => {
    const env = ok("list_grievance_categories", "s", {
      categories: Array.from({ length: 30 }, (_, i) => ({ id: `cat-${i}`, title: "t".repeat(60) })),
      redressalTargetDays: 21,
    });
    const parsed = JSON.parse(env) as { data: { categories?: unknown[]; redressalTargetDays?: number; truncated?: boolean; total?: number } };
    expect(parsed.data.categories!.length).toBeLessThan(30);
    expect(parsed.data.redressalTargetDays).toBe(21);
    expect(parsed.data.truncated).toBe(true);
    expect(parsed.data.total).toBe(30);
  });
});

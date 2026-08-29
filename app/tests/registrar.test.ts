/**
 * Registrar deferral semantics (UAT round 4): a sync requested while a tool
 * execution is in flight must, at flush time, recompute the desired set
 * through the provider — NOT replay a stale snapshot. This is what keeps the
 * 60-second post-success replay window (alreadyProcessed) reachable: the
 * window only opens after the tool records its result, i.e. after the state
 * change that triggered the deferred sync.
 */
import { describe, expect, it } from "vitest";
import { registrar } from "../src/webmcp/registrar";
import type { ModelContextTool } from "../src/webmcp/types";

const signal = new AbortController().signal;
const tool = (name: string): ModelContextTool => ({
  name,
  title: name,
  description: name,
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  annotations: { readOnlyHint: true },
  execute: async () => "ok",
});

const names = () => registrar.intended().map((t) => t.name);

describe("registrar deferred flush", () => {
  it("flush recomputes fresh via the provider instead of a stale snapshot", async () => {
    let current: ModelContextTool[] = [];
    registrar.setProvider(() => [...current]);

    current = [tool("alpha")];
    registrar.requestSync();
    expect(names()).toEqual(["alpha"]);

    // state changes mid-execution (sync deferred), THEN the window opens
    registrar.beginExecution();
    current = [];
    registrar.requestSync(); // deferred — would drop alpha if snapshot-stale
    current = [tool("alpha"), tool("beta")]; // provider now sees the replay window
    await registrar.endExecution();

    expect(names()).toEqual(["alpha", "beta"]);

    // cleanup: back to empty
    current = [];
    registrar.requestSync();
    expect(names()).toEqual([]);
    registrar.setProvider(() => []);
  });
});

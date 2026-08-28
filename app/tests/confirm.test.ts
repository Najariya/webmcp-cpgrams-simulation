import { beforeEach, describe, expect, it } from "vitest";
import { checkGate, consumeApproval, hashPayload, useConfirmStore } from "../src/webmcp/confirm";

describe("human gate (v4 §28–§29)", () => {
  beforeEach(() => {
    useConfirmStore.setState({ request: null, decisions: {}, results: {} });
  });

  it("hashes payloads stably regardless of key order", () => {
    const a = hashPayload({ grievanceId: "PG-26-1", rating: "Poor" });
    const b = hashPayload({ rating: "Poor", grievanceId: "PG-26-1" });
    expect(a).toBe(b);
    expect(hashPayload({ grievanceId: "PG-26-2", rating: "Poor" })).not.toBe(a);
  });

  it("pending → approved → consumed (single use)", () => {
    const h = hashPayload({ x: 1 });
    expect(checkGate(h)).toBe("pending");
    useConfirmStore.getState().ask({ action: "submit_grievance", payloadHash: h, title: "t", rows: [] });
    useConfirmStore.getState().approve();
    expect(useConfirmStore.getState().request).toBeNull();
    expect(checkGate(h)).toBe("approved");
    consumeApproval(h);
    expect(checkGate(h)).toBe("pending");
  });

  it("decline is reported and does not auto-clear", () => {
    const h = hashPayload({ x: 2 });
    useConfirmStore.getState().ask({ action: "send_reminder", payloadHash: h, title: "t", rows: [] });
    useConfirmStore.getState().decline();
    expect(checkGate(h)).toBe("declined");
  });

  it("replay window: recent results stay reachable, stale ones drop", () => {
    expect(useConfirmStore.getState().recentResult("submit_grievance")).toBe(false);
    useConfirmStore.getState().recordResult("submit_grievance", "last", "{}");
    expect(useConfirmStore.getState().recentResult("submit_grievance")).toBe(true);
    useConfirmStore.setState((s) => {
      const results = { ...s.results, "submit_grievance:last": { env: "{}", at: Date.now() - 120_000 } };
      return { results };
    });
    expect(useConfirmStore.getState().recentResult("submit_grievance")).toBe(false);
  });
});

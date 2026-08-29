import { getModelContext, type ModelContextTool } from "./types";

/**
 * ToolRegistrar — maps app state → the set of WebMCP tools that should exist,
 * diffs, and registers/unregisters via per-tool AbortControllers (docs/03 §3).
 * Also tracks the "intended" registry so the transparency panel can render a
 * faithful simulation in browsers without WebMCP support.
 */
class ToolRegistrar {
  private controllers = new Map<string, AbortController>();
  private specs = new Map<string, ModelContextTool>();
  /** Bump on every change; consumers (panel) re-render via subscription. */
  private listeners = new Set<() => void>();
  /** v4 §23: defer reconciliation while tool invocations are in flight. */
  private activeExecutions = 0;
  private pending = false;
  /** Computes the CURRENT desired tool set on demand — a deferred flush must
   *  see state as of flush time (e.g. the post-success replay window that
   *  only opens after the tool records its result), not a stale snapshot. */
  private provider: (() => ModelContextTool[]) | null = null;
  version = 0;

  setProvider(fn: () => ModelContextTool[]): void {
    this.provider = fn;
  }

  get available(): boolean {
    return getModelContext() !== undefined;
  }

  intended(): ModelContextTool[] {
    return [...this.specs.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  /** Mark the start of a tool invocation (called by guarded()). */
  beginExecution(): void {
    this.activeExecutions += 1;
  }

  /** Mark the end; flush a deferred sync if this was the last invocation.
   *  The flush recomputes the desired set through the provider so replay
   *  windows opened during execution (recordResult) are honoured. */
  async endExecution(): Promise<void> {
    this.activeExecutions = Math.max(0, this.activeExecutions - 1);
    if (this.activeExecutions === 0 && this.pending) {
      this.pending = false;
      await this.sync(this.provider ? this.provider() : []);
    }
  }

  /** Request reconciliation now, or as soon as in-flight executions finish. */
  requestSync(): void {
    if (this.activeExecutions > 0) {
      this.pending = true;
      return;
    }
    void this.sync(this.provider ? this.provider() : []);
  }

  /** Sync registration to the desired tool-name set. */
  async sync(desired: ModelContextTool[]): Promise<void> {
    if (this.activeExecutions > 0) {
      this.pending = true; // complete current execution, then reconcile (fresh)
      return;
    }
    const mc = getModelContext();
    const desiredNames = new Set(desired.map((t) => t.name));

    // drop tools no longer desired (spec bookkeeping + live unregistration)
    for (const name of [...this.specs.keys()]) {
      if (!desiredNames.has(name)) {
        this.controllers.get(name)?.abort();
        this.controllers.delete(name);
        this.specs.delete(name);
      }
    }
    for (const tool of desired) {
      const existing = this.specs.get(tool.name);
      const changed =
        existing !== undefined &&
        (existing.description !== tool.description ||
          JSON.stringify(existing.inputSchema) !== JSON.stringify(tool.inputSchema));
      if (existing && !changed) continue;

      this.specs.set(tool.name, tool); // intended registry (also powers the sim view)
      if (!mc) continue; // no WebMCP in this browser — stay simulated

      this.controllers.get(tool.name)?.abort();
      this.controllers.delete(tool.name);
      const controller = new AbortController();
      try {
        await mc.registerTool(tool, { signal: controller.signal });
        this.controllers.set(tool.name, controller);
      } catch (e) {
        console.error(`[webmcp] registerTool(${tool.name}) failed:`, e);
      }
    }
    this.bump();
  }

  async unregisterAll(): Promise<void> {
    await this.sync([]);
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private bump(): void {
    this.version += 1;
    this.listeners.forEach((fn) => fn());
  }
}

export const registrar = new ToolRegistrar();

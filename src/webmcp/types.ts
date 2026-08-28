/**
 * Local typings for the WebMCP imperative API (spec draft, webmachinelearning/webmcp).
 * Kept local to avoid external type-package churn during the hackathon.
 */
export interface ToolAnnotations {
  readOnlyHint?: boolean;
  untrustedContentHint?: boolean;
}

export interface ModelContextTool {
  name: string;
  title?: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: ToolAnnotations;
  execute: (input: Record<string, unknown>, options: { signal: AbortSignal }) => Promise<string>;
}

export interface RegisterToolOptions {
  signal?: AbortSignal;
  exposedTo?: string[];
}

export interface RegisteredToolInfo {
  name: string;
  title?: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: ToolAnnotations;
  origin?: string;
}

export interface ModelContext {
  registerTool(
    tool: ModelContextTool,
    options?: RegisterToolOptions,
  ): Promise<void>;
  getTools(options?: { fromOrigins?: string[] }): Promise<RegisteredToolInfo[]>;
  executeTool(
    tool: RegisteredToolInfo,
    inputJson: string,
    options?: { signal?: AbortSignal },
  ): Promise<string>;
  addEventListener(type: "toolchange", listener: (ev: Event) => void): void;
  removeEventListener(type: "toolchange", listener: (ev: Event) => void): void;
}

declare global {
  interface Document {
    readonly modelContext?: ModelContext;
  }
}

export function getModelContext(): ModelContext | undefined {
  return typeof document !== "undefined" ? document.modelContext : undefined;
}

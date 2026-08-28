import { StrictMode, Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import "./index.css";
import App from "./App.tsx";
import { theme } from "./theme.ts";
import { desiredTools } from "./webmcp/tools.ts";

/** Dev-only: lets QA drive the golden journeys from the console. */
if (import.meta.env.DEV) {
  import("./webmcp/registrar.ts").then(({ registrar }) => {
    (window as unknown as Record<string, unknown>).__advocate = {
      tools: () => registrar.intended().map((t) => t.name),
      call: async (name: string, args: Record<string, unknown> = {}) => {
        const t = desiredTools(await import("./store.ts").then((m) => m.useAppStore.getState())).find((x) => x.name === name);
        if (!t) return JSON.stringify({ ok: false, error: { code: "NOT_FOUND", message: `tool ${name} not in current surface` } });
        return t.execute(args, { signal: new AbortController().signal });
      },
    };
  });
}

/** Dev error surface — keeps render crashes visible instead of a blank page. */
class Boundary extends Component<{ children: ReactNode }, { err: Error | null }> {
  state = { err: null as Error | null };
  static getDerivedStateFromError(err: Error) {
    return { err };
  }
  render() {
    if (this.state.err) {
      return (
        <div style={{ fontFamily: "monospace", padding: 24, whiteSpace: "pre-wrap" }}>
          <h2>Render error</h2>
          <pre>{String(this.state.err?.stack ?? this.state.err)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Boundary>
        <App />
      </Boundary>
    </ThemeProvider>
  </StrictMode>,
);

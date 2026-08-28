# Deployment runbook (Vercel)

Account ready: `agrawalnaveenb-6694` · team "naveen's projects" (`team_6f4ToBgtbzfczFfoBNQzvLYV`) · CLI logged in · $30 hackathon credits queued on the team.

**Standing rule (owner, 2026-08-28):** the agent never deploys to production and never changes the plan/payment setup. The agent prepares everything; the owner runs the production deploy (or explicitly approves it).

## Owner's production deploy (2 minutes, from `app/`)

```bash
cd app
npm run build          # tsc -b && vite build  (must pass)
vercel deploy --prod   # first run: accept defaults (Vite auto-detected), link to team "naveen's projects"
```

- The first `--prod` deploy creates the project and returns the live URL (`https://<project>.vercel.app`).
- Later updates: `vercel deploy --prod` again (or connect the GitHub repo for push-to-deploy).
- Keep the judged build frozen after submission (v4 §61).

## Agent-safe preview deploy (no production touch)

```bash
cd app && vercel deploy          # preview URL only, once a project exists
```

Note: on a brand-new project the very first `vercel` invocation creates the project *as* a production deployment — which is why the first deploy is reserved for the owner.

## Checks after any deploy

1. Open the URL → Home renders, "5 cases" visible, hero prompt copyable.
2. Transparency screen → tools listed (simulation view in normal browsers).
3. In Chrome 149+ with `chrome://flags/#enable-webmcp-testing`: registry shows live tools.
4. Narrow viewport (≤ 480 px): cards stack, no horizontal scroll.

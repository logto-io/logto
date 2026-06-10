---
name: logto-dev-environment
description: Bring up and verify the local Logto development environment end to end. Use when a coding agent or developer needs a working localhost stack for feature development, including runtime setup, dependency install, Postgres initialization, database seed/alteration, pnpm start:dev, service health checks, first admin setup, Console/Experience/API smoke tests, Experience /demo-app or first_screen walkthroughs, or screenshots as proof.
---

# Logto dev environment

Use this skill whenever a task depends on a working local Logto stack. Creating the first admin is part of environment initialization because it prepares tenant-level Console configuration. Treat screenshots as optional verification outputs, not as the purpose of the skill.

## Quick path

1. Read [references/dev-environment-workflow.md](references/dev-environment-workflow.md).
2. Use the machine's default Node.js and pnpm. Engine mismatch messages are warnings for local dev; ignore them unless a command actually exits nonzero.
3. Start or reuse Postgres on `5432` and set:

   ```bash
   export DB_URL="postgres://postgres:p0stgr3s@localhost:5432/logto"
   ```

4. Install/build only what is needed, seed the database, then run:

   ```bash
   pnpm start:dev
   ```

5. Verify:
   - Core user endpoint: `http://localhost:3001`
   - Core admin endpoint: `http://localhost:3002`
   - Console Vite: `http://localhost:5002/console`
   - Experience Vite: `http://localhost:5001`

6. Create or reuse the first admin account, then pick any additional verification that matches the task: API health checks, Experience flow, route-specific smoke test, or screenshot proof.

## Admin account

Always complete first admin creation or confirm an admin already exists. This initializes tenant and Console configuration used by later development workflows. Prefer a deterministic local-only account for automation:

```text
username: admin
password: LogtoAdmin123!
```

If an admin already exists, log in instead of trying to recreate it. If the password fails, inspect the local database or create a new admin only if the task permits resetting local dev data.

## Verification paths

- Backend/API readiness: use curl against Core endpoints and Management/API routes relevant to the change.
- Console readiness: log in with the local admin at `http://localhost:3002/console` and verify the target page.
- End-user flow readiness: configure sign-in experience for the path under test, then use the built-in demo app at `http://localhost:3001/demo-app` to trigger the OIDC sign-in flow.
- Screenshot proof: use the normal browser/screenshot tools available to the agent and save screenshots outside the repo unless the user asks for a PR asset.

## Testing after feature work

Choose the smallest check that proves the changed behavior:

- Local setup change: run the full bootstrap path and service health checks.
- Console UI change: use browser automation against `http://localhost:3002/console/...` and capture a screenshot when visual proof is useful.
- End-user auth flow change: use the sign-in experience setup notes in the workflow reference, then trigger the flow with the built-in demo app.
- File/avatar upload change: combine with [logto-local-storage](../logto-local-storage/SKILL.md).
- Backend-only change: use curl/API checks first, then Console only if the workflow is user-visible.

Do not report success until the browser reaches the target page and the screenshot or smoke-test assertion proves the requested workflow.

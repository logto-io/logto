# Dev environment workflow

Use this workflow to make localhost Logto reliable before feature work, debugging, screenshots, or smoke tests. The first admin setup is part of environment initialization because it prepares tenant-level Console configuration.

## Runtime

Use the machine's default Node.js and pnpm:

```bash
node --version
pnpm --version
```

The repository may print Node or pnpm engine mismatch warnings in local development. Treat them as informational and keep going unless the command exits nonzero for a concrete reason.

## Install and build

Install dependencies:

```bash
pnpm install
```

If `pnpm install` is blocked by orphan connector folders without `package.json`, remove only those untracked orphan folders. Do not remove tracked connector packages.

Build the CLI dependency chain before seeding:

```bash
pnpm --filter @logto/cli... prepack
```

For a full Core/Console/Experience dev run, prebuild useful generated artifacts:

```bash
pnpm --filter @logto/core... --filter @logto/console... --filter @logto/experience... prepack
```

If `@logto/translate` or `@logto/tunnel` watch reports missing `./package-json.js`, run:

```bash
pnpm --filter @logto/translate prepare:package-json
pnpm --filter @logto/tunnel prepare:package-json
```

## Database

Start Docker if needed, then start or reuse Postgres:

```bash
docker run -d --name logto-postgres \
  -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=p0stgr3s \
  -e POSTGRES_DB=logto \
  postgres:17-alpine

for i in {1..30}; do
  docker exec logto-postgres pg_isready -U postgres -d logto >/dev/null 2>&1 && break
  sleep 1
done

export DB_URL="postgres://postgres:p0stgr3s@localhost:5432/logto"
```

If the container already exists, start it instead:

```bash
docker start logto-postgres
```

Seed a fresh database:

```bash
pnpm cli db seed --disable-admin-pwned-password-check
```

Use `--disable-admin-pwned-password-check` for local/offline automation so first admin creation does not hang on HIBP checks. It applies to the admin tenant's seeded sign-in experience.

If Core exits with undeployed alterations on an existing database:

```bash
pnpm alteration deploy
pnpm alteration deploy next
```

Use the version from `packages/schemas/package.json` when the command asks for one.

## Start dev

Run from repo root with `DB_URL` set:

```bash
pnpm start:dev
```

Wait for:

```text
Core app is running at http://localhost:3001/
Admin app is running at http://localhost:3002/
Console Vite: http://localhost:5002/console
Experience Vite: http://localhost:5001/
```

Expected local warnings:

- Redis warning: OK unless the task needs Redis.
- Connector load errors: expected in dev because `start:dev` excludes connector builds.
- PostHog missing token in browser console: OK for local OSS dev.
- `koa-proxies` "Http response closed while proxying" can happen when an automated browser closes during Vite module loading; it is not usually a blocker.

General health checks:

```bash
curl -fsS http://localhost:3001/oidc/.well-known/openid-configuration | head -c 200
curl -fsSI http://localhost:3002/console/dashboard | head
curl -fsSI http://localhost:5002/console | head
```

## Create the first admin

Always complete this step after services are running, even for non-Console feature work. Creating the first admin initializes tenant-level Console configuration that later development flows rely on.

First-run flow:

1. Open `http://localhost:3002/`.
2. Expect redirect to `/console/welcome`.
3. Click **Create account**.
4. Register username `admin`.
5. Set password `LogtoAdmin123!`.
6. Wait for `http://localhost:3002/console`.

Existing-admin flow:

1. Open `http://localhost:3002/console`.
2. If redirected to `sign-in?app_id=admin-console`, fill:
   - identifier: `admin`
   - password: `LogtoAdmin123!`
3. Submit and wait until the path starts with `/console` and does not include `/callback`.

If the admin password fails, inspect the local database or reset local dev data only when the task permits it.

## End-user flow checks

Use this section when testing features that affect end users during sign-up, sign-in, consent, password setup, profile collection, connectors, MFA, or other Experience-driven authentication flows.

The key is to configure sign-in experience so the intended end-user path exists, then use a client application to trigger the OIDC sign-in flow. The built-in demo app is the preferred local trigger because it requires no database app row and starts the same browser flow a real app would start.

Set dev API helpers. Non-production Core skips bearer token for these API calls:

```bash
export API=http://localhost:3001/api
export HDR='-H development-user-id: dev -H Content-Type: application/json'
```

Baseline username + password sign-up/sign-in. Use this when the feature under test does not require a more specific SIE configuration:

```bash
curl -s -X PATCH "$API/sign-in-exp" $HDR -d '{
  "signInMode": "SignInAndRegister",
  "signUp": { "identifiers": ["username"], "password": true, "verify": false },
  "signIn": {
    "methods": [{
      "identifier": "username",
      "password": true,
      "verificationCode": false,
      "isPasswordPrimary": true
    }]
  }
}'
```

Useful inspection calls:

```bash
curl -s "$API/sign-in-exp" $HDR | jq '{signInMode, signUp, signUpProfileFields}'
curl -s "$API/custom-profile-fields" $HDR | jq '[.[] | {name, type, required}]'
```

Demo app entry points:

| URL | Purpose |
|-----|---------|
| `http://localhost:3001/demo-app` | Trigger the default end-user sign-in flow (`client_id = demo-app`) |
| `http://localhost:3001/demo-app?first_screen=register` | Trigger the flow with registration first |
| `http://localhost:3001/demo-app?first_screen=sign_in` | Trigger the flow with sign-in first |

Query params are forwarded to the OIDC authorize request. Endpoint is `window.location.origin` (Core on `3001`). Console Sign-in experience -> Live preview uses the same URL with saved SIE.

Optional: open the dev panel on the demo-app congrats screen to edit `signInExtraParams`, `prompt`, or `scope` in local storage.

Dev password policy may reject passwords that look like user info or are too simple. Use a strong unique password for demo accounts when registration fails validation.

## Reset local data

Only reset local data when the user asks or the task explicitly allows it:

```bash
docker rm -f logto-postgres
docker run -d --name logto-postgres \
  -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=p0stgr3s \
  -e POSTGRES_DB=logto \
  postgres:17-alpine
```

Then seed again.

## Test selection

Use focused checks:

- Environment readiness only: service startup logs plus OIDC/Console/Experience health checks.
- Screenshot proof: use the agent's normal browser/screenshot workflow for the feature under test.
- Console route smoke test: navigate directly to the changed route, assert stable page text, capture screenshot.
- Core API behavior: `curl` with `development-user-id: dev` where applicable, or Management API token flow if the route requires it.
- Experience sign-in/sign-up: configure SIE if needed, then use `http://localhost:3001/demo-app`.
- Upload/avatar: use `logto-local-storage` first, restart Core, then test.

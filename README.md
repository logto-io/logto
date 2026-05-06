<p align="center">
  <a href="https://logto.io/?utm_source=github&utm_medium=readme" target="_blank" align="center" alt="Go to Logto website">
    <picture>
      <source width="200" media="(prefers-color-scheme: dark)" srcset="https://github.com/logto-io/.github/raw/master/profile/logto-logo-dark.svg">
      <source width="200" media="(prefers-color-scheme: light)" srcset="https://github.com/logto-io/.github/raw/master/profile/logto-logo-light.svg">
      <img width="200" src="https://github.com/logto-io/logto/raw/master/logo.png" alt="Logto logo">
    </picture>
  </a>
</p>

# Logto Blacktop

[Logto](https://github.com/logto-io/logto) is an amazing platform. Seriously. Modern auth, OIDC/OAuth 2.1/SAML, multi-tenancy, enterprise SSO, RBAC, all out of the box. We love it.

We wanted more features. So we added them here.

Everything added in this fork gets submitted back to upstream Logto as a PR. They merge it if they want to. If they do not? Welp. Their thing. The feature is available here regardless.

### Why Blacktop?

The Toyota 4A-GE Blacktop is a cool motor. That is all.

---

## Database Migrations

Because this fork cherry-picks features from different branches, some alterations reference columns that do not exist yet in your database. The Logto CLI tracks deployments by timestamp and will skip any alteration older than the current state, even if the column is missing.

**You must run the alteration deploy command after every rebuild:**

```bash
docker compose run --rm --entrypoint "" logto npx @logto/cli db alteration deploy latest
```

If the CLI says "Found 0 alteration to deploy" but Logto crashes with a "column does not exist" error, check which columns are missing and apply them manually:

```bash
docker compose exec postgres psql -U postgres -d logto -c "\d users"
docker compose exec postgres psql -U postgres -d logto -c "\d sign_in_experiences"
docker compose exec postgres psql -U postgres -d logto -c "\d oidc_session_extensions"
```

You can also list what the CLI thinks is pending:

```bash
docker compose run --rm --entrypoint "" logto npx @logto/cli db alteration list latest
docker compose run --rm --entrypoint "" logto npx @logto/cli db alteration list next
```

The SQL for each Blacktop alteration is in `packages/schemas/alterations/`. Each file is a plain TypeScript module with an `up` function containing the exact SQL. Read the file, run the SQL manually if needed, then restart.

```bash
docker compose restart logto
```

---

## Merged PRs (not yet in official Logto)

These are PRs submitted to `logto-io/logto` by community members. They have been reviewed, approved (or close to it), but not merged into `master`. They are merged into Logto Blacktop and ready to use.

### [#8728](https://github.com/logto-io/logto/pull/8728), [#8729](https://github.com/logto-io/logto/pull/8729), [#8731](https://github.com/logto-io/logto/pull/8731) - `isCurrent` flag on session listings

by [@simeng-li](https://github.com/simeng-li)

Three stacked PRs that together add an `isCurrent` boolean to the `GET /api/my-account/sessions` response, so clients can tell which session in the list is the one making the request (i.e. "this device").

- **#8728** plumbs the OIDC session UID from the access token through `koaOidcAuth` into `ctx.auth.sessionUid`. Small groundwork change, no consumer yet.
- **#8729** uses that `sessionUid` to tag the matching entry in `GET /api/my-account/sessions` with `isCurrent: true` (others get `false`). Initially behind a dev-features flag.
- **#8731** removes the dev-features gate and ships `isCurrent` unconditionally to production. Also updates the OpenAPI docs.

> The feature below is built on top of these three PRs.

### [#8752](https://github.com/logto-io/logto/pull/8752) - `userIds` in organization membership webhooks

by [@chiche84](https://github.com/chiche84)

When users are added to or removed from an organization, the `Organization.Membership.Updated` webhook payload now includes a `userIds` array. Previously the payload only contained the organization object, forcing consumers to make a follow-up API call to find out who was affected. Two lines of code, zero risk.

### [#8747](https://github.com/logto-io/logto/pull/8747) - Email connector URL detection fix

by [@aayushbaluni](https://github.com/aayushbaluni)

The URL validation regex in the email connector was flagging company names like `Company p.s.a.` as URLs, blocking valid `companyInformation` config values. The fix requires an explicit `https://` scheme or a `www.` prefix before treating a string as a URL. Dotted abbreviations no longer trigger false positives.

### [#8643](https://github.com/logto-io/logto/pull/8643) - Password expiration

by [@tevass](https://github.com/tevass)

Full end-to-end password expiration feature. Configure a maximum password age and an optional reminder window in the Admin Console. When a user's password is close to expiring, the sign-in experience shows a reminder modal with the option to reset now or continue. When expired, it blocks sign-in and forces a reset.

- Admin Console controls under Security > Password Policy: enable expiration, set validity period in days, set reminder period in days
- "Expire password" button on the user detail page to manually force a reset on next sign-in
- New API: `PATCH /admin/users/:userId` accepts `isPasswordExpired: true`
- DB: `password_expiration` policy column on `sign_in_experiences`, `is_password_expired` flag on `users`, `password_updated_at` on `users`
- i18n in 20 languages (ar, cs, de, en, es, fr, it, ja, ko, pl, pt-br, pt-pt, ru, th, tr, uk, zh-cn, zh-hk, zh-tw)
- All review comments addressed. gao-sun and wangsijie reacted with hearts on the PR.

---

## Original Features

> **Note:** The feature below is built on top of PRs #8728, #8729, and #8731.

### Session Last Active Tracking + Heartbeat API

An original feature built for this fork.

Adds a `last_active_at` timestamp to each session and keeps it up to date automatically:

- New `last_active_at` column in `oidc_session_extensions`, with database migration
- `POST /api/my-account/sessions/heartbeat` endpoint, call this to mark a session alive
- `lastActiveAt` is exposed in the sessions API response and typed in schemas
- Admin Console sessions table now has a "Last Active" column
- i18n keys included

Combined with `isCurrent`, this gives you a full picture of user sessions: which one is current, when each was last active, and the ability to revoke any of them.

#### Client integration (Next.js)

The heartbeat is wired up in three pieces. The server action calls the Logto endpoint. Using a Server Action rather than a fetch to an API route keeps the correct Next.js cookie context:

```ts
// logto-kit/logic/actions/heartbeat.ts
'use server';

import { makeRequest } from './request';

export async function recordHeartbeat(): Promise<void> {
  try {
    await makeRequest('/api/my-account/sessions/heartbeat', { method: 'POST' });
  } catch {
    // Best-effort, silently absorb all errors.
  }
}
```

The client component calls that action every 30 seconds while the tab is visible, and immediately when the user switches back to the tab:

```tsx
// logto-kit/components/handlers/session-heartbeat.tsx
'use client';

import { useEffect, useRef } from 'react';
import { recordHeartbeat } from '../../logic/actions/heartbeat';

const PING_INTERVAL_MS = 30_000;
const DEBOUNCE_MS = 10_000;

export default function SessionHeartbeat() {
  const lastPingRef = useRef<number>(0);

  useEffect(() => {
    const ping = () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      if (now - lastPingRef.current < DEBOUNCE_MS) return;
      lastPingRef.current = now;
      recordHeartbeat().catch(() => {});
    };

    ping(); // fire on mount

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') ping();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const intervalId = setInterval(ping, PING_INTERVAL_MS);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, []);

  return null;
}
```

Drop it in the root layout and it runs on every page with no further wiring needed:

```tsx
// app/layout.tsx
import SessionHeartbeat from './logto-kit/components/handlers/session-heartbeat';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionHeartbeat />
        {children}
      </body>
    </html>
  );
}
```

---

## License

[MPL-2.0](LICENSE) - same as upstream Logto.

## Other Changes from Upstream

### Cloud upsell content removed

All "Try Cloud", "Explore Logto Cloud", "Logto Cloud Pricing", and similar SaaS upsell messaging has been stripped from the Admin Console across all 17 locales. The i18n keys are preserved with empty or neutral self-hosted values so nothing breaks at runtime. The `oss-upsell` utility now returns `#` instead of building `cloud.logto.io` URLs, and `openCloudUpsell` is a no-op.

This is a self-hosted fork. You already chose to self-host. You do not need to be sold on the cloud version every time you open the console.

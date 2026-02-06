# Account Center

The Logto account center app that allows users to manage their account settings, profile, and security options.

## Authentication Behavior

Account Center runs inside the same browser session as other applications. This creates a potential
stale-login issue: another app may trigger a global `end_session` logout, which invalidates the
server-side session, but the SDK may still consider the user "authenticated" based on cached tokens.

To avoid showing the wrong user or a "ghost" session, Account Center treats the `/api/my-account`
response as the source of truth:

- We still use `isAuthenticated` to decide whether to start the login flow.
- We verify the session by fetching user info (`/api/my-account`).
- If that request fails (e.g. 401), we force `prompt=login` to obtain a fresh session.

This removes stale state without causing redirect loops (we only re-login on request error, not
on a temporary `userInfo` absence).

### Reserved Scopes and Refresh Token Policy

The Logto client SDK automatically adds reserved scopes (`openid`, `offline_access`, `profile`) by
default. For Account Center we disable this behavior and explicitly include only the scopes we need:

- `includeReservedScopes: false`
- `scopes: ['openid', 'profile', 'email', 'phone', 'identities']`

This keeps refresh tokens **session-bound** (no `offline_access`) so they are revoked when the
session is terminated by `end_session` in another app.

Account Center is a built-in application (not stored in the DB), so its `alwaysIssueRefreshToken`
policy is configured in the core adapter rather than via application-level settings.

## Development

```bash
pnpm dev
```

## Import Guidelines

This package uses path aliases for cleaner imports:

- `@ac/*` - Account center source files (`./src/*`)
- `@experience/*` - Experience package shared files

### Important: Experience Package Imports

When importing from the experience package, **only import from the `shared` folder**:

```typescript
// ✅ Correct - importing from shared folder
import Button from '@experience/shared/components/Button';
import SmartInputField from '@experience/shared/components/InputFields/SmartInputField';

// ❌ Incorrect - importing from non-shared folders
import { validateIdentifierField } from '@experience/utils/form';
import useSendVerificationCode from '@experience/hooks/use-send-verification-code';
```

### Why This Restriction?

1. **Shared folder** (`@experience/shared/*`) contains components and utilities designed to be reused across packages
2. **Non-shared folders** may have dependencies, hooks, or context providers that are specific to the experience package's internal architecture
3. Importing non-shared code can cause:
   - Missing context providers
   - Circular dependencies
   - Build/runtime errors

### What To Do Instead

If you need functionality from `@experience/utils/*` or other non-shared locations:

1. **Use shared packages** - Check if `@logto/core-kit`, `@logto/schemas`, or `@logto/shared` has what you need
2. **Re-implement locally** - Simple utilities can be implemented in account-center
3. **Move to shared** - If the utility is truly reusable, consider moving it to `@experience/shared/`

### Available Shared Packages

- `@logto/core-kit` - Core utilities like `emailRegEx` for validation
- `@logto/schemas` - TypeScript types and schemas
- `@logto/phrases-experience` - i18n translations
- `@logto/shared/universal` - Universal utilities (browser + Node.js compatible)

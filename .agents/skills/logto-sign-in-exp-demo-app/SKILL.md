---
name: logto-sign-in-exp-demo-app
description: Configure Logto sign-in experience and open built-in demo-app for Experience UI screenshots, Live preview, sign-up/sign-in, or collect user profile flows. Use when capturing PR screenshots, /demo-app, signUpProfileFields, first_screen=register, or end-user auth walkthroughs.
---

# Sign-in experience + demo-app

## When to use

- **PR or doc screenshots** of Experience (sign-in, sign-up, collect profile, consent)
- Console **Live preview** in Sign-in experience editor
- Reproducing a specific SIE configuration in the browser
- Validating layout after `signUpProfileFields` / branding changes

**Not needed** for backend-only changes with no Experience UI.

Seed `sign-in-exp` defaults are minimal; configure before opening `/demo-app` or you will not see the screens you need.

## Prerequisites

- [Development environment](../../../AGENTS.md#starting-the-development-environment) running
- For **avatar** in collect profile: run [logto-local-storage](../logto-local-storage/SKILL.md) first

## Quick path

1. Set dev API helpers (non-production Core skips bearer token):

   ```bash
   export API=http://localhost:3001/api
   export HDR='-H development-user-id: dev -H Content-Type: application/json'
   ```

2. Apply a baseline sign-in experience — full examples in [references/api-setup.md](references/api-setup.md).

3. Open Experience:
   - **http://localhost:3001/demo-app** — built-in Live Preview (`client_id = demo-app`, no DB app row)
   - **?first_screen=register** or **?first_screen=sign_in** for the first screen
   - Console Sign-in experience → **Live preview** uses the same URL with saved SIE

4. Optional: **Open dev panel** on demo-app congrats screen to edit `signInExtraParams`, `prompt`, `scope` (`localStorage`).

## demo-app essentials

| URL | Purpose |
|-----|---------|
| http://localhost:3001/demo-app | Default (redirects to Experience sign-in) |
| http://localhost:3001/demo-app?first_screen=register | Sign-up first |
| http://localhost:3001/demo-app?first_screen=sign_in | Sign-in first |

Query params are forwarded to the OIDC authorize request. Endpoint is `window.location.origin` (Core on **3001**).

## Collect user profile

- Create fields via `POST /api/custom-profile-fields`, then list them in `signUpProfileFields`.
- Use `[]` to enable with an explicit list; `null` means off.
- Built-in field names: `avatar`, `givenName`, `familyName`, `birthdate`, `gender`, `fullname`, … (see Console → Collect user profile).

Details and curl blocks: [references/api-setup.md](references/api-setup.md).

## Password policy note

Dev password policy may reject passwords that look like user info or are too simple. Use a strong unique password for demo accounts when registration fails validation.

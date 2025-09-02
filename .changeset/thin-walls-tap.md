---
"@logto/integration-tests": patch
"@logto/core": patch
---

fix(core): bind WebAuthn rpId to request domain for account api

- Before: WebAuthn registration via the account API always bound passkeys to the Logto default domain.
- After: The rpId now matches the domain you use to access the API (including custom domains), consistent with the experience flow.

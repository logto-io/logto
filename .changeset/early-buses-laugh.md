---
"@logto/core": patch
---

avoid delivering forgot-password verification codes to unknown accounts when dev features are enabled

This keeps connector and template validation while skipping message delivery for unknown email or phone identifiers in forgot-password flows.

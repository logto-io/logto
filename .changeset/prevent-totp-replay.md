---
"@logto/core": patch
---

prevent replaying an already accepted TOTP code during MFA verification

Existing TOTP verification now records the accepted TOTP time-step counter and rejects any later verification that matches the same or an older counter. This enforces one-time use for TOTP codes across the RFC 6238 acceptance window.

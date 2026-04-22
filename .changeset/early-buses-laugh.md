---
"@logto/core": patch
---

return a unified verification_code.code_mismatch error in forgot-password flows to prevent account enumeration

Forgot-password verification no longer exposes whether an email or phone exists through differing
error responses.

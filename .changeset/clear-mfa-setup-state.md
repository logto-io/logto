---
"@logto/core": patch
"@logto/account": patch
"@logto/phrases-experience": patch
---

show an incomplete setup state in Account Center when 2-step verification is enabled without a usable second factor

Account Center no longer promises a second verification step before a method is configured. It now distinguishes the user's preference from effective protection, reports missing setup with a clear enrollment hint, counts implicit email / phone factors and unused backup codes as configured methods, and shows a retry instead of a misleading state when the MFA data cannot be loaded. Exhausted backup codes are replaced when new codes are generated, the configured-factor check works when Account Center hides the email or phone field, and the off-state copy notes that security policies may still require verification.

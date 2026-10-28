---
"@logto/core": patch
"@logto/account": patch
"@logto/phrases-experience": patch
---

show an incomplete setup state in Account Center when 2-step verification is enabled without a usable second factor

Account Center no longer promises a second verification step before a method is configured. It now distinguishes the user's preference from effective protection, reports missing setup with a clear enrollment hint, counts implicit email / phone factors and unused backup codes as configured methods, and shows a retry instead of a misleading state when the MFA data cannot be loaded. The switch also reflects the persisted MFA enablement flag, treating legacy users without the flag as enabled only when they have a usable factor, and turning it on clears an explicit MFA disablement so the setting takes effect. Exhausted backup codes are replaced when new codes are generated and existing duplicate records resolve to the usable one, the configured-factor check works when Account Center hides the email or phone field, and the off-state copy notes that security policies may still require verification.

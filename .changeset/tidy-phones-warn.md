---
"@logto/connector-kit": minor
---

support magic link feature

- Removed `VerificationCodeType`: Since we are adding the magic link feature, `VerificationCodeType` is no longer precise for our use cases.
- Replaced `VerificationCodeType` with `TemplateType`.
- Removed `TemplateNotSupported` error code since it is useless for dynamic template checking.
- Added `link` property to `SendMessagePayload`.

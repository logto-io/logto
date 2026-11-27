---
"@logto/core": patch
"@logto/schemas": patch
---

migrate the deprecated `UserControlled` MFA policy to `PromptAtSignInAndSignUp`

Existing tenants stored with `mfa.policy: "UserControlled"` are migrated to `PromptAtSignInAndSignUp`, and new tenants are now seeded with `PromptAtSignInAndSignUp`. `PATCH /api/sign-in-exp` continues to accept `UserControlled` and normalizes it to `PromptAtSignInAndSignUp`, while `MfaPolicy.UserControlled` remains `@deprecated` in `@logto/schemas`.

---
"@logto/core": minor
"@logto/schemas": minor
"@logto/console": minor
"@logto/phrases": minor
---

add a tenant setting to turn off the "Add another 2-step verification" suggestion

When a user's only MFA factor is the email, phone number, or passkey they also sign in with, Logto suggests adding another factor during sign-up or sign-in. Turn off "Suggest adding another MFA factor" in Console > Multi-factor authentication > Policy, or set `mfa.skipAdditionalBindingSuggestion` to `true` in the sign-in experience, to never show this suggestion. Required MFA set-up, backup codes, and passkey prompts are not affected.

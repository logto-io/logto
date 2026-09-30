---
"@logto/core": minor
"@logto/experience": minor
"@logto/schemas": minor
---

support the `theme` authentication parameter to control the sign-in experience theme

Pass `theme=light` or `theme=dark` as an extra authentication parameter to render the sign-in experience in that theme instead of following the end-user's OS setting, so applications with their own light / dark toggle can keep Logto in sync. The override lasts for the whole authentication flow, including page reloads, social / SSO callbacks, and the consent page. It is ignored when dark mode is disabled in the sign-in experience settings, and unsupported values are ignored.

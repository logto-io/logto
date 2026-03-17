---
"@logto/console": minor
"@logto/core": minor
"@logto/integration-tests": minor
"@logto/phrases": minor
---

make adaptive MFA generally available across console configuration and core sign-in flows

This change removes the dev-only guard around adaptive MFA and ships the related behavior by default.

- In Console, the MFA settings page always exposes the adaptive MFA option and saves `adaptiveMfa` configuration in the sign-in experience payload.
- In Core, the sign-in flow always evaluates adaptive MFA rules against the current sign-in context and requires MFA verification when those rules are triggered.
- The sign-in context is now consistently persisted into interaction data, so custom-claims scripts can read it from `context.interaction.signInContext`.
- The `PostSignInAdaptiveMfaTriggered` webhook event is available without the dev feature flag and is emitted when adaptive MFA forces MFA during sign-in.

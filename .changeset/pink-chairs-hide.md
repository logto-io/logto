---
"@logto/console": minor
"@logto/core": minor
"@logto/integration-tests": minor
"@logto/phrases": minor
---

support adaptive MFA

- In Console, the MFA settings page always exposes the adaptive MFA option and saves `adaptiveMfa` configuration in the sign-in experience payload.
- In Core, when adaptive MFA is enabled in the sign-in experience config, the sign-in flow evaluates adaptive MFA rules against the current sign-in context and requires MFA verification when those rules are triggered.
- The sign-in context is now consistently persisted into interaction data, so custom-claims scripts can read it from `context.interaction.signInContext`.
- The `PostSignInAdaptiveMfaTriggered` webhook event is emitted when adaptive MFA forces MFA during sign-in.

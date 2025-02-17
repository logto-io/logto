---
"@logto/experience": patch
---

fix the email/phone identifier conflict handling logic during user registration.

When a user attempts to register with an email/phone that already exists:

### Previous Behavior

"Sign in instead" modal will be shown when:

- The email/phone identifier has been verified through a verification code validation
- Identifier type (email/phone) was enabled in sign-in methods

This caused an issue when:

- Only password authentication method was enabled in the sign-in method settings.
- When users clicked "Sign in instead" action button, the API call will throw an sign-in method not enabled error. Which is confusing for the user.

Expected behavior: Show the "Email/phone already exists" error modal directly. If only password authentication is enabled. User should not be able to sign in with email/phone directly.

### Fixed Behavior

Shows the "Sign in instead" modal if:

- The email/phone identifier type is enabled in the sign-in method settings and the verification code is enabled for the identifier.

Otherwise, shows the "Email/phone already exists" error modal directly.

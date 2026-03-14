---
"@logto/integration-tests": minor
"@logto/experience": minor
"@logto/console": minor
"@logto/core": minor
---

add a new MFA onboarding page for users to explicitly enable optional MFA

For users who are not required to set up MFA, we added a new page after credential verification in the sign-in flow to explicitly ask whether they want to enable optional MFA for better account security.

This is especially important when the passkey sign-in feature is available, since passkeys can be used for both sign-in and MFA verification, and users who set up a passkey for sign-in might not want to enable it as an MFA factor at the same time.

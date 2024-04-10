---
"@logto/experience": patch
---

## Bug fix: Addressed an issue where the terms of use were not clickable during new user registration flow via social and SSO sign-in.

Issue:
During the social and SSO sign-in callback, a global loading icon blocks all user interaction. If the IdP returned a new user identity, a terms of use agreement modal would appear, but the loading icon prevented users from clicking on it to proceed with registration.

Fix:
Resolved the issue by removing the loading status upon completion of the request.

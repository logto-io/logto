---
"@logto/console": minor
---

introduce user session management in Console.

Account center settings:

- Added a new `sessions` permission control for account API access, with `off`, `readOnly`, and `edit` options.

User sessions page:

- Added an Active sessions section on the user details page, listing the user's active sessions.
- Allow navigation to session details from the `Manage` button or a session entry.

User session details page:

- Added a session details page with a revoke action in the top bar.
- Revoking the session removes the sign-in session and revokes associated first-party app grants.
- Previously issued opaque access tokens and refresh tokens for those apps become invalid, and new auth requests require reauthentication.

---
"@logto/console": minor
---

introduce an "Authorized third-party apps" section on the user details page

- Added a new section under user details to list active third-party application authorizations for a user.
- Displayed app name, app ID, and access creation time for each authorized app.
- Added revoke action with confirmation modal.
- Revoking an app removes all active third-party grants associated with that app for the user.

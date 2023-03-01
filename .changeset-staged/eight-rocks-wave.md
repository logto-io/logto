---
"@logto/console": patch
"@logto/core": patch
---

## Refactor the Admin Console 403 flow

- Add 403 error handler for all AC API requests
- Show confirm modal to notify the user who is not authorized
- Click `confirm` button to sign out and redirect user to the sign-in page

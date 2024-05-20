---
"@logto/experience": patch
---

show global loading icon on page relocate

This is to address the issue where the user is redirected back to the client after a successful login, but the page is not yet fully loaded. This will show a global loading icon to indicate that the page is still loading. Preventing the user from interacting with the current sign-in page and avoid page idling confusion.

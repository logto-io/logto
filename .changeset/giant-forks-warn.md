---
"@logto/console": minor
---

add app-level concurrent device limit configuration in application details

- Added a new **Concurrent device limit** section to the Application details page.
- Developers can configure the max number of concurrent active grants (devices) per user for the current app.
- When configured, on each successful authorization, Logto checks the total active grants for the user in the current app and revokes the oldest grants if the limit is exceeded.

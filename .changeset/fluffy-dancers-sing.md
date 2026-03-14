---
"@logto/core-kit": minor
---

introduce new `UserScope.Sessions` scope

This change introduces a new `urn:logto:scope:sessions` user scope to the Logto system.

This new scope does not issue any additional user claims, but serves as a permission marker for accessing session-related endpoints in the user account API. By including this scope in the user's permissions, applications can enable features such as session management and session revocation for that user.

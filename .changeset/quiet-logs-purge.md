---
"@logto/core": minor
"@logto/phrases": patch
---

delete audit logs older than a given timestamp through the Management API

`DELETE /api/logs` takes an exclusive `before` timestamp, an optional exclusive `after` timestamp, and a `limit`. Each call deletes at most `limit` rows and reports `hasMore`, so operators can loop it to purge a large backlog while keeping every request bounded.

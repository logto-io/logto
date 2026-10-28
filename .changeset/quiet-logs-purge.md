---
"@logto/core": minor
"@logto/phrases": patch
---

delete audit logs older than a given timestamp through the Management API

`DELETE /api/logs` takes an exclusive `before` boundary, an optional exclusive `after` boundary, and a `limit`. Both boundaries are unix timestamps in milliseconds; `limit` defaults to 1000 and is capped at 10000. Each call deletes at most `limit` rows and reports `hasMore`, so operators can loop it to purge a large backlog while keeping every request bounded.

---
"@logto/core": minor
"@logto/phrases": patch
---

delete audit logs older than a given timestamp through the Management API

`DELETE /api/logs` takes an `end_time` boundary, an optional `start_time` boundary, and a `limit`. Both boundaries are unix timestamps in milliseconds with the same inclusive semantics as `GET /api/logs`; `limit` defaults to 1000 and is capped at 10000. Each call deletes at most `limit` audit log rows and reports `hasMore`, so operators can loop it to purge a large backlog while keeping every request bounded. Webhook delivery logs are left untouched.

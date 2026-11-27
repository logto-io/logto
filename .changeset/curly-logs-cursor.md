---
"@logto/core": minor
---

add cursor-based reading to the logs API

`GET /api/logs` now supports `pagination=cursor` for audit logs, returning the next cursor in the `Next-Cursor` header. Cursor mode requires a non-future `end_time`, uses a `limit` of 500 by default with a maximum of 1000, and leaves the existing page-based mode unchanged.

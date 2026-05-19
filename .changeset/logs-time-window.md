---
"@logto/core": minor
---

add `start_time` and `end_time` query parameters to `GET /api/logs` and `GET /api/hooks/{id}/recent-logs` for filtering logs by a time window.

Both are exclusive bounds in unix milliseconds (`createdAt > start_time AND createdAt < end_time`). Either value is optional; when both are present, the endpoint returns `400` if `start_time >= end_time`. Either value being non-numeric also returns `400`.

On `GET /api/hooks/{id}/recent-logs`, supplying either `start_time` or `end_time` replaces the endpoint's default 24-hour lower bound so callers can query an arbitrary historical window. Default behavior (no time params supplied) is unchanged: the endpoint still returns logs from the last 24 hours.

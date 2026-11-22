---
"@logto/core": minor
---

add a cursor-paginated log export API

`GET /api/logs/export` returns one time-window page of logs as JSON with an opaque `nextCursor`, so callers can write CSV or JSONL incrementally and resume after an interrupted download. Webhook delivery logs are included by default and can be excluded with `excludeWebhookLogs=true`.

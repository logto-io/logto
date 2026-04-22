---
"@logto/core": minor
---

add `POST /api/domains/cleanup` endpoint to clean up custom domains that have been inactive (not verified) for a configurable number of days. The endpoint uses Cloudflare as the source of truth to determine domain activity and returns a summary of scanned, deleted, skipped and failed domains.

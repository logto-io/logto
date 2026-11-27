---
"@logto/core": patch
---

keep MFA backup codes out of audit logs

Audit log entries no longer contain MFA backup codes in plain text. New entries leave them out or mask them when written. The logs API (`GET /api/logs`, `GET /api/logs/{id}`, and `GET /api/hooks/{id}/recent-logs`) also masks them, along with other sensitive fields, in entries saved before this change.

---
"@logto/console": patch
---

the Audit Logs page now opts into the count-cap behavior introduced in `@logto/core` by passing `?enableCap=true` to `GET /api/logs`.

For tenants with very large log volumes (more than 10,000 matching entries), the page renders a Prev/Next layout when the server reports a capped count instead of hitting `statement_timeout`.

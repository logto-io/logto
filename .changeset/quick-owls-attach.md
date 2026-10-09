---
"@logto/core": patch
---

speed up `GET /api/resources?includeScopes=true`

Matching scopes to their API resources no longer slows down quadratically with the number of resources, and the request no longer fails when a tenant has more than 65,535 API resources.

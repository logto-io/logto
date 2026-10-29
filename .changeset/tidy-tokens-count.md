---
"@logto/core": patch
---

count only the matching one-time tokens when listing them with a filter

`GET /api/one-time-tokens` reported the tenant's full one-time token count in the `Total-Number` header even when the request filtered by `email` or `status`. A client paginating a filtered list saw a total that did not describe its results and worked through pages that were never there. The header now counts only the tokens that match the filter.

---
"@logto/core": patch
---

list at most 100 issues in request validation errors

A `guard.invalid_input` error response now lists only the first 100 validation issues instead of every issue in an oversized invalid payload.

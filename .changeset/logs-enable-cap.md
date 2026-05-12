---
"@logto/core": minor
---

add `enableCap=true` query parameter to `GET /logs` and `GET /hooks/:id/recent-logs` to reduce the chance of `statement_timeout` on tenants with very large log volumes.

When the param is passed:

- The count query short-circuits at ~10,000 rows, returning `10001` as a saturation sentinel.
- The response includes a `Total-Number-Is-Capped: true` header when the cap is hit.
- In capped responses, both `Link: rel="last"` and `Link: rel="next"` are omitted because the saturated count makes the derived page count unreliable. Clients should construct page URLs themselves and stop on an empty response.

Default request behavior (without `enableCap`) is unchanged.

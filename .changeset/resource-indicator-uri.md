---
"@logto/core": patch
---

reject API resource indicators that are not valid URIs in `POST /api/resources`

The Management API accepted any string as the indicator of a new API resource, for example `not a uri`, and saved it. The Console already requires a valid URI, and OIDC rejects authorization requests for a resource indicator that is not an absolute URI, so a resource created this way could never be requested. The API now responds with `400 guard.invalid_input` instead.

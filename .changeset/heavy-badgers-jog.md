---
"@logto/core": patch
---

fix OpenAPI schema returned by the `GET /api/swagger.json` endpoint

1. The `:` character is invalid in parameter names, such as `organizationId:root`. These characters have been replaced with `-`.
2. The `tenantId` parameter of the `/api/.well-known/endpoints/{tenantId}` route was missing from the generated OpenAPI spec document, resulting in validation errors. This has been fixed.

---
"@logto/integration-tests": minor
"@logto/console": minor
"@logto/phrases": minor
"@logto/schemas": minor
"@logto/core": minor
---

support blocking token issuance when custom JWT scripts fail

This update adds configurable JWT customizer error handling for access tokens and client credentials flows.

- core now preserves `api.denyAccess()` as `access_denied` and converts other blocking-mode script failures into localized `invalid_request` responses
- console adds a dedicated `Error handling` tab for configuring the behavior, defaults `blockIssuanceOnError` to enabled for newly created scripts, keeps existing scripts without a saved value on the legacy disabled default, and aligns the related guidance copy
- schemas, phrases, and integration coverage are updated to match the new blocking behavior and localized error messages

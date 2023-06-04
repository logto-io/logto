---
"@logto/console": minor
"@logto/core": minor
"@logto/integration-tests": minor
"@logto/phrases": minor
"@logto/schemas": minor
---

Support setting default API Resource from Console and API

- New API Resources will not be treated as default.
- Added `PATCH /resources/:id/is-default` to setting `isDefault` for an API Resource.
  - Only one default API Resource is allowed per tenant. Setting one API default will reset all others.

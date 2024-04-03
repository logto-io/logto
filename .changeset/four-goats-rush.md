---
"@logto/integration-tests": patch
"@logto/phrases": patch
"@logto/core": patch
---

Not allow to modify management API resource through API.

Previously, management API resource and its scopes are readonly in Console. But it was possible to modify through the API. This is not allowed anymore. 

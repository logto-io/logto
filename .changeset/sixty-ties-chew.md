---
"@logto/integration-tests": patch
"@logto/core": patch
"@logto/api": patch
---

fix missing response bodies for user role assignment

- Fix POST/PUT `/users/:userId/roles` returning 201 without a response body
- Add integration tests that use the management API client for user role assignment
- Build `@logto/api` on prepack so generated types are available in CI

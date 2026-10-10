---
"@logto/core": patch
"@logto/console": patch
---

fix Console permission pickers timing out on tenants with many Management API resources

`GET /api/resources` now accepts an `excludeManagementApis` query parameter that filters out Logto Management API resources in the database. The Console permission pickers for third-party apps, dynamic apps, organization roles, and user roles use it instead of loading every resource and filtering in the browser.

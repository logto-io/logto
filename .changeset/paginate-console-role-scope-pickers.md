---
"@logto/console": patch
---

paginate and search role API resource permission pickers on the server

Role permission assignment modals now use server-side pagination, debounced server-side search, and server-side scope filtering (`hasScopes` and `excludeRoleId`) against `GET /api/resources`, preventing timeouts on tenants with a large number of API resources (such as machine-to-machine role permission pickers on tenants with many Management API resources).
